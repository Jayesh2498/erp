import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PURCHASE_ORDERS } from '@/lib/mockData'
import type { PurchaseOrder } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'sent' | 'paid' | 'cancelled' | 'confirmed'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', sent: 'sent', partially_received: 'confirmed',
  fully_received: 'paid', cancelled: 'cancelled',
}

export default function PurchaseOrdersList() {
  const navigate = useNavigate()
  const { items: orders } = useLocalStore<PurchaseOrder>('purchase-orders', MOCK_PURCHASE_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { document.title = 'Purchase Orders | ERP' }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = !search || o.number.toLowerCase().includes(search.toLowerCase()) || o.vendor_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  }), [orders, search, statusFilter])

  const columns: TableColumn<PurchaseOrder>[] = [
    {
      key: 'number', header: 'PO #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'vendor_name', header: 'Vendor', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.vendor_name}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'expected_date', header: 'Expected', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.expected_date ? formatDate(r.expected_date) : '—'}</span> },
    {
      key: 'total_amount', header: 'Amount', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.total_amount)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '130px',
      render: r => <GlassBadge variant={statusVariant[r.status] ?? 'neutral'}>{r.status.replace('_', ' ')}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Purchase Orders"
        subtitle={`${filtered.length} orders`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/purchasing/orders/new')}>New PO</GlassButton>}
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/purchasing/orders/${(row as unknown as PurchaseOrder).id}`)}
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <GlassSelect
            placeholder="All Statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'partially_received', label: 'Partially Received' },
              { value: 'fully_received', label: 'Fully Received' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        }
        emptyText="No purchase orders found"
      />
    </>
  )
}

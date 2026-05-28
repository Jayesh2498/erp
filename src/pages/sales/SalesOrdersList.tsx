import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_SALES_ORDERS } from '@/lib/mockData'
import type { SalesOrder } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'cancelled'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed',
  partially_invoiced: 'sent', fully_invoiced: 'paid', cancelled: 'cancelled',
}

export default function SalesOrdersList() {
  const navigate = useNavigate()
  const { items: orders } = useLocalStore<SalesOrder>('sales-orders', MOCK_SALES_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { document.title = 'Sales Orders | ERP' }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = !search || o.number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  }), [orders, search, statusFilter])

  const columns: TableColumn<SalesOrder>[] = [
    {
      key: 'number', header: 'SO #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'customer_name', header: 'Customer', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.customer_name}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'expected_delivery', header: 'Delivery', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.expected_delivery ? formatDate(r.expected_delivery) : '—'}</span> },
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
        title="Sales Orders"
        subtitle={`${filtered.length} orders`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/sales/orders/new')}>New Order</GlassButton>}
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/sales/orders/${(row as unknown as SalesOrder).id}`)}
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
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'partially_invoiced', label: 'Partially Invoiced' },
              { value: 'fully_invoiced', label: 'Fully Invoiced' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        }
        emptyText="No sales orders found"
      />
    </>
  )
}

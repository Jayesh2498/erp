import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVOICES } from '@/lib/mockData'
import type { Invoice } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'overdue' | 'cancelled'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed', partially_paid: 'sent',
  paid: 'paid', overdue: 'overdue', cancelled: 'cancelled', credited: 'cancelled',
}

export default function InvoicesList() {
  const navigate = useNavigate()
  const { items: invoices } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { document.title = 'Invoices | ERP' }, [])

  const filtered = useMemo(() => invoices.filter(i => {
    const matchSearch = !search || i.number.toLowerCase().includes(search.toLowerCase()) || i.customer_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || i.status === statusFilter
    return matchSearch && matchStatus
  }), [invoices, search, statusFilter])

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'number', header: 'Invoice #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'customer_name', header: 'Customer', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.customer_name}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'due_date', header: 'Due Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.due_date)}</span> },
    {
      key: 'total_amount', header: 'Amount', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.total_amount)}</span>,
    },
    {
      key: 'amount_due', header: 'Amount Due', align: 'right',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatCurrency(r.amount_due)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '120px',
      render: r => <GlassBadge variant={statusVariant[r.status] ?? 'neutral'}>{r.status.replace('_', ' ')}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Invoices"
        subtitle={`${filtered.length} invoices`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/sales/invoices/new')}>New Invoice</GlassButton>}
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/sales/invoices/${(row as unknown as Invoice).id}`)}
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
              { value: 'partially_paid', label: 'Partially Paid' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        }
        emptyText="No invoices found"
      />
    </>
  )
}

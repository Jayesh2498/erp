import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_BILLS } from '@/lib/mockData'
import type { Bill } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'overdue'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed', partially_paid: 'sent', paid: 'paid', overdue: 'overdue',
}

export default function BillsList() {
  const navigate = useNavigate()
  const { items: bills } = useLocalStore<Bill>('bills', MOCK_BILLS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { document.title = 'Bills | ERP' }, [])

  const filtered = useMemo(() => bills.filter(b => {
    const matchSearch = !search || b.number.toLowerCase().includes(search.toLowerCase()) || b.vendor_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || b.status === statusFilter
    return matchSearch && matchStatus
  }), [bills, search, statusFilter])

  const columns: TableColumn<Bill>[] = [
    {
      key: 'number', header: 'Bill #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'vendor_name', header: 'Vendor', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.vendor_name}</span> },
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
        title="Bills"
        subtitle={`${filtered.length} bills`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/purchasing/bills/new')}>New Bill</GlassButton>}
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/purchasing/bills/${(row as unknown as Bill).id}`)}
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
            ]}
          />
        }
        emptyText="No bills found"
      />
    </>
  )
}

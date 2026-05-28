import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_QUOTES } from '@/lib/mockData'
import type { Quote } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', sent: 'sent', accepted: 'paid', rejected: 'cancelled', expired: 'overdue',
}

export default function QuotesList() {
  const navigate = useNavigate()
  const { items: quotes } = useLocalStore<Quote>('quotes', MOCK_QUOTES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { document.title = 'Quotes | ERP' }, [])

  const filtered = useMemo(() => quotes.filter(q => {
    const matchSearch = !search || q.number.toLowerCase().includes(search.toLowerCase()) || q.customer_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || q.status === statusFilter
    return matchSearch && matchStatus
  }), [quotes, search, statusFilter])

  const columns: TableColumn<Quote>[] = [
    {
      key: 'number', header: 'Quote #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'customer_name', header: 'Customer', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.customer_name}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'valid_until', header: 'Valid Until', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.valid_until)}</span> },
    {
      key: 'total_amount', header: 'Amount', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.total_amount)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '110px',
      render: r => <GlassBadge variant={statusVariant[r.status] ?? 'neutral'}>{r.status}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Quotes"
        subtitle={`${filtered.length} quotes`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/sales/quotes/new')}>New Quote</GlassButton>}
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/sales/quotes/${(row as unknown as Quote).id}`)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quotes…"
        filters={
          <GlassSelect
            placeholder="All Statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
        }
        emptyText="No quotes found"
      />
    </>
  )
}

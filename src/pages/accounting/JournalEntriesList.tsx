import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_JOURNAL_ENTRIES } from '@/lib/mockData'
import type { JournalEntry } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate, formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function JournalEntriesList() {
  const navigate = useNavigate()
  const { items: entries } = useLocalStore<JournalEntry>('journal-entries', MOCK_JOURNAL_ENTRIES)

  useEffect(() => { document.title = 'Journal Entries | ERP' }, [])

  const columns: TableColumn<JournalEntry>[] = [
    {
      key: 'number', header: 'Entry #', width: '120px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'date', header: 'Date', width: '110px', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'description', header: 'Description', render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{r.description}</span> },
    { key: 'reference', header: 'Reference', render: r => <span style={{ color: tokens.color.text3, fontSize: 13 }}>{r.reference ?? '—'}</span> },
    {
      key: 'amount', header: 'Amount', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.lines.reduce((s, l) => s + l.debit, 0))}</span>,
    },
    {
      key: 'status', header: 'Status', width: '90px',
      render: r => <GlassBadge variant={r.status === 'posted' ? 'paid' : 'draft'}>{r.status}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Journal Entries"
        subtitle={`${entries.length} entries`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/accounting/journal-entries/new')}>New Entry</GlassButton>}
        columns={columns}
        data={entries as unknown as Record<string, unknown>[]}
        emptyText="No journal entries found"
      />
    </>
  )
}

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_DEBIT_NOTES } from '@/lib/mockData'
import type { DebitNote } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function DebitNotesList() {
  const navigate = useNavigate()
  const { items: debitNotes } = useLocalStore<DebitNote>('debit-notes', MOCK_DEBIT_NOTES)

  useEffect(() => { document.title = 'Debit Notes | ERP' }, [])

  const columns: TableColumn<DebitNote>[] = [
    {
      key: 'number', header: 'DN #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'vendor_name', header: 'Vendor', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.vendor_name}</span> },
    { key: 'bill_number', header: 'Bill Ref', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.bill_number ?? '—'}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    {
      key: 'total_amount', header: 'Amount', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.total_amount)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '100px',
      render: r => <GlassBadge variant={r.status === 'confirmed' ? 'confirmed' : 'draft'}>{r.status}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Debit Notes"
        subtitle={`${debitNotes.length} debit notes`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/purchasing/debit-notes/new')}>New Debit Note</GlassButton>}
        columns={columns}
        data={debitNotes as unknown as Record<string, unknown>[]}
        emptyText="No debit notes found"
      />
    </>
  )
}

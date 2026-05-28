import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CREDIT_NOTES } from '@/lib/mockData'
import type { CreditNote } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function CreditNotesList() {
  const navigate = useNavigate()
  const { items: creditNotes } = useLocalStore<CreditNote>('credit-notes', MOCK_CREDIT_NOTES)

  useEffect(() => { document.title = 'Credit Notes | ERP' }, [])

  const columns: TableColumn<CreditNote>[] = [
    {
      key: 'number', header: 'CN #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'customer_name', header: 'Customer', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.customer_name}</span> },
    { key: 'invoice_number', header: 'Invoice Ref', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.invoice_number}</span> },
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
        title="Credit Notes"
        subtitle={`${creditNotes.length} credit notes`}
        actions={<GlassButton variant="primary" icon={Plus} onClick={() => navigate('/sales/credit-notes/new')}>New Credit Note</GlassButton>}
        columns={columns}
        data={creditNotes as unknown as Record<string, unknown>[]}
        emptyText="No credit notes found"
        emptySubtext="Credit notes are created against invoices."
      />
    </>
  )
}

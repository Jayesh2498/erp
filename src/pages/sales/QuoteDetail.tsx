import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Send, Check, X, ClipboardList } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_QUOTES } from '@/lib/mockData'
import type { Quote } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', sent: 'sent', accepted: 'paid', rejected: 'cancelled', expired: 'overdue',
}

export default function QuoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workspace } = useAuth()
  const { items: quotes, update } = useLocalStore<Quote>('quotes', MOCK_QUOTES)
  const quote = quotes.find(q => q.id === id)

  useEffect(() => { document.title = `${quote?.number ?? 'Quote'} | ERP` }, [quote?.number])

  if (!quote) {
    return <div className="flex items-center justify-center min-h-[200px]" style={{ color: tokens.color.text3 }}>Quote not found.</div>
  }

  const changeStatus = (status: Quote['status']) => {
    update(id!, { status } as Partial<Quote>)
  }

  const actions = (
    <>
      {quote.status === 'draft' && (
        <>
          <GlassButton variant="secondary" icon={Edit2} size="sm" onClick={() => navigate(`/sales/quotes/${id}/edit`)}>Edit</GlassButton>
          <GlassButton variant="primary" icon={Send} size="sm" onClick={() => changeStatus('sent')}>Send</GlassButton>
        </>
      )}
      {quote.status === 'sent' && (
        <>
          <GlassButton variant="secondary" icon={X} size="sm" onClick={() => changeStatus('rejected')}>Reject</GlassButton>
          <GlassButton variant="primary" icon={Check} size="sm" onClick={() => changeStatus('accepted')}>Mark Accepted</GlassButton>
        </>
      )}
      {quote.status === 'accepted' && (
        <GlassButton variant="primary" icon={ClipboardList} size="sm" onClick={() => navigate(`/sales/orders/new?quoteId=${id}`)}>
          Create Sales Order
        </GlassButton>
      )}
    </>
  )

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={quote.number}
        subtitle={quote.customer_name}
        backHref="/sales/quotes"
        badges={
          <GlassBadge variant={statusVariant[quote.status] ?? 'neutral'}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </GlassBadge>
        }
        actions={actions}
        infoCards={[
          { label: 'Customer', value: quote.customer_name },
          { label: 'Date', value: formatDate(quote.date) },
          { label: 'Valid Until', value: formatDate(quote.valid_until) },
          { label: 'Branch', value: quote.branch ?? '—' },
        ]}
        tabs={[
          {
            key: 'lines',
            label: 'Line Items',
            content: (
              <LineItemsEditor
                lines={quote.lines as LineItem[]}
                onChange={() => {}}
                companyStateCode={workspace?.stateCode ?? '27'}
                customerStateCode="27"
                readOnly
              />
            ),
          },
          {
            key: 'details',
            label: 'Details',
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {quote.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>Notes</p>
                    <p className="text-sm" style={{ color: tokens.color.text2 }}>{quote.notes}</p>
                  </div>
                )}
                {quote.terms && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>Terms</p>
                    <p className="text-sm" style={{ color: tokens.color.text2 }}>{quote.terms}</p>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </>
  )
}

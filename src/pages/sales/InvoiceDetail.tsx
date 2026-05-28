import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Check, DollarSign, FileX } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton, GlassModal, GlassInput, GlassSelect, GlassCard } from '@/components/ui-kit'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVOICES } from '@/lib/mockData'
import type { Invoice, Payment } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate, formatCurrency, todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'overdue' | 'cancelled'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed', partially_paid: 'sent',
  paid: 'paid', overdue: 'overdue', cancelled: 'cancelled', credited: 'cancelled',
}

function genId() { return Math.random().toString(36).slice(2, 10) }

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workspace } = useAuth()
  const { items: invoices, update } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const invoice = invoices.find(i => i.id === id)

  const [paymentModal, setPaymentModal] = useState(false)
  const [payAmt, setPayAmt] = useState('')
  const [payDate, setPayDate] = useState(todayISO())
  const [payMethod, setPayMethod] = useState('NEFT')
  const [payRef, setPayRef] = useState('')

  useEffect(() => { document.title = `${invoice?.number ?? 'Invoice'} | ERP` }, [invoice?.number])

  if (!invoice) return <div style={{ color: tokens.color.text3 }}>Invoice not found.</div>

  const confirmInvoice = () => {
    update(id!, { status: 'confirmed', amount_due: invoice.total_amount } as Partial<Invoice>)
  }

  const recordPayment = () => {
    const amount = parseFloat(payAmt) || 0
    if (!amount) return
    const payment: Payment = { id: genId(), date: payDate, amount, method: payMethod, reference: payRef || undefined }
    const payments = [...(invoice.payments ?? []), payment]
    const newAmountDue = Math.max(0, invoice.amount_due - amount)
    const newStatus: Invoice['status'] = newAmountDue <= 0 ? 'paid' : 'partially_paid'
    update(id!, { payments, amount_due: newAmountDue, status: newStatus } as Partial<Invoice>)
    setPaymentModal(false)
    setPayAmt('')
    setPayRef('')
  }

  const actions = (
    <>
      {invoice.status === 'draft' && (
        <>
          <GlassButton variant="secondary" icon={Edit2} size="sm" onClick={() => navigate(`/sales/invoices/${id}/edit`)}>Edit</GlassButton>
          <GlassButton variant="primary" icon={Check} size="sm" onClick={confirmInvoice}>Confirm</GlassButton>
        </>
      )}
      {['confirmed', 'partially_paid', 'overdue'].includes(invoice.status) && (
        <>
          <GlassButton variant="secondary" icon={FileX} size="sm" onClick={() => navigate(`/sales/credit-notes/new?invoiceId=${id}`)}>Credit Note</GlassButton>
          <GlassButton variant="primary" icon={DollarSign} size="sm" onClick={() => { setPayAmt(String(invoice.amount_due)); setPaymentModal(true) }}>
            Record Payment
          </GlassButton>
        </>
      )}
    </>
  )

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={invoice.number}
        subtitle={invoice.customer_name}
        backHref="/sales/invoices"
        badges={<GlassBadge variant={statusVariant[invoice.status] ?? 'neutral'}>{invoice.status.replace('_', ' ')}</GlassBadge>}
        actions={actions}
        infoCards={[
          { label: 'Customer', value: invoice.customer_name },
          { label: 'Invoice Date', value: formatDate(invoice.date) },
          { label: 'Due Date', value: formatDate(invoice.due_date) },
          { label: 'Amount Due', value: formatCurrency(invoice.amount_due) },
        ]}
        tabs={[
          {
            key: 'lines',
            label: 'Line Items',
            content: (
              <LineItemsEditor
                lines={invoice.lines as LineItem[]}
                onChange={() => {}}
                companyStateCode={workspace?.stateCode ?? '27'}
                customerStateCode="27"
                readOnly
              />
            ),
          },
          ...(invoice.payments?.length ? [{
            key: 'payments',
            label: `Payments (${invoice.payments.length})`,
            content: (
              <div className="space-y-3">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-md" style={{ background: tokens.glass.inputBg, border: `1px solid ${tokens.glass.border}` }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{formatCurrency(p.amount)}</p>
                      <p className="text-xs" style={{ color: tokens.color.text3 }}>{p.method} · {p.reference ?? ''}</p>
                    </div>
                    <span className="text-sm" style={{ color: tokens.color.text2 }}>{formatDate(p.date)}</span>
                  </div>
                ))}
              </div>
            ),
          }] : []),
        ]}
      />

      {/* Record payment modal */}
      <GlassModal
        open={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Record Payment"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setPaymentModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={recordPayment}>Record Payment</GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassInput label="Amount" type="number" prefix="₹" value={payAmt} onChange={setPayAmt} required />
          <GlassInput label="Date" type="date" value={payDate} onChange={setPayDate} required />
          <GlassSelect
            label="Payment Method"
            value={payMethod}
            onChange={setPayMethod}
            options={[
              { value: 'NEFT', label: 'NEFT' },
              { value: 'RTGS', label: 'RTGS' },
              { value: 'IMPS', label: 'IMPS' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />
          <GlassInput label="Reference" value={payRef} onChange={setPayRef} placeholder="Transaction reference number" />
        </div>
      </GlassModal>
    </>
  )
}

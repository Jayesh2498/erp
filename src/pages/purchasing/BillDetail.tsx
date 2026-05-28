import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Check, DollarSign } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton, GlassModal, GlassInput, GlassSelect } from '@/components/ui-kit'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_BILLS } from '@/lib/mockData'
import type { Bill, Payment } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate, formatCurrency, todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'overdue'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed', partially_paid: 'sent', paid: 'paid', overdue: 'overdue',
}

function genId() { return Math.random().toString(36).slice(2, 10) }

export default function BillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workspace } = useAuth()
  const { items: bills, update } = useLocalStore<Bill>('bills', MOCK_BILLS)
  const bill = bills.find(b => b.id === id)

  const [paymentModal, setPaymentModal] = useState(false)
  const [payAmt, setPayAmt] = useState('')
  const [payDate, setPayDate] = useState(todayISO())
  const [payMethod, setPayMethod] = useState('NEFT')
  const [payRef, setPayRef] = useState('')

  useEffect(() => { document.title = `${bill?.number ?? 'Bill'} | ERP` }, [bill?.number])

  if (!bill) return <div style={{ color: tokens.color.text3 }}>Bill not found.</div>

  const confirmBill = () => {
    update(id!, { status: 'confirmed', amount_due: bill.total_amount } as Partial<Bill>)
  }

  const recordPayment = () => {
    const amount = parseFloat(payAmt) || 0
    if (!amount) return
    const payment: Payment = { id: genId(), date: payDate, amount, method: payMethod, reference: payRef || undefined }
    const payments = [...(bill.payments ?? []), payment]
    const newAmountDue = Math.max(0, bill.amount_due - amount)
    const newStatus: Bill['status'] = newAmountDue <= 0 ? 'paid' : 'partially_paid'
    update(id!, { payments, amount_due: newAmountDue, status: newStatus } as Partial<Bill>)
    setPaymentModal(false)
    setPayAmt('')
  }

  const actions = (
    <>
      {bill.status === 'draft' && (
        <>
          <GlassButton variant="secondary" icon={Edit2} size="sm" onClick={() => navigate(`/purchasing/bills/${id}/edit`)}>Edit</GlassButton>
          <GlassButton variant="primary" icon={Check} size="sm" onClick={confirmBill}>Confirm</GlassButton>
        </>
      )}
      {['confirmed', 'partially_paid', 'overdue'].includes(bill.status) && (
        <GlassButton variant="primary" icon={DollarSign} size="sm" onClick={() => { setPayAmt(String(bill.amount_due)); setPaymentModal(true) }}>
          Record Payment
        </GlassButton>
      )}
    </>
  )

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={bill.number}
        subtitle={bill.vendor_name}
        backHref="/purchasing/bills"
        badges={<GlassBadge variant={statusVariant[bill.status] ?? 'neutral'}>{bill.status.replace('_', ' ')}</GlassBadge>}
        actions={actions}
        infoCards={[
          { label: 'Vendor', value: bill.vendor_name },
          { label: 'Bill Date', value: formatDate(bill.date) },
          { label: 'Due Date', value: formatDate(bill.due_date) },
          { label: 'Amount Due', value: formatCurrency(bill.amount_due) },
        ]}
        tabs={[
          {
            key: 'lines',
            label: 'Line Items',
            content: (
              <LineItemsEditor
                lines={bill.lines as LineItem[]}
                onChange={() => {}}
                companyStateCode={workspace?.stateCode ?? '27'}
                customerStateCode="29"
                readOnly
              />
            ),
          },
          ...(bill.payments?.length ? [{
            key: 'payments',
            label: `Payments (${bill.payments.length})`,
            content: (
              <div className="space-y-3">
                {bill.payments.map(p => (
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
          <GlassInput label="Reference" value={payRef} onChange={setPayRef} />
        </div>
      </GlassModal>
    </>
  )
}

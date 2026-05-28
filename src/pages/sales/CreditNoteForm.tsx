import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton, GlassCheckbox } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CREDIT_NOTES, MOCK_INVOICES, MOCK_CONTACTS } from '@/lib/mockData'
import type { CreditNote, Invoice, Contact } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'

function nextNumber(items: CreditNote[]): string {
  const nums = items.map(c => parseInt(c.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `CN-${String(next).padStart(4, '0')}`
}

export default function CreditNoteForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invoiceId = searchParams.get('invoiceId')
  const { workspace } = useAuth()
  const { items: creditNotes, create } = useLocalStore<CreditNote>('credit-notes', MOCK_CREDIT_NOTES)
  const { items: invoices } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)

  const prefillInvoice = invoiceId ? invoices.find(i => i.id === invoiceId) : undefined
  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both')

  const [customerId, setCustomerId] = useState(prefillInvoice?.customer_id ?? '')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoiceId ?? '')
  const [date, setDate] = useState(todayISO())
  const [reason, setReason] = useState('')
  const [returnStock, setReturnStock] = useState(false)
  const [lines, setLines] = useState<LineItem[]>(prefillInvoice?.lines as LineItem[] ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'New Credit Note | ERP' }, [])

  const selectedCustomer = customers.find(c => c.id === customerId)
  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId)
  const customerInvoices = invoices.filter(i => i.customer_id === customerId && i.status !== 'draft')

  const customerStateCode = selectedCustomer?.state_code ?? '27'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!customerId || !selectedInvoiceId || !reason) { alert('Please fill all required fields.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    create({
      number: nextNumber(creditNotes),
      customer_id: customerId,
      customer_name: selectedCustomer?.name ?? '',
      invoice_id: selectedInvoiceId,
      invoice_number: selectedInvoice?.number ?? '',
      date, reason, status, return_stock: returnStock,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      lines,
      created_at: new Date().toISOString(),
    } as Omit<CreditNote, 'id'>)

    navigate('/sales/credit-notes')
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title="New Credit Note"
        backHref="/sales/credit-notes"
        onCancel={() => navigate('/sales/credit-notes')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Confirm"
        onSave={() => handleSave('confirmed')}
      >
        <FormSection title="Credit Note Details" columns={2}>
          <GlassSelect
            label="Customer"
            value={customerId}
            onChange={v => { setCustomerId(v); setSelectedInvoiceId(''); setLines([]) }}
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select customer…"
            required
          />
          <GlassSelect
            label="Against Invoice"
            value={selectedInvoiceId}
            onChange={v => {
              setSelectedInvoiceId(v)
              const inv = invoices.find(i => i.id === v)
              if (inv) setLines(inv.lines as LineItem[])
            }}
            options={customerInvoices.map(i => ({ value: i.id, label: i.number }))}
            placeholder="Select invoice…"
            required
          />
          <GlassInput label="Credit Note Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Reason" value={reason} onChange={setReason} required placeholder="e.g. Goods returned, damaged" />
          <div>
            <GlassCheckbox
              checked={returnStock}
              onChange={setReturnStock}
              label="Return goods to stock"
            />
          </div>
        </FormSection>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgb(var(--text-1))' }}>Line Items</h3>
            <LineItemsEditor
              lines={lines}
              onChange={setLines}
              companyStateCode={companyStateCode}
              customerStateCode={customerStateCode}
            />
          </div>
        </GlassCard>
      </FormPage>
    </>
  )
}

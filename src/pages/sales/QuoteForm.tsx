import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_QUOTES, MOCK_CONTACTS } from '@/lib/mockData'
import type { Quote, Contact } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, addDays } from '@/lib/format'

function nextNumber(items: Quote[]): string {
  const nums = items.map(q => parseInt(q.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `QT-${String(next).padStart(4, '0')}`
}

export default function QuoteForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { workspace } = useAuth()
  const { items: quotes, create, update } = useLocalStore<Quote>('quotes', MOCK_QUOTES)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)

  const existing = isEdit ? quotes.find(q => q.id === id) : undefined
  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both')

  const [customerId, setCustomerId] = useState(existing?.customer_id ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [validUntil, setValidUntil] = useState(existing?.valid_until ?? addDays(todayISO(), 30))
  const [branch, setBranch] = useState(existing?.branch ?? 'Mumbai HQ')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [terms, setTerms] = useState(existing?.terms ?? 'Prices exclusive of GST. Payment: 50% advance.')
  const [lines, setLines] = useState<LineItem[]>(existing?.lines as LineItem[] ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Quote | ERP`
  }, [isEdit])

  const customer = customers.find(c => c.id === customerId)
  const customerStateCode = customer?.state_code ?? '27'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!customerId) { alert('Please select a customer.'); return }
    if (!lines.length) { alert('Add at least one line item.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const payload = {
      number: existing?.number ?? nextNumber(quotes),
      customer_id: customerId,
      customer_name: customer?.name ?? '',
      date, valid_until: validUntil, status,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      lines, notes, terms, branch,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }

    if (isEdit && id) {
      update(id, payload as Partial<Quote>)
      navigate(`/sales/quotes/${id}`)
    } else {
      const created = create(payload as Omit<Quote, 'id'>)
      navigate(`/sales/quotes/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Quote' : 'New Quote'}
        subtitle={isEdit ? existing?.number : 'Create a new sales quote'}
        backHref={isEdit ? `/sales/quotes/${id}` : '/sales/quotes'}
        onCancel={() => navigate(isEdit ? `/sales/quotes/${id}` : '/sales/quotes')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Save & Send"
        onSave={() => handleSave('sent')}
      >
        <FormSection title="Quote Details" columns={2}>
          <GlassSelect
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select customer…"
            required
          />
          <GlassInput label="Branch" value={branch} onChange={setBranch} />
          <GlassInput label="Quote Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Valid Until" type="date" value={validUntil} onChange={setValidUntil} required />
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

        <FormSection title="Notes & Terms" columns={2}>
          <GlassInput label="Notes" as="textarea" rows={3} value={notes} onChange={setNotes} />
          <GlassInput label="Terms & Conditions" as="textarea" rows={3} value={terms} onChange={setTerms} />
        </FormSection>
      </FormPage>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_SALES_ORDERS, MOCK_CONTACTS, MOCK_QUOTES } from '@/lib/mockData'
import type { SalesOrder, Contact, Quote } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, addDays } from '@/lib/format'

function nextNumber(items: SalesOrder[]): string {
  const nums = items.map(o => parseInt(o.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `SO-${String(next).padStart(4, '0')}`
}

export default function SalesOrderForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const quoteId = searchParams.get('quoteId')
  const isEdit = !!id
  const { workspace } = useAuth()
  const { items: orders, create, update } = useLocalStore<SalesOrder>('sales-orders', MOCK_SALES_ORDERS)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: quotes } = useLocalStore<Quote>('quotes', MOCK_QUOTES)

  const existing = isEdit ? orders.find(o => o.id === id) : undefined
  const prefillQuote = quoteId ? quotes.find(q => q.id === quoteId) : undefined
  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both')

  const [customerId, setCustomerId] = useState(existing?.customer_id ?? prefillQuote?.customer_id ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [expectedDelivery, setExpectedDelivery] = useState(existing?.expected_delivery ?? addDays(todayISO(), 30))
  const [branch, setBranch] = useState(existing?.branch ?? 'Mumbai HQ')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [terms, setTerms] = useState(existing?.terms ?? '')
  const [lines, setLines] = useState<LineItem[]>(
    existing?.lines as LineItem[] ??
    prefillQuote?.lines?.map(l => ({ ...l, quantity_invoiced: 0 })) as LineItem[] ??
    []
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Sales Order | ERP`
  }, [isEdit])

  const customer = customers.find(c => c.id === customerId)
  const customerStateCode = customer?.state_code ?? '27'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!customerId) { alert('Please select a customer.'); return }
    if (!lines.length) { alert('Add at least one line item.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const soLines = lines.map(l => ({ ...l, quantity_invoiced: 0 }))
    const payload = {
      number: existing?.number ?? nextNumber(orders),
      customer_id: customerId,
      customer_name: customer?.name ?? '',
      date, expected_delivery: expectedDelivery, status,
      quote_id: quoteId ?? existing?.quote_id,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      lines: soLines, notes, terms, branch,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }

    if (isEdit && id) {
      update(id, payload as Partial<SalesOrder>)
      navigate(`/sales/orders/${id}`)
    } else {
      const created = create(payload as Omit<SalesOrder, 'id'>)
      navigate(`/sales/orders/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Sales Order' : 'New Sales Order'}
        subtitle={isEdit ? existing?.number : (prefillQuote ? `From ${prefillQuote.number}` : 'Create a new sales order')}
        backHref={isEdit ? `/sales/orders/${id}` : '/sales/orders'}
        onCancel={() => navigate(isEdit ? `/sales/orders/${id}` : '/sales/orders')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Confirm Order"
        onSave={() => handleSave('confirmed')}
      >
        <FormSection title="Order Details" columns={2}>
          <GlassSelect
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select customer…"
            required
          />
          <GlassInput label="Branch" value={branch} onChange={setBranch} />
          <GlassInput label="Order Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Expected Delivery" type="date" value={expectedDelivery} onChange={setExpectedDelivery} />
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

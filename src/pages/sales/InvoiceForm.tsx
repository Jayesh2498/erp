import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVOICES, MOCK_CONTACTS, MOCK_SALES_ORDERS } from '@/lib/mockData'
import type { Invoice, Contact, SalesOrder } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, addDays } from '@/lib/format'

function nextNumber(items: Invoice[]): string {
  const nums = items.map(i => parseInt(i.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `INV-${String(next).padStart(4, '0')}`
}

export default function InvoiceForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const soId = searchParams.get('soId')
  const isEdit = !!id
  const { workspace } = useAuth()
  const { items: invoices, create, update } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: salesOrders } = useLocalStore<SalesOrder>('sales-orders', MOCK_SALES_ORDERS)

  const existing = isEdit ? invoices.find(i => i.id === id) : undefined
  const prefillSO = soId ? salesOrders.find(o => o.id === soId) : undefined
  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both')
  const customer = contacts.find(c => c.id === (existing?.customer_id ?? prefillSO?.customer_id ?? ''))

  const defaultDueDays = customer?.payment_terms_days ?? 30

  const [customerId, setCustomerId] = useState(existing?.customer_id ?? prefillSO?.customer_id ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [dueDate, setDueDate] = useState(existing?.due_date ?? addDays(todayISO(), defaultDueDays))
  const [placeOfSupply, setPlaceOfSupply] = useState(existing?.place_of_supply ?? 'Maharashtra')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [terms, setTerms] = useState(existing?.terms ?? '')
  const [lines, setLines] = useState<LineItem[]>(
    existing?.lines as LineItem[] ??
    prefillSO?.lines?.map(l => ({ ...l })) as LineItem[] ??
    []
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Invoice | ERP`
  }, [isEdit])

  const selectedCustomer = customers.find(c => c.id === customerId)
  const customerStateCode = selectedCustomer?.state_code ?? '27'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!customerId) { alert('Please select a customer.'); return }
    if (!lines.length) { alert('Add at least one line item.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const payload: Omit<Invoice, 'id'> = {
      number: existing?.number ?? nextNumber(invoices),
      customer_id: customerId,
      customer_name: selectedCustomer?.name ?? '',
      date, due_date: dueDate, place_of_supply: placeOfSupply, status,
      so_id: soId ?? existing?.so_id,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      amount_due: status === 'confirmed' ? totalAmount : (existing?.amount_due ?? totalAmount),
      lines, notes, terms,
      payments: existing?.payments ?? [],
      created_at: existing?.created_at ?? new Date().toISOString(),
    }

    if (isEdit && id) {
      update(id, payload as Partial<Invoice>)
      navigate(`/sales/invoices/${id}`)
    } else {
      const created = create(payload)
      navigate(`/sales/invoices/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Invoice' : 'New Invoice'}
        subtitle={isEdit ? existing?.number : (prefillSO ? `From ${prefillSO.number}` : 'Create a new invoice')}
        backHref={isEdit ? `/sales/invoices/${id}` : '/sales/invoices'}
        onCancel={() => navigate(isEdit ? `/sales/invoices/${id}` : '/sales/invoices')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Confirm Invoice"
        onSave={() => handleSave('confirmed')}
      >
        <FormSection title="Invoice Details" columns={2}>
          <GlassSelect
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select customer…"
            required
          />
          <GlassInput label="Place of Supply" value={placeOfSupply} onChange={setPlaceOfSupply} />
          <GlassInput label="Invoice Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} required />
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

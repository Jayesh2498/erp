import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PURCHASE_ORDERS, MOCK_CONTACTS } from '@/lib/mockData'
import type { PurchaseOrder, Contact } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, addDays } from '@/lib/format'

function nextNumber(items: PurchaseOrder[]): string {
  const nums = items.map(o => parseInt(o.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `PO-${String(next).padStart(4, '0')}`
}

export default function PurchaseOrderForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { workspace } = useAuth()
  const { items: orders, create, update } = useLocalStore<PurchaseOrder>('purchase-orders', MOCK_PURCHASE_ORDERS)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)

  const existing = isEdit ? orders.find(o => o.id === id) : undefined
  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both')

  const [vendorId, setVendorId] = useState(existing?.vendor_id ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [expectedDate, setExpectedDate] = useState(existing?.expected_date ?? addDays(todayISO(), 14))
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [lines, setLines] = useState<LineItem[]>(existing?.lines as LineItem[] ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = `${isEdit ? 'Edit' : 'New'} Purchase Order | ERP` }, [isEdit])

  const vendor = vendors.find(v => v.id === vendorId)
  const vendorStateCode = vendor?.state_code ?? '29'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!vendorId) { alert('Please select a vendor.'); return }
    if (!lines.length) { alert('Add at least one line item.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const poLines = lines.map(l => ({ ...l, quantity_received: 0 }))
    const payload = {
      number: existing?.number ?? nextNumber(orders),
      vendor_id: vendorId,
      vendor_name: vendor?.name ?? '',
      date, expected_date: expectedDate, status,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      lines: poLines, notes,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }

    if (isEdit && id) {
      update(id, payload as Partial<PurchaseOrder>)
      navigate(`/purchasing/orders/${id}`)
    } else {
      const created = create(payload as Omit<PurchaseOrder, 'id'>)
      navigate(`/purchasing/orders/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
        subtitle={isEdit ? existing?.number : 'Create a new purchase order'}
        backHref={isEdit ? `/purchasing/orders/${id}` : '/purchasing/orders'}
        onCancel={() => navigate(isEdit ? `/purchasing/orders/${id}` : '/purchasing/orders')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Send PO"
        onSave={() => handleSave('sent')}
      >
        <FormSection title="PO Details" columns={2}>
          <GlassSelect
            label="Vendor"
            value={vendorId}
            onChange={setVendorId}
            options={vendors.map(v => ({ value: v.id, label: v.name }))}
            placeholder="Select vendor…"
            required
          />
          <GlassInput label="PO Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Expected Date" type="date" value={expectedDate} onChange={setExpectedDate} />
          <GlassInput label="Notes" as="textarea" rows={2} value={notes} onChange={setNotes} />
        </FormSection>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgb(var(--text-1))' }}>Line Items</h3>
            <LineItemsEditor
              lines={lines}
              onChange={setLines}
              companyStateCode={companyStateCode}
              customerStateCode={vendorStateCode}
              useCostPrice
            />
          </div>
        </GlassCard>
      </FormPage>
    </>
  )
}

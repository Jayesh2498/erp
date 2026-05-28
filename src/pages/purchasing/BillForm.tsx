import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor, type LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_BILLS, MOCK_CONTACTS, MOCK_PURCHASE_ORDERS } from '@/lib/mockData'
import type { Bill, Contact, PurchaseOrder } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, addDays } from '@/lib/format'

function nextNumber(items: Bill[]): string {
  const nums = items.map(b => parseInt(b.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `BILL-${String(next).padStart(4, '0')}`
}

export default function BillForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const poId = searchParams.get('poId')
  const { workspace } = useAuth()
  const { items: bills, create } = useLocalStore<Bill>('bills', MOCK_BILLS)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: purchaseOrders } = useLocalStore<PurchaseOrder>('purchase-orders', MOCK_PURCHASE_ORDERS)

  const prefillPO = poId ? purchaseOrders.find(o => o.id === poId) : undefined
  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both')

  const [vendorId, setVendorId] = useState(prefillPO?.vendor_id ?? '')
  const [date, setDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState(addDays(todayISO(), 30))
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>(prefillPO?.lines as LineItem[] ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'New Bill | ERP' }, [])

  const vendor = vendors.find(v => v.id === vendorId)
  const vendorStateCode = vendor?.state_code ?? '29'
  const companyStateCode = workspace?.stateCode ?? '27'

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (1 - l.discount_pct / 100), 0)
  const taxTotal = lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0)
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0)

  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!vendorId) { alert('Please select a vendor.'); return }
    if (!lines.length) { alert('Add at least one line item.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    create({
      number: nextNumber(bills),
      vendor_id: vendorId,
      vendor_name: vendor?.name ?? '',
      date, due_date: dueDate,
      po_id: poId ?? undefined,
      status,
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      amount_due: status === 'confirmed' ? totalAmount : totalAmount,
      lines,
      notes: notes || undefined,
      payments: [],
      created_at: new Date().toISOString(),
    } as Omit<Bill, 'id'>)

    navigate('/purchasing/bills')
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title="New Bill"
        subtitle={prefillPO ? `From ${prefillPO.number}` : 'Record a vendor bill'}
        backHref="/purchasing/bills"
        onCancel={() => navigate('/purchasing/bills')}
        saving={saving}
        footerExtra={
          <GlassButton variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
            Save as Draft
          </GlassButton>
        }
        saveLabel="Confirm Bill"
        onSave={() => handleSave('confirmed')}
      >
        <FormSection title="Bill Details" columns={2}>
          <GlassSelect
            label="Vendor"
            value={vendorId}
            onChange={setVendorId}
            options={vendors.map(v => ({ value: v.id, label: v.name }))}
            placeholder="Select vendor…"
            required
          />
          <GlassInput label="Bill Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} required />
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

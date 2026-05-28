import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard, GlassButton } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_DEBIT_NOTES, MOCK_CONTACTS, MOCK_BILLS, MOCK_PRODUCTS } from '@/lib/mockData'
import type { DebitNote, Contact, Bill, Product, DebitNoteLine } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

function genId() { return Math.random().toString(36).slice(2, 10) }

function nextNumber(items: DebitNote[]): string {
  const nums = items.map(d => parseInt(d.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `DN-${String(next).padStart(4, '0')}`
}

export default function DebitNoteForm() {
  const navigate = useNavigate()
  const { items: debitNotes, create } = useLocalStore<DebitNote>('debit-notes', MOCK_DEBIT_NOTES)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: bills } = useLocalStore<Bill>('bills', MOCK_BILLS)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)

  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both')

  const [vendorId, setVendorId] = useState('')
  const [billId, setBillId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [reason, setReason] = useState('')
  const [lines, setLines] = useState<DebitNoteLine[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'New Debit Note | ERP' }, [])

  const vendor = vendors.find(v => v.id === vendorId)
  const vendorBills = bills.filter(b => b.vendor_id === vendorId && b.status !== 'draft')
  const selectedBill = bills.find(b => b.id === billId)

  const addLine = () => setLines(ls => [...ls, { id: genId(), product_id: '', product_name: '', description: '', quantity: 1, unit_price: 0, tax_rate: 18, line_total: 0 }])
  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id))
  const updateLine = (id: string, key: keyof DebitNoteLine, val: string | number) => {
    setLines(ls => ls.map(l => {
      if (l.id !== id) return l
      if (key === 'product_id') {
        const p = products.find(p => p.id === val)
        return { ...l, product_id: String(val), product_name: p?.name ?? '', unit_price: p?.cost_price ?? 0, tax_rate: p?.tax_rate ?? 18 }
      }
      const updated = { ...l, [key]: val }
      updated.line_total = updated.quantity * updated.unit_price * (1 + updated.tax_rate / 100)
      return updated
    }))
  }

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const taxTotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * l.tax_rate / 100, 0)
  const totalAmount = subtotal + taxTotal

  const handleSave = async () => {
    if (!vendorId || !reason) { alert('Vendor and reason are required.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    create({
      number: nextNumber(debitNotes),
      vendor_id: vendorId,
      vendor_name: vendor?.name ?? '',
      bill_id: billId || undefined,
      bill_number: selectedBill?.number,
      date, reason, status: 'confirmed',
      subtotal, tax_total: taxTotal, total_amount: totalAmount,
      lines,
      created_at: new Date().toISOString(),
    } as Omit<DebitNote, 'id'>)

    navigate('/purchasing/debit-notes')
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    background: tokens.glass.inputBg,
    border: `1px solid ${tokens.glass.inputBorder}`,
    borderRadius: tokens.radius.sm,
    color: tokens.color.text1,
    outline: 'none',
    fontSize: 13,
    padding: '6px 10px',
    width: '100%',
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title="New Debit Note"
        backHref="/purchasing/debit-notes"
        onSave={handleSave}
        onCancel={() => navigate('/purchasing/debit-notes')}
        saving={saving}
        saveLabel="Create Debit Note"
      >
        <FormSection title="Debit Note Details" columns={2}>
          <GlassSelect
            label="Vendor"
            value={vendorId}
            onChange={v => { setVendorId(v); setBillId(''); setLines([]) }}
            options={vendors.map(v => ({ value: v.id, label: v.name }))}
            placeholder="Select vendor…"
            required
          />
          <GlassSelect
            label="Against Bill"
            value={billId}
            onChange={v => {
              setBillId(v)
              const b = bills.find(b => b.id === v)
              if (b) setLines(b.lines.map(l => ({ ...l, line_total: l.line_total })) as DebitNoteLine[])
            }}
            options={vendorBills.map(b => ({ value: b.id, label: b.number }))}
            placeholder="Select bill (optional)…"
          />
          <GlassInput label="Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Reason" value={reason} onChange={setReason} required placeholder="e.g. Short shipment, quality defect" />
        </FormSection>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Lines</h3>
            {lines.map(line => (
              <div key={line.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_36px] gap-3 mb-3 items-end">
                <GlassSelect
                  label="Product"
                  value={line.product_id}
                  onChange={v => updateLine(line.id, 'product_id', v)}
                  options={products.map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Select product…"
                />
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: tokens.color.text2 }}>Qty</label>
                  <input type="number" value={line.quantity} onChange={e => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: tokens.color.text2 }}>Unit Price</label>
                  <input type="number" value={line.unit_price} onChange={e => updateLine(line.id, 'unit_price', parseFloat(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: tokens.color.text2 }}>Tax %</label>
                  <input type="number" value={line.tax_rate} onChange={e => updateLine(line.id, 'tax_rate', parseFloat(e.target.value) || 0)} style={inputStyle} />
                </div>
                <button type="button" onClick={() => removeLine(line.id)} className="w-9 h-9 flex items-center justify-center rounded-sm mb-0.5" style={{ color: tokens.color.text3 }}
                  onMouseEnter={e => { e.currentTarget.style.color = tokens.color.danger }}
                  onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
                ><Trash2 size={15} /></button>
              </div>
            ))}
            <button type="button" onClick={addLine} className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all"
              style={{ border: `1px dashed ${tokens.glass.border}`, color: tokens.color.text2, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tokens.color.sunsetOrange; e.currentTarget.style.color = tokens.color.sunsetOrange }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.glass.border; e.currentTarget.style.color = tokens.color.text2 }}
            ><Plus size={15} /> Add Line</button>
          </div>
        </GlassCard>
      </FormPage>
    </>
  )
}

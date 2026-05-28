import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_WAREHOUSES, MOCK_PRODUCTS, MOCK_STOCK_TRANSFERS, MOCK_INVENTORY } from '@/lib/mockData'
import type { Warehouse, Product, StockTransfer, TransferLine, InventoryItem } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

function genId() { return Math.random().toString(36).slice(2, 10) }

export default function TransferForm() {
  const navigate = useNavigate()
  const { items: warehouses } = useLocalStore<Warehouse>('warehouses', MOCK_WAREHOUSES)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const { create } = useLocalStore<StockTransfer>('transfers', MOCK_STOCK_TRANSFERS)
  const { items: inventory, setItems: setInventory } = useLocalStore<InventoryItem>('inventory', MOCK_INVENTORY)

  const [fromWh, setFromWh] = useState(warehouses.find(w => w.is_default)?.id ?? '')
  const [toWh, setToWh] = useState('')
  const [date, setDate] = useState(todayISO())
  const [lines, setLines] = useState<TransferLine[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'New Stock Transfer | ERP' }, [])

  const addLine = () => setLines(l => [...l, { id: genId(), product_id: '', product_name: '', quantity: 0 }])

  const updateLine = (id: string, key: keyof TransferLine, val: string | number) => {
    setLines(ls => ls.map(l => {
      if (l.id !== id) return l
      if (key === 'product_id') {
        const p = products.find(p => p.id === val)
        return { ...l, product_id: String(val), product_name: p?.name ?? '' }
      }
      return { ...l, [key]: val }
    }))
  }

  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id))

  const handleSave = async () => {
    setError('')
    if (!fromWh || !toWh) { setError('Select both warehouses.'); return }
    if (fromWh === toWh) { setError('From and To warehouses must be different.'); return }
    if (!lines.length) { setError('Add at least one product line.'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    // Update inventory: deduct from source, add to destination
    const updatedInv = [...inventory]
    lines.forEach(line => {
      const srcIdx = updatedInv.findIndex(i => i.product_id === line.product_id && i.warehouse_id === fromWh)
      if (srcIdx >= 0) updatedInv[srcIdx] = { ...updatedInv[srcIdx], quantity: Math.max(0, updatedInv[srcIdx].quantity - line.quantity) }

      const dstIdx = updatedInv.findIndex(i => i.product_id === line.product_id && i.warehouse_id === toWh)
      const product = products.find(p => p.id === line.product_id)
      const toWarehouse = warehouses.find(w => w.id === toWh)
      if (dstIdx >= 0) {
        updatedInv[dstIdx] = { ...updatedInv[dstIdx], quantity: updatedInv[dstIdx].quantity + line.quantity }
      } else {
        updatedInv.push({
          id: `inv-${line.product_id}-${toWh}`,
          product_id: line.product_id,
          product_name: line.product_name,
          sku: product?.sku ?? '',
          warehouse_id: toWh,
          warehouse_name: toWarehouse?.name ?? '',
          quantity: line.quantity,
          committed_quantity: 0,
          reorder_point: product?.reorder_point ?? 0,
        })
      }
    })
    setInventory(updatedInv)

    const fromW = warehouses.find(w => w.id === fromWh)
    const toW = warehouses.find(w => w.id === toWh)
    create({
      number: `TRF-${String(Math.floor(Math.random() * 9000 + 1000))}`,
      from_warehouse_id: fromWh, from_warehouse_name: fromW?.name ?? '',
      to_warehouse_id: toWh, to_warehouse_name: toW?.name ?? '',
      date, status: 'completed',
      lines,
      created_at: new Date().toISOString(),
    } as Omit<StockTransfer, 'id'>)

    navigate('/inventory/transfers')
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title="New Stock Transfer"
        backHref="/inventory/transfers"
        onSave={handleSave}
        onCancel={() => navigate('/inventory/transfers')}
        saving={saving}
        saveLabel="Complete Transfer"
      >
        <FormSection title="Transfer Details" columns={3}>
          <GlassSelect
            label="From Warehouse"
            value={fromWh}
            onChange={setFromWh}
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            required
          />
          <GlassSelect
            label="To Warehouse"
            value={toWh}
            onChange={setToWh}
            options={warehouses.filter(w => w.id !== fromWh).map(w => ({ value: w.id, label: w.name }))}
            placeholder="Select destination…"
            required
          />
          <GlassInput label="Date" type="date" value={date} onChange={setDate} required />
        </FormSection>

        {error && <p className="text-sm font-medium" style={{ color: tokens.color.danger }}>{error}</p>}

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Transfer Lines</h3>
            {lines.map(line => (
              <div key={line.id} className="grid grid-cols-[2fr_1fr_36px] gap-3 mb-3 items-end">
                <GlassSelect
                  label="Product"
                  value={line.product_id}
                  onChange={v => updateLine(line.id, 'product_id', v)}
                  options={products.filter(p => p.track_inventory).map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Select product…"
                />
                <GlassInput
                  label="Quantity"
                  type="number"
                  value={String(line.quantity)}
                  onChange={v => updateLine(line.id, 'quantity', parseInt(v) || 0)}
                />
                <button type="button" onClick={() => removeLine(line.id)} className="w-9 h-9 flex items-center justify-center rounded-sm mb-0.5 transition-colors" style={{ color: tokens.color.text3 }}
                  onMouseEnter={e => { e.currentTarget.style.color = tokens.color.danger }}
                  onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addLine} className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all"
              style={{ border: `1px dashed ${tokens.glass.border}`, color: tokens.color.text2, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tokens.color.sunsetOrange; e.currentTarget.style.color = tokens.color.sunsetOrange }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.glass.border; e.currentTarget.style.color = tokens.color.text2 }}
            >
              <Plus size={15} /> Add Line
            </button>
          </div>
        </GlassCard>

        <FormSection title="Notes" columns={1}>
          <GlassInput label="Notes" as="textarea" rows={2} value={notes} onChange={setNotes} />
        </FormSection>
      </FormPage>
    </>
  )
}

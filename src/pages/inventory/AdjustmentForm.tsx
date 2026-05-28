import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVENTORY, MOCK_WAREHOUSES, MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS } from '@/lib/mockData'
import type { InventoryItem, Warehouse, Product, StockAdjustment, AdjustmentLine } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

function genId() { return Math.random().toString(36).slice(2, 10) }

export default function AdjustmentForm() {
  const navigate = useNavigate()
  const { items: warehouses } = useLocalStore<Warehouse>('warehouses', MOCK_WAREHOUSES)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const { items: inventory, setItems: setInventory } = useLocalStore<InventoryItem>('inventory', MOCK_INVENTORY)
  const { create } = useLocalStore<StockAdjustment>('adjustments', MOCK_STOCK_ADJUSTMENTS)

  const [warehouseId, setWarehouseId] = useState(warehouses.find(w => w.is_default)?.id ?? '')
  const [date, setDate] = useState(todayISO())
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<AdjustmentLine[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'New Stock Adjustment | ERP' }, [])

  const addLine = () => {
    setLines(l => [...l, { id: genId(), product_id: '', product_name: '', current_qty: 0, new_qty: 0 }])
  }

  const updateLine = (id: string, key: keyof AdjustmentLine, val: string | number) => {
    setLines(ls => ls.map(l => {
      if (l.id !== id) return l
      if (key === 'product_id') {
        const p = products.find(p => p.id === val)
        const inv = inventory.find(i => i.product_id === val && i.warehouse_id === warehouseId)
        return { ...l, product_id: String(val), product_name: p?.name ?? '', current_qty: inv?.quantity ?? 0, new_qty: inv?.quantity ?? 0 }
      }
      return { ...l, [key]: val }
    }))
  }

  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    // Update inventory
    const updatedInv = [...inventory]
    lines.forEach(line => {
      const idx = updatedInv.findIndex(i => i.product_id === line.product_id && i.warehouse_id === warehouseId)
      if (idx >= 0) {
        updatedInv[idx] = { ...updatedInv[idx], quantity: line.new_qty }
      }
    })
    setInventory(updatedInv)

    const wh = warehouses.find(w => w.id === warehouseId)
    create({
      number: `ADJ-${String(Math.floor(Math.random() * 9000 + 1000))}`,
      warehouse_id: warehouseId,
      warehouse_name: wh?.name ?? '',
      date, reason, notes: notes || undefined,
      lines,
      created_at: new Date().toISOString(),
    } as Omit<StockAdjustment, 'id'>)

    navigate('/inventory')
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
        title="New Stock Adjustment"
        backHref="/inventory"
        onSave={handleSave}
        onCancel={() => navigate('/inventory')}
        saving={saving}
        saveLabel="Save Adjustment"
      >
        <FormSection title="Adjustment Details" columns={2}>
          <GlassSelect
            label="Warehouse"
            value={warehouseId}
            onChange={setWarehouseId}
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            required
          />
          <GlassInput label="Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Reason" value={reason} onChange={setReason} required placeholder="e.g. Physical count discrepancy" />
          <GlassInput label="Notes" as="textarea" rows={2} value={notes} onChange={setNotes} />
        </FormSection>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Adjustment Lines</h3>

            {lines.length === 0 && (
              <p className="text-sm mb-4" style={{ color: tokens.color.text3 }}>No lines added yet. Click "Add Line" to start.</p>
            )}

            {lines.map(line => (
              <div key={line.id} className="grid grid-cols-[2fr_1fr_1fr_36px] gap-3 mb-3 items-end">
                <GlassSelect
                  label="Product"
                  value={line.product_id}
                  onChange={v => updateLine(line.id, 'product_id', v)}
                  options={products.filter(p => p.track_inventory).map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Select product…"
                />
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: tokens.color.text2 }}>Current Qty</label>
                  <input type="number" readOnly value={line.current_qty} style={{ ...inputStyle, color: tokens.color.text3 }} />
                </div>
                <GlassInput
                  label="New Qty"
                  type="number"
                  value={String(line.new_qty)}
                  onChange={v => updateLine(line.id, 'new_qty', parseInt(v) || 0)}
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
      </FormPage>
    </>
  )
}

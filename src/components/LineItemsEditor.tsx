import React, { useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import type { Product } from '@/types'
import { tokens } from '@/components/ui-kit/tokens'
import { calculateGST } from '@/lib/gst'
import { formatCurrency } from '@/lib/format'

export interface LineItem {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

interface LineItemsEditorProps {
  lines: LineItem[]
  onChange: (lines: LineItem[]) => void
  companyStateCode: string
  customerStateCode: string
  readOnly?: boolean
  useCostPrice?: boolean
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function calcLine(
  line: LineItem,
  companyStateCode: string,
  customerStateCode: string,
): LineItem {
  const subtotalLine = line.quantity * line.unit_price * (1 - line.discount_pct / 100)
  const gst = calculateGST(subtotalLine, line.tax_rate, companyStateCode, customerStateCode)
  return {
    ...line,
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    line_total: Math.round((subtotalLine + gst.total) * 100) / 100,
  }
}

export function LineItemsEditor({
  lines,
  onChange,
  companyStateCode,
  customerStateCode,
  readOnly = false,
  useCostPrice = false,
}: LineItemsEditorProps) {
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const [search, setSearch] = useState<Record<string, string>>({})
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  const isInterState = companyStateCode !== customerStateCode

  const addLine = () => {
    const newLine: LineItem = {
      id: generateId(),
      product_id: '',
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_pct: 0,
      tax_rate: 18,
      cgst: 0, sgst: 0, igst: 0,
      line_total: 0,
    }
    onChange([...lines, newLine])
  }

  const removeLine = (id: string) => {
    onChange(lines.filter(l => l.id !== id))
  }

  const updateLine = (id: string, updates: Partial<LineItem>) => {
    const updated = lines.map(l => {
      if (l.id !== id) return l
      const merged = { ...l, ...updates }
      return calcLine(merged, companyStateCode, customerStateCode)
    })
    onChange(updated)
  }

  const selectProduct = (lineId: string, product: Product) => {
    const price = useCostPrice ? product.cost_price : product.selling_price
    updateLine(lineId, {
      product_id: product.id,
      product_name: product.name,
      description: product.description ?? product.name,
      unit_price: price,
      tax_rate: product.tax_rate,
    })
    setSearch(s => ({ ...s, [lineId]: product.name }))
    setDropdownOpen(null)
  }

  // Totals
  const subtotal = lines.reduce((s, l) => {
    const sub = l.quantity * l.unit_price * (1 - l.discount_pct / 100)
    return s + sub
  }, 0)
  const totalDiscount = lines.reduce((s, l) => {
    const full = l.quantity * l.unit_price
    const disc = full * (l.discount_pct / 100)
    return s + disc
  }, 0)
  const totalCGST = lines.reduce((s, l) => s + l.cgst, 0)
  const totalSGST = lines.reduce((s, l) => s + l.sgst, 0)
  const totalIGST = lines.reduce((s, l) => s + l.igst, 0)
  const grandTotal = lines.reduce((s, l) => s + l.line_total, 0)

  const inputStyle = {
    background: tokens.glass.inputBg,
    border: `1px solid ${tokens.glass.inputBorder}`,
    borderRadius: tokens.radius.sm,
    color: tokens.color.text1,
    outline: 'none',
    fontSize: 13,
    padding: '6px 10px',
    width: '100%',
  }

  const readOnlyStyle = {
    ...inputStyle,
    background: 'transparent',
    border: '1px solid transparent',
    color: tokens.color.text2,
  }

  return (
    <div>
      {/* Table header */}
      <div
        className="hidden md:grid gap-2 px-3 pb-2 text-xs font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: readOnly
            ? '2fr 1fr 1fr 1fr 80px 80px 80px 100px'
            : '2fr 1fr 1fr 1fr 80px 80px 80px 100px 36px',
          color: tokens.color.text3,
        }}
      >
        <span>Product / Description</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span>Disc %</span>
        <span style={{ textAlign: 'right' }}>CGST</span>
        <span style={{ textAlign: 'right' }}>SGST</span>
        <span style={{ textAlign: 'right' }}>IGST</span>
        <span style={{ textAlign: 'right' }}>Total</span>
        {!readOnly && <span />}
      </div>

      <div className="space-y-2">
        {lines.map(line => (
          <div
            key={line.id}
            className="rounded-md p-3 relative"
            style={{
              background: tokens.glass.bg,
              border: `1px solid ${tokens.glass.border}`,
            }}
          >
            {/* Mobile: stack layout */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_80px_80px_80px_100px] gap-2 items-start"
              style={readOnly ? {} : { gridTemplateColumns: undefined }}>

              {/* md: use the grid; on mobile stack */}
              <div className="md:contents flex flex-col gap-2">

                {/* Product selector */}
                <div className="relative" style={{ gridColumn: '1' }}>
                  <div className="flex items-center gap-1" style={inputStyle as React.CSSProperties}>
                    <Search size={12} style={{ color: tokens.color.text3, flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search product…"
                      value={search[line.id] ?? line.product_name}
                      disabled={readOnly}
                      onChange={e => {
                        setSearch(s => ({ ...s, [line.id]: e.target.value }))
                        setDropdownOpen(line.id)
                      }}
                      onFocus={() => setDropdownOpen(line.id)}
                      style={{
                        background: 'transparent', border: 'none', outline: 'none',
                        color: tokens.color.text1, fontSize: 13, width: '100%',
                      }}
                    />
                  </div>
                  {dropdownOpen === line.id && !readOnly && (
                    <div
                      className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md"
                      style={{
                        background: tokens.glass.bg,
                        backdropFilter: tokens.glass.blur,
                        border: `1px solid ${tokens.glass.border}`,
                        boxShadow: tokens.shadow.lg,
                      }}
                    >
                      {products
                        .filter(p => p.is_active && (
                          !search[line.id] ||
                          p.name.toLowerCase().includes(search[line.id]?.toLowerCase() ?? '') ||
                          p.sku.toLowerCase().includes(search[line.id]?.toLowerCase() ?? '')
                        ))
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors"
                            style={{ color: tokens.color.text1, fontSize: 13 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,142,83,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                            onClick={() => selectProduct(line.id, p)}
                          >
                            <span className="font-medium">{p.name}</span>
                            <span style={{ color: tokens.color.text3, fontSize: 11 }}>{p.sku}</span>
                          </button>
                        ))}
                      {products.filter(p => p.is_active).length === 0 && (
                        <div className="px-3 py-2 text-xs" style={{ color: tokens.color.text3 }}>No products found</div>
                      )}
                    </div>
                  )}
                  {/* Description below product */}
                  <input
                    type="text"
                    placeholder="Description…"
                    value={line.description}
                    disabled={readOnly}
                    onChange={e => updateLine(line.id, { description: e.target.value })}
                    className="mt-1"
                    style={{ ...inputStyle, fontSize: 12, color: tokens.color.text2, padding: '4px 10px' } as React.CSSProperties}
                  />
                </div>

                <div className="grid grid-cols-2 md:contents gap-2">
                  {/* Qty */}
                  <input
                    type="number" min={0} step={1}
                    value={line.quantity}
                    disabled={readOnly}
                    onChange={e => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                    style={readOnly ? readOnlyStyle as React.CSSProperties : inputStyle as React.CSSProperties}
                  />
                  {/* Unit Price */}
                  <input
                    type="number" min={0} step={0.01}
                    value={line.unit_price}
                    disabled={readOnly}
                    onChange={e => updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })}
                    style={readOnly ? readOnlyStyle as React.CSSProperties : inputStyle as React.CSSProperties}
                  />
                  {/* Discount % */}
                  <input
                    type="number" min={0} max={100} step={0.1}
                    value={line.discount_pct}
                    disabled={readOnly}
                    onChange={e => updateLine(line.id, { discount_pct: parseFloat(e.target.value) || 0 })}
                    style={readOnly ? readOnlyStyle as React.CSSProperties : inputStyle as React.CSSProperties}
                  />

                  {/* Tax rate read-only */}
                  <div style={{ ...readOnlyStyle as React.CSSProperties, textAlign: 'right' }}>
                    {line.tax_rate}%
                  </div>

                  {/* CGST */}
                  <div style={{ ...readOnlyStyle as React.CSSProperties, textAlign: 'right' }}>
                    {isInterState ? '—' : formatCurrency(line.cgst)}
                  </div>
                  {/* SGST */}
                  <div style={{ ...readOnlyStyle as React.CSSProperties, textAlign: 'right' }}>
                    {isInterState ? '—' : formatCurrency(line.sgst)}
                  </div>
                  {/* IGST */}
                  <div style={{ ...readOnlyStyle as React.CSSProperties, textAlign: 'right' }}>
                    {isInterState ? formatCurrency(line.igst) : '—'}
                  </div>
                  {/* Total */}
                  <div style={{ ...readOnlyStyle as React.CSSProperties, textAlign: 'right', fontWeight: 600, color: tokens.color.text1 }}>
                    {formatCurrency(line.line_total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Delete button */}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeLine(line.id)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                style={{ color: tokens.color.text3 }}
                onMouseEnter={e => { e.currentTarget.style.color = tokens.color.danger; e.currentTarget.style.background = tokens.surface.dangerTint }}
                onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3; e.currentTarget.style.background = 'transparent' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add line button */}
      {!readOnly && (
        <button
          type="button"
          onClick={addLine}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all duration-150"
          style={{
            border: `1px dashed ${tokens.glass.border}`,
            color: tokens.color.text2,
            background: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = tokens.color.sunsetOrange
            e.currentTarget.style.color = tokens.color.sunsetOrange
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = tokens.glass.border
            e.currentTarget.style.color = tokens.color.text2
          }}
        >
          <Plus size={15} /> Add Line
        </button>
      )}

      {/* Totals */}
      {lines.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-sm" style={{ color: tokens.color.text2 }}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: tokens.color.text2 }}>
                <span>Total Discount</span>
                <span>−{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            {!isInterState && (
              <>
                <div className="flex justify-between text-sm" style={{ color: tokens.color.text2 }}>
                  <span>CGST</span>
                  <span>{formatCurrency(totalCGST)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: tokens.color.text2 }}>
                  <span>SGST</span>
                  <span>{formatCurrency(totalSGST)}</span>
                </div>
              </>
            )}
            {isInterState && (
              <div className="flex justify-between text-sm" style={{ color: tokens.color.text2 }}>
                <span>IGST</span>
                <span>{formatCurrency(totalIGST)}</span>
              </div>
            )}
            <div
              className="flex justify-between text-base font-bold pt-2 border-t"
              style={{ borderColor: tokens.glass.border, color: tokens.color.text1 }}
            >
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

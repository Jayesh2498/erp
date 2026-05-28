/**
 * OrderSummary — calculated totals panel for quotes/orders
 * ==========================================================
 * Pure calculation — reads from lines array, no state.
 * Shows: Subtotal, Discount, CGST + SGST (intra) or IGST (inter), Grand Total.
 */
import type { LineItem } from './LineItemsEditor'
import { tokens } from '@/components/ui-kit/tokens'

interface OrderSummaryProps {
  lines:        LineItem[]
  isIntraState: boolean
  className?:   string
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function OrderSummary({ lines, isIntraState, className }: OrderSummaryProps) {
  const subtotal      = round2(lines.reduce((s, l) => s + l.unit_price * l.quantity, 0))
  const discountTotal = round2(lines.reduce((s, l) => s + l.unit_price * l.quantity * (l.discount_pct / 100), 0))
  const cgstTotal     = round2(lines.reduce((s, l) => s + l.cgst, 0))
  const sgstTotal     = round2(lines.reduce((s, l) => s + l.sgst, 0))
  const igstTotal     = round2(lines.reduce((s, l) => s + l.igst, 0))
  const taxTotal      = round2(lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0))
  const grandTotal    = round2(lines.reduce((s, l) => s + l.line_total, 0))

  return (
    <div
      className={`flex flex-col gap-0 rounded-xl overflow-hidden ${className ?? ''}`}
      style={{
        background: tokens.glass.inputBg,
        border:     `1px solid ${tokens.glass.border}`,
        minWidth:   240,
      }}
    >
      <Row label="Subtotal" value={fmt(subtotal)} />
      {discountTotal > 0 && (
        <Row label="Discount" value={`-${fmt(discountTotal)}`} valueColor={tokens.color.success} />
      )}
      {isIntraState ? (
        <>
          <Row label={`CGST`} value={fmt(cgstTotal)} />
          <Row label={`SGST`} value={fmt(sgstTotal)} />
        </>
      ) : (
        <Row label="IGST" value={fmt(igstTotal)} />
      )}
      <Row label="Total Tax" value={fmt(taxTotal)} dimmed />
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: `2px solid ${tokens.glass.border}` }}
      >
        <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>Grand Total</span>
        <span
          className="text-lg font-bold"
          style={{
            background:              tokens.gradient.sunset,
            WebkitBackgroundClip:    'text',
            WebkitTextFillColor:     'transparent',
          }}
        >
          {fmt(grandTotal)}
        </span>
      </div>
    </div>
  )
}

function Row({
  label, value, valueColor, dimmed,
}: {
  label: string; value: string; valueColor?: string; dimmed?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: `1px solid ${tokens.glass.border}` }}
    >
      <span className="text-sm" style={{ color: dimmed ? tokens.color.text3 : tokens.color.text2 }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: valueColor ?? (dimmed ? tokens.color.text3 : tokens.color.text1) }}
      >
        {value}
      </span>
    </div>
  )
}

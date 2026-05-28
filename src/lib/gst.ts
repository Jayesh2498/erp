export type GSTBreakdown = {
  cgst: number
  sgst: number
  igst: number
  total: number
  isInterState: boolean
}

/**
 * Calculate GST breakdown.
 * Same state → CGST + SGST (each = taxAmount/2)
 * Different state → IGST
 */
export function calculateGST(
  subtotal: number,
  taxRate: number,
  supplierStateCode: string,
  customerStateCode: string,
): GSTBreakdown {
  const total = Math.round(subtotal * taxRate) / 100
  const isInterState = supplierStateCode !== customerStateCode

  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: total, total, isInterState: true }
  }

  const half = Math.round((total / 2) * 100) / 100
  // Adjust for rounding: cgst + sgst should equal total
  const cgst = half
  const sgst = Math.round((total - half) * 100) / 100
  return { cgst, sgst, igst: 0, total, isInterState: false }
}

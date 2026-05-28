/**
 * Formatting utilities — Indian number system (lakhs/crores)
 */

/** Format to Indian currency: ₹12,45,000 */
export function formatCurrency(amount: number): string {
  return '₹' + formatIndianNumber(Math.round(amount))
}

/** Format Indian number: 12,45,000 */
export function formatIndianNumber(n: number): string {
  if (isNaN(n)) return '0'
  const isNeg = n < 0
  const abs = Math.abs(Math.round(n))
  const str = abs.toString()
  if (str.length <= 3) return (isNeg ? '-' : '') + str
  const last3 = str.slice(-3)
  const rest = str.slice(0, -3)
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
  return (isNeg ? '-' : '') + formatted
}

/** Amount to Indian English words: "Two Lakh Sixty-Five Thousand" */
export function amountToWords(amount: number): string {
  const n = Math.floor(Math.abs(amount))
  if (n === 0) return 'Zero'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigit(n: number): string {
    if (n < 20) return ones[n]
    return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '')
  }

  function threeDigit(n: number): string {
    if (n === 0) return ''
    if (n < 100) return twoDigit(n)
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigit(n % 100) : '')
  }

  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const rest = n % 1000

  const parts: string[] = []
  if (crore) parts.push(threeDigit(crore) + ' Crore')
  if (lakh) parts.push(twoDigit(lakh) + ' Lakh')
  if (thousand) parts.push(twoDigit(thousand) + ' Thousand')
  if (rest) parts.push(threeDigit(rest))

  return parts.join(' ')
}

/** Format date: "15 Jan 2025" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Format relative time: "2 hours ago" */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

/** Today's date as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Add days to a date, return YYYY-MM-DD */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * GlobalSearch — ⌘K command palette style search
 * Opens on Ctrl+K / Cmd+K or clicking the search pill in the navbar.
 * Searches across contacts, products, invoices, quotes, POs, bills.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, Package, FileText, ShoppingBag, Receipt, ArrowRight } from 'lucide-react'
import { useLocalStore } from '@/hooks/useLocalStore'
import {
  MOCK_CONTACTS, MOCK_PRODUCTS, MOCK_INVOICES,
  MOCK_QUOTES, MOCK_SALES_ORDERS, MOCK_PURCHASE_ORDERS, MOCK_BILLS,
} from '@/lib/mockData'
import type { Contact, Product, Invoice, Quote, SalesOrder, PurchaseOrder, Bill } from '@/types'
import { tokens } from '@/components/ui-kit/tokens'
import { formatCurrency } from '@/lib/format'

interface SearchResult {
  id: string
  type: 'contact' | 'product' | 'invoice' | 'quote' | 'sales-order' | 'purchase-order' | 'bill'
  title: string
  subtitle: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
}

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  contact: 'Contacts',
  product: 'Products',
  invoice: 'Invoices',
  quote: 'Quotes',
  'sales-order': 'Sales Orders',
  'purchase-order': 'Purchase Orders',
  bill: 'Bills',
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

/** Outer shell — zero hooks when closed; mounts inner only when open */
export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  if (!open) return null
  return <GlobalSearchInner onClose={onClose} />
}

/** Inner component — all expensive hooks only run when search is open */
function GlobalSearchInner({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const { items: invoices } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const { items: quotes } = useLocalStore<Quote>('quotes', MOCK_QUOTES)
  const { items: salesOrders } = useLocalStore<SalesOrder>('sales-orders', MOCK_SALES_ORDERS)
  const { items: purchaseOrders } = useLocalStore<PurchaseOrder>('purchase-orders', MOCK_PURCHASE_ORDERS)
  const { items: bills } = useLocalStore<Bill>('bills', MOCK_BILLS)

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.trim().toLowerCase()

  const results: SearchResult[] = q.length < 1 ? [] : [
    ...contacts
      .filter(c => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.gstin?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({
        id: c.id, type: 'contact' as const,
        title: c.name,
        subtitle: `${c.type} · ${c.email ?? '—'}`,
        href: `/contacts/${c.id}`,
        icon: Users,
        badge: c.type,
        badgeColor: c.type === 'customer' ? tokens.color.info : tokens.color.sunsetOrange,
      })),
    ...products
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({
        id: p.id, type: 'product' as const,
        title: p.name,
        subtitle: `SKU: ${p.sku} · ${formatCurrency(p.selling_price)}`,
        href: `/products/${p.id}`,
        icon: Package,
        badge: p.category,
        badgeColor: tokens.color.text3,
      })),
    ...invoices
      .filter(i => i.number.toLowerCase().includes(q) || i.customer_name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(i => ({
        id: i.id, type: 'invoice' as const,
        title: i.number,
        subtitle: `${i.customer_name} · ${formatCurrency(i.total_amount)}`,
        href: `/sales/invoices/${i.id}`,
        icon: FileText,
        badge: i.status,
        badgeColor: i.status === 'paid' ? tokens.color.success : i.status === 'overdue' ? tokens.color.danger : tokens.color.text3,
      })),
    ...quotes
      .filter(qt => qt.number.toLowerCase().includes(q) || qt.customer_name.toLowerCase().includes(q))
      .slice(0, 2)
      .map(qt => ({
        id: qt.id, type: 'quote' as const,
        title: qt.number,
        subtitle: `${qt.customer_name} · ${formatCurrency(qt.total_amount)}`,
        href: `/sales/quotes/${qt.id}`,
        icon: FileText,
        badge: qt.status,
        badgeColor: tokens.color.text3,
      })),
    ...salesOrders
      .filter(so => so.number.toLowerCase().includes(q) || so.customer_name.toLowerCase().includes(q))
      .slice(0, 2)
      .map(so => ({
        id: so.id, type: 'sales-order' as const,
        title: so.number,
        subtitle: `${so.customer_name} · ${formatCurrency(so.total_amount)}`,
        href: `/sales/orders/${so.id}`,
        icon: ShoppingBag,
        badge: so.status,
        badgeColor: tokens.color.text3,
      })),
    ...purchaseOrders
      .filter(po => po.number.toLowerCase().includes(q) || po.vendor_name.toLowerCase().includes(q))
      .slice(0, 2)
      .map(po => ({
        id: po.id, type: 'purchase-order' as const,
        title: po.number,
        subtitle: `${po.vendor_name} · ${formatCurrency(po.total_amount)}`,
        href: `/purchasing/orders/${po.id}`,
        icon: ShoppingBag,
        badge: po.status,
        badgeColor: tokens.color.text3,
      })),
    ...bills
      .filter(b => b.number.toLowerCase().includes(q) || b.vendor_name.toLowerCase().includes(q))
      .slice(0, 2)
      .map(b => ({
        id: b.id, type: 'bill' as const,
        title: b.number,
        subtitle: `${b.vendor_name} · ${formatCurrency(b.total_amount)}`,
        href: `/purchasing/bills/${b.id}`,
        icon: Receipt,
        badge: b.status,
        badgeColor: tokens.color.text3,
      })),
  ]

  const navigate_to = useCallback((href: string) => {
    navigate(href)
    onClose()
  }, [navigate, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[selectedIdx]) { navigate_to(results[selectedIdx].href) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selectedIdx, onClose, navigate_to])

  // Scroll selected item into view
  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  if (!open) return null

  // Group results by type
  const grouped: Partial<Record<SearchResult['type'], SearchResult[]>> = {}
  results.forEach(r => {
    if (!grouped[r.type]) grouped[r.type] = []
    grouped[r.type]!.push(r)
  })

  let flatIdx = 0
  const typeKeys = Object.keys(grouped) as SearchResult['type'][]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl animate-fade-in"
        style={{ maxHeight: '75vh' }}
      >
        <div
          className="flex flex-col overflow-hidden"
          style={{
            background: tokens.glass.bg,
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            border: `1px solid ${tokens.glass.border}`,
            borderRadius: tokens.radius.lg,
            boxShadow: tokens.shadow.xl,
          }}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: tokens.glass.border }}
          >
            <Search size={16} style={{ color: tokens.color.text3, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search contacts, products, invoices…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: tokens.color.text1 }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: tokens.color.text3 }}>
                <X size={14} />
              </button>
            )}
            <kbd
              className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
              style={{
                background: tokens.glass.inputBg,
                border: `1px solid ${tokens.glass.inputBorder}`,
                color: tokens.color.text3,
                fontSize: 11,
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 60px)' }} ref={listRef}>
            {q.length === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: tokens.color.text3 }}>
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                Type to search across all records…
              </div>
            )}

            {q.length > 0 && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: tokens.color.text3 }}>
                No results for "<strong style={{ color: tokens.color.text2 }}>{query}</strong>"
              </div>
            )}

            {typeKeys.map(type => (
              <div key={type}>
                <div
                  className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider sticky top-0"
                  style={{
                    color: tokens.color.text3,
                    background: tokens.glass.bg,
                    backdropFilter: tokens.glass.blur,
                    borderBottom: `1px solid ${tokens.glass.border}`,
                  }}
                >
                  {TYPE_LABELS[type]}
                </div>
                {grouped[type]!.map(result => {
                  const isSelected = flatIdx === selectedIdx
                  const currentIdx = flatIdx++
                  const Icon = result.icon
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? 'rgba(255,142,83,0.08)' : 'transparent',
                        borderBottom: `1px solid ${tokens.glass.border}`,
                      }}
                      onClick={() => navigate_to(result.href)}
                      onMouseEnter={() => setSelectedIdx(currentIdx)}
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,142,83,0.1)' }}
                      >
                        <Icon size={15} style={{ color: tokens.color.sunsetOrange }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: tokens.color.text1 }}>
                          {result.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: tokens.color.text3 }}>
                          {result.subtitle}
                        </p>
                      </div>
                      {result.badge && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                          style={{
                            background: 'rgba(255,142,83,0.1)',
                            color: result.badgeColor ?? tokens.color.text3,
                            fontSize: 11,
                          }}
                        >
                          {result.badge.replace('_', ' ')}
                        </span>
                      )}
                      <ArrowRight size={13} style={{ color: tokens.color.text3, flexShrink: 0, opacity: isSelected ? 1 : 0 }} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div
              className="flex items-center gap-4 px-4 py-2 text-xs border-t"
              style={{ borderColor: tokens.glass.border, color: tokens.color.text3 }}
            >
              <span><kbd style={{ background: tokens.glass.inputBg, padding: '1px 5px', borderRadius: 3, border: `1px solid ${tokens.glass.inputBorder}` }}>↑↓</kbd> navigate</span>
              <span><kbd style={{ background: tokens.glass.inputBg, padding: '1px 5px', borderRadius: 3, border: `1px solid ${tokens.glass.inputBorder}` }}>↵</kbd> open</span>
              <span><kbd style={{ background: tokens.glass.inputBg, padding: '1px 5px', borderRadius: 3, border: `1px solid ${tokens.glass.inputBorder}` }}>Esc</kbd> close</span>
              <span className="ml-auto">{results.length} result{results.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

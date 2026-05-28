import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassSelect, GlassTable } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVOICES, MOCK_CONTACTS, MOCK_PRODUCTS } from '@/lib/mockData'
import type { Invoice, Contact, Product } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

interface CustomerRow {
  id: string
  name: string
  invoice_count: number
  revenue: number
  outstanding: number
}

interface ProductRow {
  id: string
  name: string
  sku: string
  qty_sold: number
  revenue: number
  margin_pct: number
}

interface AgingRow {
  id: string
  customer: string
  invoice: string
  current: number
  d30: number
  d60: number
  d90: number
  d90plus: number
  total: number
}

export default function SalesReports() {
  const [tab, setTab] = useState<'customer' | 'product' | 'aging_rec' | 'aging_pay'>('customer')
  const { items: invoices } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)

  useEffect(() => { document.title = 'Sales Reports | ERP' }, [])

  const confirmedInvoices = invoices.filter(i => i.status !== 'draft' && i.status !== 'cancelled')

  // Sales by Customer
  const customerMap: Record<string, CustomerRow> = {}
  confirmedInvoices.forEach(inv => {
    if (!customerMap[inv.customer_id]) {
      customerMap[inv.customer_id] = {
        id: inv.customer_id, name: inv.customer_name,
        invoice_count: 0, revenue: 0, outstanding: 0,
      }
    }
    customerMap[inv.customer_id].invoice_count++
    customerMap[inv.customer_id].revenue += inv.total_amount
    customerMap[inv.customer_id].outstanding += inv.amount_due
  })
  const customerRows = Object.values(customerMap).sort((a, b) => b.revenue - a.revenue)

  // Sales by Product
  const productMap: Record<string, ProductRow> = {}
  confirmedInvoices.forEach(inv => {
    inv.lines.forEach(line => {
      if (!productMap[line.product_id]) {
        const prod = products.find(p => p.id === line.product_id)
        productMap[line.product_id] = {
          id: line.product_id, name: line.product_name,
          sku: prod?.sku ?? '—', qty_sold: 0, revenue: 0, margin_pct: 0,
        }
      }
      productMap[line.product_id].qty_sold += line.quantity
      productMap[line.product_id].revenue += line.line_total
    })
  })
  Object.values(productMap).forEach(r => {
    const prod = products.find(p => p.id === r.id)
    if (prod && r.revenue > 0) {
      const cost = prod.cost_price * r.qty_sold
      r.margin_pct = ((r.revenue - cost) / r.revenue) * 100
    }
  })
  const productRows = Object.values(productMap).sort((a, b) => b.revenue - a.revenue)

  // Aging Receivables
  const today = new Date()
  const agingRows: AgingRow[] = confirmedInvoices
    .filter(i => i.amount_due > 0)
    .map(i => {
      const due = new Date(i.due_date)
      const days = Math.floor((today.getTime() - due.getTime()) / 86400000)
      const amt = i.amount_due
      return {
        id: i.id,
        customer: i.customer_name,
        invoice: i.number,
        current: days <= 0 ? amt : 0,
        d30: days > 0 && days <= 30 ? amt : 0,
        d60: days > 31 && days <= 60 ? amt : 0,
        d90: days > 61 && days <= 90 ? amt : 0,
        d90plus: days > 90 ? amt : 0,
        total: amt,
      }
    })

  const customerColumns: TableColumn<CustomerRow>[] = [
    {
      key: 'name', header: 'Customer', width: '2fr',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.name}</span>,
    },
    {
      key: 'invoice_count', header: 'Invoices', width: '90px', align: 'right',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.invoice_count}</span>,
    },
    {
      key: 'revenue', header: 'Revenue', width: '150px', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.revenue)}</span>,
    },
    {
      key: 'outstanding', header: 'Outstanding', width: '150px', align: 'right',
      render: r => <span style={{ color: r.outstanding > 0 ? tokens.color.danger : tokens.color.text2, fontSize: 13 }}>{formatCurrency(r.outstanding)}</span>,
    },
  ]

  const productColumns: TableColumn<ProductRow>[] = [
    {
      key: 'name', header: 'Product', width: '2fr',
      render: r => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{r.name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>SKU: {r.sku}</p>
        </div>
      ),
    },
    {
      key: 'qty_sold', header: 'Qty Sold', width: '100px', align: 'right',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.qty_sold}</span>,
    },
    {
      key: 'revenue', header: 'Revenue', width: '150px', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.revenue)}</span>,
    },
    {
      key: 'margin_pct', header: 'Margin %', width: '100px', align: 'right',
      render: r => (
        <span style={{ color: r.margin_pct >= 20 ? tokens.color.success : tokens.color.warning, fontSize: 13, fontWeight: 600 }}>
          {r.margin_pct.toFixed(1)}%
        </span>
      ),
    },
  ]

  const agingColumns: TableColumn<AgingRow>[] = [
    {
      key: 'customer', header: 'Customer', width: '1.5fr',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{r.customer}</span>,
    },
    {
      key: 'invoice', header: 'Invoice', width: '100px',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 12, fontFamily: 'monospace' }}>{r.invoice}</span>,
    },
    {
      key: 'current', header: 'Current', width: '120px', align: 'right',
      render: r => <span style={{ color: tokens.color.success, fontSize: 12 }}>{r.current > 0 ? formatCurrency(r.current) : '—'}</span>,
    },
    {
      key: 'd30', header: '1–30d', width: '110px', align: 'right',
      render: r => <span style={{ color: tokens.color.warning, fontSize: 12 }}>{r.d30 > 0 ? formatCurrency(r.d30) : '—'}</span>,
    },
    {
      key: 'd60', header: '31–60d', width: '110px', align: 'right',
      render: r => <span style={{ color: tokens.color.sunsetOrange, fontSize: 12 }}>{r.d60 > 0 ? formatCurrency(r.d60) : '—'}</span>,
    },
    {
      key: 'd90', header: '61–90d', width: '110px', align: 'right',
      render: r => <span style={{ color: tokens.color.danger, fontSize: 12 }}>{r.d90 > 0 ? formatCurrency(r.d90) : '—'}</span>,
    },
    {
      key: 'd90plus', header: '90d+', width: '110px', align: 'right',
      render: r => <span style={{ color: tokens.color.danger, fontSize: 12, fontWeight: 600 }}>{r.d90plus > 0 ? formatCurrency(r.d90plus) : '—'}</span>,
    },
    {
      key: 'total', header: 'Total', width: '130px', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 700 }}>{formatCurrency(r.total)}</span>,
    },
  ]

  const TABS = [
    { key: 'customer' as const, label: 'By Customer' },
    { key: 'product' as const, label: 'By Product' },
    { key: 'aging_rec' as const, label: 'Aging Receivables' },
  ]

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="Sales Reports"
        subtitle="Customer revenue, product performance and aging analysis"
        actions={
          <GlassButton variant="secondary" icon={Download} onClick={() => window.print()}>
            Export PDF
          </GlassButton>
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm font-medium rounded-pill transition-all"
              style={{
                background: tab === t.key ? tokens.gradient.sunset : tokens.glass.bg,
                color: tab === t.key ? 'white' : tokens.color.text2,
                border: tab === t.key ? 'none' : `1px solid ${tokens.glass.border}`,
                boxShadow: tab === t.key ? tokens.shadow.sunset : tokens.shadow.sm,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            {tab === 'customer' && (
              <GlassTable
                columns={customerColumns}
                data={customerRows as unknown as Record<string, unknown>[]}
                rowKey="id"
                emptyText="No sales data"
                emptySubtext="Confirm invoices to see customer sales."
              />
            )}
            {tab === 'product' && (
              <GlassTable
                columns={productColumns}
                data={productRows as unknown as Record<string, unknown>[]}
                rowKey="id"
                emptyText="No product sales data"
                emptySubtext="Confirm invoices with product lines to see this report."
              />
            )}
            {tab === 'aging_rec' && (
              <>
                <div className="overflow-x-auto">
                  <GlassTable
                    columns={agingColumns}
                    data={agingRows as unknown as Record<string, unknown>[]}
                    rowKey="id"
                    emptyText="No outstanding receivables"
                    emptySubtext="All invoices are paid or no confirmed invoices exist."
                  />
                </div>
                {agingRows.length > 0 && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-6 gap-2 text-center" style={{ borderColor: tokens.glass.border }}>
                    {(['Current', '1–30d', '31–60d', '61–90d', '90d+', 'Total'] as const).map((label, i) => {
                      const keys: (keyof AgingRow)[] = ['current', 'd30', 'd60', 'd90', 'd90plus', 'total']
                      const total = agingRows.reduce((s, r) => s + (r[keys[i]] as number), 0)
                      return (
                        <div key={label}>
                          <p className="text-xs mb-0.5" style={{ color: tokens.color.text3 }}>{label}</p>
                          <p className="text-xs font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(total)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </GlassCard>
      </PageLayout>
    </>
  )
}

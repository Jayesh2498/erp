import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Scale, Columns, Percent, ShoppingCart, Package, DollarSign, FileText, Clock } from 'lucide-react'
import { PageLayout, GlassCard, GlassBadge } from '@/components/ui-kit'
import { tokens } from '@/components/ui-kit/tokens'
import { DemoBanner } from '@/components/DemoBanner'

interface ReportTile {
  title: string
  description: string
  href: string
  icon: React.ElementType
  comingSoon?: boolean
}

const REPORTS: ReportTile[] = [
  { title: 'Profit & Loss', description: 'Revenue, expenses and net profit for any date range.', href: '/reports/pnl', icon: TrendingUp },
  { title: 'Balance Sheet', description: 'Assets, liabilities and equity as of any date.', href: '/reports/balance-sheet', icon: Scale },
  { title: 'Trial Balance', description: 'All account balances — debits must equal credits.', href: '/reports/trial-balance', icon: Columns },
  { title: 'TDS Report', description: 'Vendor-wise TDS deductions with PAN and section details.', href: '/reports/tds', icon: Percent },
  { title: 'Sales Reports', description: 'Sales by customer, by product, and aging receivables.', href: '/reports/sales', icon: ShoppingCart },
  { title: 'Stock Summary', description: 'Warehouse-wise stock quantity, value and reorder status.', href: '/reports/stock', icon: Package },
  { title: 'Cash Flow Statement', description: 'Operating, investing and financing cash flows.', href: '/reports/cashflow', icon: DollarSign, comingSoon: true },
  { title: 'GSTR-1', description: 'Monthly GST outward supplies return.', href: '/reports/gstr1', icon: FileText, comingSoon: true },
  { title: 'GSTR-3B', description: 'Monthly GST summary return filing data.', href: '/reports/gstr3b', icon: FileText, comingSoon: true },
  { title: 'Comparison Reports', description: 'Month-over-month and year-over-year comparisons.', href: '/reports/comparison', icon: TrendingUp, comingSoon: true },
]

export default function ReportsPage() {
  const navigate = useNavigate()
  useEffect(() => { document.title = 'Reports | ERP' }, [])

  return (
    <>
      <DemoBanner />
      <PageLayout title="Reports" subtitle="Financial statements and business insights">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map(r => {
            const Icon = r.icon
            return (
              <GlassCard
                key={r.href}
                hover={!r.comingSoon}
                className="p-5"
                onClick={r.comingSoon ? undefined : () => navigate(r.href)}
                style={{ cursor: r.comingSoon ? 'default' : 'pointer', opacity: r.comingSoon ? 0.7 : 1 }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: tokens.surface.iconBubble }}
                    >
                      <Icon size={18} style={{ color: tokens.color.sunsetOrange }} />
                    </div>
                    {r.comingSoon && (
                      <GlassBadge variant="neutral">
                        <Clock size={10} className="mr-1" />
                        Soon
                      </GlassBadge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: tokens.color.text1 }}>{r.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: tokens.color.text3 }}>{r.description}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </PageLayout>
    </>
  )
}

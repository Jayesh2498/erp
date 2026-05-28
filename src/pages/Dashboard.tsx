import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Plus, FileText, DollarSign, ShoppingBag, Users, TrendingUp, AlertCircle, Package } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { StatCard, GlassCard, GlassButton, ActivityDot } from '@/components/ui-kit'
import { tokens } from '@/components/ui-kit/tokens'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { MOCK_INVOICES, MOCK_BILLS, MOCK_INVENTORY } from '@/lib/mockData'

function getGreeting(name: string): string {
  const h = new Date().getHours()
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${time}, ${name.split(' ')[0]}`
}

const revenueData = [
  { month: 'Dec', revenue: 1240000 },
  { month: 'Jan', revenue: 1850000 },
  { month: 'Feb', revenue: 2100000 },
  { month: 'Mar', revenue: 1680000 },
  { month: 'Apr', revenue: 2450000 },
  { month: 'May', revenue: 1622300 },
]

export default function Dashboard() {
  const { user, workspace } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { document.title = 'Dashboard | ERP' }, [])

  // Metrics — memoised so they only recompute when mock data identity changes
  const thisMonthRevenue = useMemo(() =>
    MOCK_INVOICES
      .filter(i => i.status !== 'draft' && i.status !== 'cancelled' && i.date.startsWith('2026-05'))
      .reduce((s, i) => s + i.total_amount, 0),
  [])

  const totalReceivables = useMemo(() =>
    MOCK_INVOICES
      .filter(i => ['confirmed', 'partially_paid', 'overdue'].includes(i.status))
      .reduce((s, i) => s + i.amount_due, 0),
  [])

  const overdueCount = useMemo(() =>
    MOCK_INVOICES.filter(i => i.status === 'overdue').length,
  [])

  const totalPayables = useMemo(() =>
    MOCK_BILLS
      .filter(i => ['confirmed', 'partially_paid', 'overdue'].includes(i.status))
      .reduce((s, i) => s + i.amount_due, 0),
  [])

  const cashPosition = 4820000 + 1250000 + 125000

  const lowStockCount = useMemo(() =>
    MOCK_INVENTORY.filter(i => i.quantity <= i.reorder_point).length,
  [])

  const recentActivity = [
    { id: 'act-1', type: 'invoice', label: 'INV-0005 created for HCL Technologies', date: '2026-05-12', color: tokens.dot.info, link: '/sales/invoices/inv-5' },
    { id: 'act-2', type: 'payment', label: 'Payment ₹73,400 received for INV-0005', date: '2026-05-20', color: tokens.dot.success, link: '/sales/invoices/inv-5' },
    { id: 'act-3', type: 'bill', label: 'BILL-0002 from Samsung India ₹3,58,720', date: '2026-05-22', color: tokens.dot.orange, link: '/purchasing/bills/bill-2' },
    { id: 'act-4', type: 'overdue', label: 'INV-0003 from Infosys is overdue', date: '2026-05-15', color: tokens.dot.danger, link: '/sales/invoices/inv-3' },
    { id: 'act-5', type: 'po', label: 'PO-0003 sent to Arrow Electronics', date: '2026-05-18', color: tokens.dot.orange, link: '/purchasing/orders/po-3' },
    { id: 'act-6', type: 'invoice', label: 'INV-0004 draft created for Wipro', date: '2026-05-10', color: tokens.dot.info, link: '/sales/invoices/inv-4' },
    { id: 'act-7', type: 'payment', label: 'Payment ₹2,95,000 received for INV-0001', date: '2026-05-15', color: tokens.dot.success, link: '/sales/invoices/inv-1' },
  ]

  return (
    <div className="space-y-6">
      <DemoBanner />

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: tokens.color.text1 }}>
          {getGreeting(user?.name ?? 'User')} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: tokens.color.text3 }}>
          {workspace?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(thisMonthRevenue)}
          change="+12.4%"
          changeType="up"
          icon={TrendingUp}
          sparklineData={[42, 55, 49, 60, 58, 72, 80]}
        />
        <StatCard
          label="Total Receivables"
          value={formatCurrency(totalReceivables)}
          change={overdueCount > 0 ? `${overdueCount} overdue` : 'All current'}
          changeType={overdueCount > 0 ? 'down' : 'neutral'}
          icon={FileText}
          sparklineData={[80, 65, 70, 85, 78, 90, 95]}
        />
        <StatCard
          label="Total Payables"
          value={formatCurrency(totalPayables)}
          change="Due in 30d"
          changeType="neutral"
          icon={ShoppingBag}
          sparklineData={[50, 60, 55, 45, 58, 52, 48]}
        />
        <StatCard
          label="Cash Position"
          value={formatCurrency(cashPosition)}
          change="+5.2%"
          changeType="up"
          icon={DollarSign}
          sparklineData={[60, 65, 70, 68, 75, 80, 85]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <GlassCard size="lg" hover={false} className="p-5 lg:col-span-2">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>
              Revenue — Last 6 Months
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={`rgba(180,100,40,0.08)`} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: tokens.color.text3 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11, fill: tokens.color.text3 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{
                    background: tokens.glass.bg,
                    border: `1px solid ${tokens.glass.border}`,
                    borderRadius: tokens.radius.sm,
                    backdropFilter: tokens.glass.blur,
                    color: tokens.color.text1,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                  fill="url(#sunsetGrad)"
                />
                <defs>
                  <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8E53" />
                    <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Business snapshot */}
        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>
              Business Snapshot
            </h3>
            <div className="space-y-4">
              {/* Revenue target */}
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: tokens.color.text2 }}>
                  <span>Revenue Target (May)</span>
                  <span>{Math.round((thisMonthRevenue / 2500000) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: tokens.glass.inputBg }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((thisMonthRevenue / 2500000) * 100, 100)}%`,
                      background: 'var(--gradient-sunset)',
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: tokens.color.text3 }}>
                  {formatCurrency(thisMonthRevenue)} of {formatCurrency(2500000)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Overdue Invoices', value: overdueCount, icon: AlertCircle, color: tokens.color.danger },
                  { label: 'Pending POs', value: 2, icon: ShoppingBag, color: tokens.color.sunsetOrange },
                  { label: 'Low Stock Items', value: lowStockCount, icon: Package, color: tokens.color.warning },
                  { label: 'Active Customers', value: 5, icon: Users, color: tokens.color.info },
                ].map(item => (
                  <div
                    key={item.label}
                    className="p-3 rounded-md"
                    style={{ background: tokens.glass.inputBg, border: `1px solid ${tokens.glass.border}` }}
                  >
                    <item.icon size={16} style={{ color: item.color }} />
                    <p className="text-xl font-bold mt-1" style={{ color: tokens.color.text1 }}>
                      {item.value}
                    </p>
                    <p className="text-xs" style={{ color: tokens.color.text3 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <GlassCard size="lg" hover={false} className="p-5 lg:col-span-2">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 py-2 cursor-pointer rounded-sm px-2 -mx-2 transition-colors"
                  onClick={() => navigate(a.link)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,142,83,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <ActivityDot color={a.color} size={8} />
                  <span className="flex-1 text-sm" style={{ color: tokens.color.text2 }}>{a.label}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: tokens.color.text3 }}>
                    {formatDate(a.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Quick actions */}
        {user?.role !== 'viewer' && (
          <GlassCard size="lg" hover={false} className="p-5">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Create Invoice', icon: Plus, href: '/sales/invoices/new', primary: true },
                  { label: 'Create Purchase Order', icon: ShoppingBag, href: '/purchasing/orders/new', primary: false },
                  { label: 'Add Contact', icon: Users, href: '/contacts/new', primary: false },
                  { label: 'Create Quote', icon: FileText, href: '/sales/quotes/new', primary: false },
                ].map(action => (
                  <GlassButton
                    key={action.label}
                    variant={action.primary ? 'primary' : 'secondary'}
                    icon={action.icon}
                    className="w-full justify-start"
                    onClick={() => navigate(action.href)}
                    size="sm"
                  >
                    {action.label}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Download, AlertTriangle } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_ACCOUNTS, MOCK_FIXED_ASSETS } from '@/lib/mockData'
import type { Account, FixedAsset } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

function SectionRow({ label, value, indent = false, isTotal = false }:
  { label: string; value: number; indent?: boolean; isTotal?: boolean }) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${indent ? 'pl-6' : ''} ${isTotal ? 'border-t font-semibold' : ''}`}
      style={{ borderColor: isTotal ? tokens.glass.border : 'transparent' }}
    >
      <span className="text-sm" style={{ color: isTotal ? tokens.color.text1 : tokens.color.text2 }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: tokens.color.text1 }}>
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  )
}

export default function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10))
  const { items: accounts } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)
  const { items: fixedAssets } = useLocalStore<FixedAsset>('fixed_assets', MOCK_FIXED_ASSETS)

  useEffect(() => { document.title = 'Balance Sheet | ERP' }, [])

  const assets = accounts.filter(a => a.type === 'asset' && a.is_active)
  const liabilities = accounts.filter(a => a.type === 'liability' && a.is_active)
  const equity = accounts.filter(a => a.type === 'equity' && a.is_active)

  // Fixed assets net book value (add as special section)
  const totalFixedAssetCost = fixedAssets.filter(a => a.status !== 'disposed').reduce((s, a) => s + a.purchase_cost, 0)
  const totalAccumDep = fixedAssets.filter(a => a.status !== 'disposed').reduce((s, a) => s + a.accumulated_depreciation, 0)
  const totalFixedNBV = totalFixedAssetCost - totalAccumDep

  // Current assets (exclude fixed asset accounts — show under fixed assets section)
  const currentAssets = assets.filter(a => !a.name.toLowerCase().includes('fixed') && !a.name.toLowerCase().includes('accum'))
  const totalCurrentAssets = currentAssets.reduce((s, a) => s + Math.abs(a.balance), 0)
  const totalAssets = totalCurrentAssets + totalFixedNBV

  const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0)

  // Revenue - Expenses = Retained Earnings
  const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((s, a) => s + a.balance, 0)
  const totalExpenses = accounts.filter(a => a.type === 'expense').reduce((s, a) => s + a.balance, 0)
  const retainedEarnings = totalRevenue - totalExpenses
  const equityTotal = equity.reduce((s, a) => s + a.balance, 0) + retainedEarnings
  const totalLiabEquity = totalLiabilities + equityTotal
  const diff = Math.abs(totalAssets - totalLiabEquity)
  const isBalanced = diff < 1

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="Balance Sheet"
        subtitle="Financial position as of a date"
        actions={
          <div className="flex gap-2 items-center">
            <div>
              <label className="text-xs mr-2" style={{ color: tokens.color.text3 }}>As of</label>
              <input
                type="date"
                value={asOfDate}
                onChange={e => setAsOfDate(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-md"
                style={{
                  background: tokens.glass.inputBg,
                  border: `1px solid ${tokens.glass.inputBorder}`,
                  color: tokens.color.text1,
                  outline: 'none',
                }}
              />
            </div>
            <GlassButton variant="secondary" icon={Download} onClick={() => window.print()}>
              Export PDF
            </GlassButton>
          </div>
        }
      >
        {!isBalanced && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-4"
            style={{ background: tokens.surface.dangerTint, border: `1px solid ${tokens.surface.dangerTintBorder}` }}
          >
            <AlertTriangle size={16} style={{ color: tokens.color.danger, flexShrink: 0 }} />
            <p className="text-sm" style={{ color: tokens.color.danger }}>
              Balance sheet does not balance. Difference: {formatCurrency(diff)}. Check journal entries.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Assets */}
          <GlassCard size="lg" hover={false} className="p-5">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: tokens.color.text3 }}>Assets</h3>
              </div>

              <p className="text-xs font-semibold mb-2" style={{ color: tokens.color.text3 }}>Current Assets</p>
              {currentAssets.map(a => <SectionRow key={a.id} label={a.name} value={Math.abs(a.balance)} indent />)}
              <SectionRow label="Total Current Assets" value={totalCurrentAssets} isTotal />

              <div className="h-4" />

              <p className="text-xs font-semibold mb-2" style={{ color: tokens.color.text3 }}>Fixed Assets</p>
              <SectionRow label="Gross Fixed Assets" value={totalFixedAssetCost} indent />
              <SectionRow label="Less: Accumulated Depreciation" value={totalAccumDep} indent />
              <SectionRow label="Net Fixed Assets" value={totalFixedNBV} isTotal />

              <div className="h-4" />
              <div
                className="flex justify-between items-center p-3 rounded-xl"
                style={{ background: tokens.surface.iconBubble }}
              >
                <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>Total Assets</span>
                <span className="text-base font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Liabilities + Equity */}
          <div className="space-y-4">
            <GlassCard size="lg" hover={false} className="p-5">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: tokens.color.text3 }}>Liabilities</p>
                {liabilities.map(a => <SectionRow key={a.id} label={a.name} value={Math.abs(a.balance)} indent />)}
                <SectionRow label="Total Liabilities" value={totalLiabilities} isTotal />
              </div>
            </GlassCard>

            <GlassCard size="lg" hover={false} className="p-5">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: tokens.color.text3 }}>Equity</p>
                {equity.map(a => <SectionRow key={a.id} label={a.name} value={a.balance} indent />)}
                <SectionRow label="Retained Earnings" value={retainedEarnings} indent />
                <SectionRow label="Total Equity" value={equityTotal} isTotal />
              </div>
            </GlassCard>

            <div
              className="p-4 rounded-xl"
              style={{
                background: isBalanced ? tokens.surface.successTint : tokens.surface.dangerTint,
                border: `1px solid ${isBalanced ? tokens.surface.successTintBorder : tokens.surface.dangerTintBorder}`,
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>Total Liab + Equity</span>
                <span className="text-base font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalLiabEquity)}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: isBalanced ? tokens.color.success : tokens.color.danger }}>
                {isBalanced ? '✓ Balanced' : `Out of balance by ${formatCurrency(diff)}`}
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}

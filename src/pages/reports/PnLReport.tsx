import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassSelect } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_ACCOUNTS, MOCK_JOURNAL_ENTRIES } from '@/lib/mockData'
import type { Account, JournalEntry } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

const FISCAL_MONTHS = [
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-01', label: 'January 2026' },
  { value: '2025-12', label: 'December 2025' },
]

function ReportRow({ label, value, isTotal = false, isNegative = false, indent = false, highlight = false }:
  { label: string; value: number; isTotal?: boolean; isNegative?: boolean; indent?: boolean; highlight?: boolean }) {
  const displayValue = isNegative ? -Math.abs(value) : value
  return (
    <div
      className={`flex justify-between items-center py-2 ${indent ? 'pl-6' : ''} ${isTotal ? 'border-t' : ''}`}
      style={{
        borderColor: isTotal ? tokens.glass.border : 'transparent',
        background: highlight ? tokens.surface.iconBubble : 'transparent',
        borderRadius: highlight ? '8px' : 0,
        padding: highlight ? '10px 12px' : undefined,
      }}
    >
      <span
        className={`text-sm ${isTotal ? 'font-bold' : 'font-medium'}`}
        style={{ color: isTotal ? tokens.color.text1 : tokens.color.text2 }}
      >
        {label}
      </span>
      <span
        className={`text-sm font-${isTotal ? 'bold' : 'semibold'} tabular-nums`}
        style={{ color: tokens.color.text1 }}
      >
        {formatCurrency(Math.abs(displayValue))}
      </span>
    </div>
  )
}

export default function PnLReport() {
  const [period, setPeriod] = useState('2026-05')
  const { items: accounts } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)
  const { items: journalEntries } = useLocalStore<JournalEntry>('journal_entries', MOCK_JOURNAL_ENTRIES)

  useEffect(() => { document.title = 'P&L Report | ERP' }, [])

  // Derive P&L from accounts (simplified — use GL balances)
  const revenue = accounts.filter(a => a.type === 'revenue' && a.name !== 'Sales Returns')
    .reduce((s, a) => s + a.balance, 0)
  const salesReturns = accounts.find(a => a.name === 'Sales Returns')?.balance ?? 0
  const netRevenue = revenue - salesReturns

  const cogs = accounts.filter(a => a.type === 'expense' && a.name.toLowerCase().includes('purchase'))
    .reduce((s, a) => s + a.balance, 0)
  const grossProfit = netRevenue - cogs

  const operatingExpenses = accounts
    .filter(a => a.type === 'expense' && !a.name.toLowerCase().includes('purchase') && !a.name.toLowerCase().includes('depreciation'))
    .reduce((s, a) => s + a.balance, 0)
  const depreciation = accounts
    .filter(a => a.type === 'expense' && a.name.toLowerCase().includes('depreciation'))
    .reduce((s, a) => s + a.balance, 0)
  const totalExpenses = operatingExpenses + depreciation

  const netProfit = grossProfit - totalExpenses

  const revenueAccounts = accounts.filter(a => a.type === 'revenue')
  const expenseAccounts = accounts.filter(a => a.type === 'expense')

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="Profit & Loss"
        subtitle="Income statement from general ledger"
        actions={
          <div className="flex gap-2">
            <GlassSelect
              placeholder="Select period"
              value={period}
              onChange={setPeriod}
              options={FISCAL_MONTHS}
            />
            <GlassButton variant="secondary" icon={Download} onClick={() => window.print()}>
              Export PDF
            </GlassButton>
          </div>
        }
      >
        <GlassCard size="lg" hover={false} className="p-6 max-w-2xl mx-auto">
          <div style={{ position: 'relative', zIndex: 1, fontFamily: 'inherit' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold" style={{ color: tokens.color.text1 }}>
                Stark Industries Pvt Ltd
              </h2>
              <p className="text-sm" style={{ color: tokens.color.text3 }}>
                Profit & Loss Statement · {FISCAL_MONTHS.find(m => m.value === period)?.label}
              </p>
            </div>

            <div className="space-y-1">
              {/* Revenue */}
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.color.text3 }}>
                Revenue
              </p>
              {revenueAccounts.map(a => (
                <ReportRow key={a.id} label={a.name} value={a.balance} indent />
              ))}
              <ReportRow label="Net Revenue" value={netRevenue} isTotal />

              <div className="h-4" />

              {/* COGS */}
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.color.text3 }}>
                Cost of Goods Sold
              </p>
              {accounts.filter(a => a.type === 'expense' && a.name.toLowerCase().includes('purchase')).map(a => (
                <ReportRow key={a.id} label={a.name} value={a.balance} indent />
              ))}
              <ReportRow label="Gross Profit" value={grossProfit} isTotal />

              <div className="h-4" />

              {/* Expenses */}
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.color.text3 }}>
                Operating Expenses
              </p>
              {expenseAccounts.filter(a => !a.name.toLowerCase().includes('purchase')).map(a => (
                <ReportRow key={a.id} label={a.name} value={a.balance} indent />
              ))}
              <ReportRow label="Total Expenses" value={totalExpenses} isTotal />

              <div className="h-4" />

              {/* Net */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: netProfit >= 0 ? tokens.surface.successTint : tokens.surface.dangerTint,
                  border: `1px solid ${netProfit >= 0 ? tokens.surface.successTintBorder : tokens.surface.dangerTintBorder}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold" style={{ color: tokens.color.text1 }}>Net Profit</span>
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{ color: netProfit >= 0 ? tokens.color.success : tokens.color.danger }}
                  >
                    {netProfit < 0 ? '−' : ''}{formatCurrency(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </PageLayout>
    </>
  )
}

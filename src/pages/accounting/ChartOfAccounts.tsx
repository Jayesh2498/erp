import React, { useEffect, useState } from 'react'
import { Lock, Plus } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassBadge, GlassModal, GlassInput, GlassSelect } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import type { Account } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
type AccountType = typeof ACCOUNT_TYPES[number]

const typeLabels: Record<AccountType, string> = {
  asset: 'Assets', liability: 'Liabilities', equity: 'Equity',
  revenue: 'Revenue', expense: 'Expenses',
}

const typeVariant: Record<AccountType, string> = {
  asset: 'info', liability: 'overdue', equity: 'paid',
  revenue: 'confirmed', expense: 'draft',
}

export default function ChartOfAccounts() {
  const { items: accounts, create } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAcc, setNewAcc] = useState({ code: '', name: '', type: 'asset' as AccountType })

  useEffect(() => { document.title = 'Chart of Accounts | ERP' }, [])

  const groupedAccounts = ACCOUNT_TYPES.reduce((acc, type) => {
    acc[type] = accounts.filter(a => a.type === type && a.is_active)
    return acc
  }, {} as Record<AccountType, Account[]>)

  const handleAddAccount = () => {
    if (!newAcc.code || !newAcc.name) return
    create({
      code: newAcc.code,
      name: newAcc.name,
      type: newAcc.type,
      balance: 0,
      is_system: false,
      is_active: true,
    } as Omit<Account, 'id'>)
    setShowAddModal(false)
    setNewAcc({ code: '', name: '', type: 'asset' })
  }

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((s, a) => s + a.balance, 0)
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((s, a) => s + a.balance, 0)
  const totalEquity = accounts.filter(a => a.type === 'equity').reduce((s, a) => s + a.balance, 0)
  const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((s, a) => s + a.balance, 0)
  const totalExpense = accounts.filter(a => a.type === 'expense').reduce((s, a) => s + a.balance, 0)

  const totals: Record<AccountType, number> = {
    asset: totalAssets, liability: totalLiabilities, equity: totalEquity,
    revenue: totalRevenue, expense: totalExpense,
  }

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="Chart of Accounts"
        subtitle={`${accounts.length} accounts`}
        actions={
          <GlassButton variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Account
          </GlassButton>
        }
      >
        <div className="space-y-4">
          {ACCOUNT_TYPES.map(type => (
            <GlassCard key={type} size="lg" hover={false} className="p-5">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GlassBadge variant={typeVariant[type] as 'info' | 'overdue' | 'paid' | 'confirmed' | 'draft'}>
                      {typeLabels[type]}
                    </GlassBadge>
                    <span className="text-xs" style={{ color: tokens.color.text3 }}>
                      {groupedAccounts[type].length} accounts
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>
                    {formatCurrency(totals[type])}
                  </span>
                </div>

                {/* Account rows */}
                <div className="space-y-1">
                  {/* Header row */}
                  <div className="grid grid-cols-[80px_1fr_140px_60px] gap-3 px-3 pb-1">
                    {['Code', 'Name', 'Balance', ''].map(h => (
                      <span key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.color.text3 }}>{h}</span>
                    ))}
                  </div>
                  {groupedAccounts[type].map(account => (
                    <div
                      key={account.id}
                      className="grid grid-cols-[80px_1fr_140px_60px] gap-3 px-3 py-2.5 rounded-sm items-center"
                      style={{ background: tokens.glass.inputBg, border: `1px solid ${tokens.glass.border}` }}
                    >
                      <span className="text-xs font-mono" style={{ color: tokens.color.text3 }}>{account.code}</span>
                      <span className="text-sm font-medium" style={{ color: tokens.color.text1 }}>{account.name}</span>
                      <span className="text-sm text-right" style={{ color: tokens.color.text1 }}>{formatCurrency(Math.abs(account.balance))}</span>
                      <div className="flex justify-end">
                        {account.is_system && <Lock size={12} style={{ color: tokens.color.text3 }} />}
                      </div>
                    </div>
                  ))}
                  {groupedAccounts[type].length === 0 && (
                    <p className="text-sm px-3 py-4" style={{ color: tokens.color.text3 }}>No accounts in this category.</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Account"
          footer={
            <>
              <GlassButton variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</GlassButton>
              <GlassButton variant="primary" onClick={handleAddAccount}>Add Account</GlassButton>
            </>
          }
        >
          <div className="space-y-4">
            <GlassInput label="Account Code" value={newAcc.code} onChange={v => setNewAcc(a => ({ ...a, code: v }))} placeholder="e.g. 1600" required />
            <GlassInput label="Account Name" value={newAcc.name} onChange={v => setNewAcc(a => ({ ...a, name: v }))} required />
            <GlassSelect
              label="Type"
              value={newAcc.type}
              onChange={v => setNewAcc(a => ({ ...a, type: v as AccountType }))}
              options={ACCOUNT_TYPES.map(t => ({ value: t, label: typeLabels[t] }))}
            />
          </div>
        </GlassModal>
      </PageLayout>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassTable } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import type { Account } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

interface TrialRow {
  id: string
  code: string
  name: string
  type: string
  debit: number
  credit: number
}

export default function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10))
  const { items: accounts } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)

  useEffect(() => { document.title = 'Trial Balance | ERP' }, [])

  // Convert account balances to debit/credit
  const rows: TrialRow[] = accounts
    .filter(a => a.is_active)
    .map(a => {
      const isDebitNormal = a.type === 'asset' || a.type === 'expense'
      const balance = a.balance
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        debit: isDebitNormal ? Math.max(0, balance) : Math.max(0, -balance),
        credit: isDebitNormal ? Math.max(0, -balance) : Math.max(0, balance),
      }
    })
    .sort((a, b) => a.code.localeCompare(b.code))

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
  const diff = Math.abs(totalDebit - totalCredit)
  const isBalanced = diff < 1

  const columns: TableColumn<TrialRow>[] = [
    {
      key: 'code', header: 'Code', width: '80px',
      render: r => <span style={{ color: tokens.color.text3, fontSize: 12, fontFamily: 'monospace' }}>{r.code}</span>,
    },
    {
      key: 'name', header: 'Account Name', width: '2fr',
      render: r => (
        <div>
          <span style={{ color: tokens.color.text1, fontSize: 13 }}>{r.name}</span>
          <span className="ml-2 text-xs capitalize" style={{ color: tokens.color.text3 }}>{r.type}</span>
        </div>
      ),
    },
    {
      key: 'debit', header: 'Debit (₹)', align: 'right', width: '160px',
      render: r => r.debit > 0
        ? <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.debit)}</span>
        : <span style={{ color: tokens.color.text3 }}>—</span>,
    },
    {
      key: 'credit', header: 'Credit (₹)', align: 'right', width: '160px',
      render: r => r.credit > 0
        ? <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.credit)}</span>
        : <span style={{ color: tokens.color.text3 }}>—</span>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="Trial Balance"
        subtitle="All account balances — debits must equal credits"
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
        {/* Balance check banner */}
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-4"
          style={{
            background: isBalanced ? tokens.surface.successTint : tokens.surface.dangerTint,
            border: `1px solid ${isBalanced ? tokens.surface.successTintBorder : tokens.surface.dangerTintBorder}`,
          }}
        >
          {isBalanced
            ? <CheckCircle size={16} style={{ color: tokens.color.success, flexShrink: 0 }} />
            : <AlertTriangle size={16} style={{ color: tokens.color.danger, flexShrink: 0 }} />
          }
          <p className="text-sm font-medium" style={{ color: isBalanced ? tokens.color.success : tokens.color.danger }}>
            {isBalanced
              ? 'Trial balance is balanced. Total debits = Total credits.'
              : `Out of balance by ${formatCurrency(diff)}. Review journal entries.`
            }
          </p>
        </div>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <GlassTable
              columns={columns}
              data={rows as unknown as Record<string, unknown>[]}
              rowKey="id"
            />

            {/* Totals row */}
            <div
              className="mt-3 pt-3 border-t flex gap-4 justify-end"
              style={{ borderColor: tokens.glass.border }}
            >
              <div className="text-right">
                <p className="text-xs" style={{ color: tokens.color.text3 }}>Total Debit</p>
                <p className="text-base font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalDebit)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: tokens.color.text3 }}>Total Credit</p>
                <p
                  className="text-base font-bold"
                  style={{ color: isBalanced ? tokens.color.text1 : tokens.color.danger }}
                >
                  {formatCurrency(totalCredit)}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </PageLayout>
    </>
  )
}

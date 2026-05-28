import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCard } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_JOURNAL_ENTRIES, MOCK_ACCOUNTS } from '@/lib/mockData'
import type { JournalEntry, JELine, Account } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO, formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

function genId() { return Math.random().toString(36).slice(2, 10) }

function nextNumber(items: JournalEntry[]): string {
  const nums = items.map(j => parseInt(j.number.split('-')[1] ?? '0')).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `JE-${String(next).padStart(4, '0')}`
}

export default function JournalEntryForm() {
  const navigate = useNavigate()
  const { items: entries, create } = useLocalStore<JournalEntry>('journal-entries', MOCK_JOURNAL_ENTRIES)
  const { items: accounts } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)

  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<JELine[]>([
    { id: genId(), account_id: '', account_name: '', debit: 0, credit: 0 },
    { id: genId(), account_id: '', account_name: '', debit: 0, credit: 0 },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'New Journal Entry | ERP' }, [])

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const addLine = () => setLines(ls => [...ls, { id: genId(), account_id: '', account_name: '', debit: 0, credit: 0 }])
  const removeLine = (id: string) => { if (lines.length > 2) setLines(ls => ls.filter(l => l.id !== id)) }

  const updateLine = (id: string, key: keyof JELine, val: string | number) => {
    setLines(ls => ls.map(l => {
      if (l.id !== id) return l
      if (key === 'account_id') {
        const acc = accounts.find(a => a.id === val)
        return { ...l, account_id: String(val), account_name: acc?.name ?? '' }
      }
      return { ...l, [key]: val }
    }))
  }

  const handleSave = async () => {
    setError('')
    if (!description) { setError('Description is required.'); return }
    if (!isBalanced) { setError('Debits must equal credits.'); return }
    if (lines.some(l => !l.account_id)) { setError('All lines must have an account.'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    create({
      number: nextNumber(entries),
      date, description,
      reference: reference || undefined,
      status: 'posted',
      lines,
      created_at: new Date().toISOString(),
    } as Omit<JournalEntry, 'id'>)

    navigate('/accounting/journal-entries')
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    background: tokens.glass.inputBg,
    border: `1px solid ${tokens.glass.inputBorder}`,
    borderRadius: tokens.radius.sm,
    color: tokens.color.text1,
    outline: 'none',
    fontSize: 13,
    padding: '6px 10px',
    width: '100%',
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title="New Journal Entry"
        backHref="/accounting/journal-entries"
        onSave={handleSave}
        onCancel={() => navigate('/accounting/journal-entries')}
        saving={saving}
        saveLabel="Post Entry"
      >
        <FormSection title="Entry Details" columns={3}>
          <GlassInput label="Date" type="date" value={date} onChange={setDate} required />
          <GlassInput label="Description" value={description} onChange={setDescription} required />
          <GlassInput label="Reference" value={reference} onChange={setReference} placeholder="Optional" />
        </FormSection>

        {error && <p className="text-sm font-medium" style={{ color: tokens.color.danger }}>{error}</p>}

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>Lines</h3>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${isBalanced ? '' : ''}`}
                style={{ background: isBalanced ? tokens.surface.successTint : tokens.surface.dangerTint, color: isBalanced ? tokens.color.success : tokens.color.danger, border: `1px solid ${isBalanced ? tokens.surface.successTintBorder : tokens.surface.dangerTintBorder}` }}
              >
                {isBalanced ? '✓ Balanced' : `Difference: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
              </div>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_36px] gap-3 px-3 pb-2">
              {['Account', 'Debit', 'Credit', ''].map(h => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.color.text3 }}>{h}</span>
              ))}
            </div>

            {lines.map(line => (
              <div key={line.id} className="grid grid-cols-[2fr_1fr_1fr_36px] gap-3 mb-2 items-center">
                <GlassSelect
                  value={line.account_id}
                  onChange={v => updateLine(line.id, 'account_id', v)}
                  options={accounts.filter(a => a.is_active).map(a => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
                  placeholder="Select account…"
                />
                <input type="number" min={0} step={0.01} value={line.debit || ''} onChange={e => { updateLine(line.id, 'debit', parseFloat(e.target.value) || 0); if (e.target.value) updateLine(line.id, 'credit', 0) }} placeholder="0.00" style={inputStyle} />
                <input type="number" min={0} step={0.01} value={line.credit || ''} onChange={e => { updateLine(line.id, 'credit', parseFloat(e.target.value) || 0); if (e.target.value) updateLine(line.id, 'debit', 0) }} placeholder="0.00" style={inputStyle} />
                <button type="button" onClick={() => removeLine(line.id)} className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors" style={{ color: tokens.color.text3 }}
                  onMouseEnter={e => { e.currentTarget.style.color = tokens.color.danger }}
                  onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
                ><Trash2 size={14} /></button>
              </div>
            ))}

            {/* Totals row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_36px] gap-3 mt-3 px-1 pt-3 border-t" style={{ borderColor: tokens.glass.border }}>
              <span className="text-xs font-semibold" style={{ color: tokens.color.text3 }}>TOTAL</span>
              <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalDebit)}</span>
              <span className="text-sm font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalCredit)}</span>
              <span />
            </div>

            <button type="button" onClick={addLine} className="flex items-center gap-2 mt-3 px-4 py-2 rounded-sm text-sm font-medium transition-all"
              style={{ border: `1px dashed ${tokens.glass.border}`, color: tokens.color.text2, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tokens.color.sunsetOrange; e.currentTarget.style.color = tokens.color.sunsetOrange }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.glass.border; e.currentTarget.style.color = tokens.color.text2 }}
            ><Plus size={15} /> Add Line</button>
          </div>
        </GlassCard>
      </FormPage>
    </>
  )
}

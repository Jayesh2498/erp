import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Play } from 'lucide-react'
import {
  ListPage, GlassButton, GlassBadge, GlassSelect, GlassModal, GlassCard,
} from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_FIXED_ASSETS } from '@/lib/mockData'
import type { FixedAsset } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'
import { useToast } from '@/components/ui-kit'

const STATUS_VARIANTS: Record<string, 'paid' | 'draft' | 'cancelled'> = {
  active: 'paid',
  fully_depreciated: 'draft',
  disposed: 'cancelled',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  fully_depreciated: 'Fully Depreciated',
  disposed: 'Disposed',
}

export default function FixedAssetsList() {
  const navigate = useNavigate()
  const toast = useToast()
  const { items: assets, update } = useLocalStore<FixedAsset>('fixed_assets', MOCK_FIXED_ASSETS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDepModal, setShowDepModal] = useState(false)
  const [depMonth, setDepMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [depRunning, setDepRunning] = useState(false)

  useEffect(() => { document.title = 'Fixed Assets | ERP' }, [])

  const categories = [...new Set(assets.map(a => a.category))].sort()

  const filtered = assets.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    const matchCat = !categoryFilter || a.category === categoryFilter
    const matchStatus = !statusFilter || a.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  const totalCost = assets.reduce((s, a) => s + a.purchase_cost, 0)
  const totalAccumDep = assets.reduce((s, a) => s + a.accumulated_depreciation, 0)
  const totalNBV = assets.reduce((s, a) => s + a.net_book_value, 0)

  const handleRunDepreciation = async () => {
    setDepRunning(true)
    await new Promise(r => setTimeout(r, 800))

    let ran = 0
    assets.forEach(asset => {
      if (asset.status !== 'active') return
      if (asset.net_book_value <= asset.salvage_value) return

      let monthlyDep = 0
      if (asset.depreciation_method === 'slm') {
        monthlyDep = (asset.purchase_cost - asset.salvage_value) / (asset.useful_life_years * 12)
      } else {
        const annualRate = 1 - Math.pow(asset.salvage_value / asset.purchase_cost, 1 / asset.useful_life_years)
        monthlyDep = (asset.net_book_value * annualRate) / 12
      }

      monthlyDep = Math.min(monthlyDep, asset.net_book_value - asset.salvage_value)
      const newAccum = asset.accumulated_depreciation + monthlyDep
      const newNBV = asset.purchase_cost - newAccum
      const newStatus: FixedAsset['status'] = newNBV <= asset.salvage_value ? 'fully_depreciated' : 'active'

      update(asset.id, {
        accumulated_depreciation: Math.round(newAccum),
        net_book_value: Math.round(newNBV),
        status: newStatus,
      })
      ran++
    })

    setDepRunning(false)
    setShowDepModal(false)
    toast.success(`Depreciation calculated for ${ran} asset(s) for ${depMonth}.`)
  }

  const columns: TableColumn<FixedAsset>[] = [
    {
      key: 'name', header: 'Asset', width: '2fr',
      render: row => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{row.name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>{row.category} · {row.depreciation_method.toUpperCase()}</p>
        </div>
      ),
    },
    {
      key: 'purchase_date', header: 'Purchase Date', width: '130px',
      render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(row.purchase_date)}</span>,
    },
    {
      key: 'purchase_cost', header: 'Cost', width: '140px', align: 'right',
      render: row => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(row.purchase_cost)}</span>,
    },
    {
      key: 'accumulated_depreciation', header: 'Accum. Dep.', width: '140px', align: 'right',
      render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatCurrency(row.accumulated_depreciation)}</span>,
    },
    {
      key: 'net_book_value', header: 'Net Book Value', width: '150px', align: 'right',
      render: row => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(row.net_book_value)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '140px',
      render: row => (
        <GlassBadge variant={STATUS_VARIANTS[row.status] ?? 'neutral'}>
          {STATUS_LABELS[row.status] ?? row.status}
        </GlassBadge>
      ),
    },
  ]

  return (
    <>
      <DemoBanner />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total Cost', value: formatCurrency(totalCost) },
          { label: 'Accumulated Depreciation', value: formatCurrency(totalAccumDep) },
          { label: 'Net Book Value', value: formatCurrency(totalNBV) },
        ].map(({ label, value }) => (
          <GlassCard key={label} hover={false} className="p-4">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: tokens.color.text1 }}>{value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <ListPage
        title="Fixed Assets"
        subtitle={`${filtered.length} assets`}
        actions={
          <div className="flex gap-2">
            <GlassButton variant="secondary" icon={Play} onClick={() => setShowDepModal(true)}>
              Run Depreciation
            </GlassButton>
            <GlassButton variant="primary" icon={Plus} onClick={() => navigate('/accounting/fixed-assets/new')}>
              Add Asset
            </GlassButton>
          </div>
        }
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/accounting/fixed-assets/${(row as unknown as FixedAsset).id}`)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets…"
        filters={
          <>
            <GlassSelect
              placeholder="All Categories"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))]}
            />
            <GlassSelect
              placeholder="All Statuses"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'fully_depreciated', label: 'Fully Depreciated' },
                { value: 'disposed', label: 'Disposed' },
              ]}
            />
          </>
        }
        emptyText="No fixed assets found"
        emptySubtext="Add your first fixed asset to track depreciation."
      />

      {/* Run Depreciation Modal */}
      <GlassModal
        open={showDepModal}
        onClose={() => setShowDepModal(false)}
        title="Run Depreciation"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setShowDepModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" loading={depRunning} onClick={handleRunDepreciation}>
              Run Depreciation
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: tokens.color.text2 }}>
              Month / Year
            </label>
            <input
              type="month"
              value={depMonth}
              onChange={e => setDepMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                background: tokens.glass.inputBg,
                border: `1px solid ${tokens.glass.inputBorder}`,
                color: tokens.color.text1,
                outline: 'none',
              }}
            />
          </div>

          <GlassCard hover={false} className="p-4">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p className="text-xs font-semibold mb-3" style={{ color: tokens.color.text3 }}>Preview</p>
              <div className="space-y-2">
                {assets.filter(a => a.status === 'active' && a.net_book_value > a.salvage_value).map(asset => {
                  let monthlyDep = 0
                  if (asset.depreciation_method === 'slm') {
                    monthlyDep = (asset.purchase_cost - asset.salvage_value) / (asset.useful_life_years * 12)
                  } else {
                    const annualRate = 1 - Math.pow(asset.salvage_value / asset.purchase_cost, 1 / asset.useful_life_years)
                    monthlyDep = (asset.net_book_value * annualRate) / 12
                  }
                  monthlyDep = Math.min(monthlyDep, asset.net_book_value - asset.salvage_value)
                  return (
                    <div key={asset.id} className="flex justify-between items-center text-sm">
                      <span style={{ color: tokens.color.text2 }}>{asset.name}</span>
                      <span style={{ color: tokens.color.text1, fontWeight: 600 }}>
                        −{formatCurrency(Math.round(monthlyDep))}
                      </span>
                    </div>
                  )
                })}
                {assets.filter(a => a.status === 'active' && a.net_book_value > a.salvage_value).length === 0 && (
                  <p className="text-sm" style={{ color: tokens.color.text3 }}>No active assets to depreciate.</p>
                )}
              </div>
            </div>
          </GlassCard>

          <p className="text-xs" style={{ color: tokens.color.text3 }}>
            This will create journal entries for each active asset: Debit Depreciation Expense, Credit Accumulated Depreciation.
          </p>
        </div>
      </GlassModal>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import {
  DetailPage, GlassCard, GlassButton, GlassBadge, GlassModal, GlassInput, GlassTable, ConfirmModal,
} from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_FIXED_ASSETS } from '@/lib/mockData'
import type { FixedAsset } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate, todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'
import { useToast } from '@/components/ui-kit'

const STATUS_VARIANTS: Record<string, 'paid' | 'draft' | 'cancelled'> = {
  active: 'paid', fully_depreciated: 'draft', disposed: 'cancelled',
}

interface DepScheduleRow {
  id: string
  period: string
  opening_nbv: number
  depreciation: number
  closing_nbv: number
}

export default function FixedAssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { items: assets, update, remove } = useLocalStore<FixedAsset>('fixed_assets', MOCK_FIXED_ASSETS)
  const asset = assets.find(a => a.id === id)

  const [showDisposeModal, setShowDisposeModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [disposeForm, setDisposeForm] = useState({ date: todayISO(), proceeds: '' })
  const [disposing, setDisposing] = useState(false)

  useEffect(() => {
    document.title = asset ? `${asset.name} | ERP` : 'Fixed Asset | ERP'
  }, [asset])

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p style={{ color: tokens.color.text3 }}>Asset not found.</p>
      </div>
    )
  }

  // Build depreciation schedule
  const buildSchedule = (): DepScheduleRow[] => {
    const rows: DepScheduleRow[] = []
    const totalMonths = asset.useful_life_years * 12
    let currentNBV = asset.purchase_cost
    const cost = asset.purchase_cost
    const salvage = asset.salvage_value

    for (let i = 0; i < Math.min(totalMonths, 60); i++) {
      let dep = 0
      if (asset.depreciation_method === 'slm') {
        dep = (cost - salvage) / totalMonths
      } else {
        const annualRate = 1 - Math.pow(salvage / cost, 1 / asset.useful_life_years)
        dep = (currentNBV * annualRate) / 12
      }
      dep = Math.min(dep, currentNBV - salvage)
      if (dep <= 0) break

      const closing = currentNBV - dep
      const startDate = new Date(asset.purchase_date)
      startDate.setMonth(startDate.getMonth() + i)
      const label = startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

      rows.push({
        id: String(i),
        period: label,
        opening_nbv: Math.round(currentNBV),
        depreciation: Math.round(dep),
        closing_nbv: Math.round(closing),
      })
      currentNBV = closing
    }
    return rows
  }

  const schedule = buildSchedule()

  const scheduleColumns: TableColumn<DepScheduleRow>[] = [
    { key: 'period', header: 'Month', width: '120px' },
    {
      key: 'opening_nbv', header: 'Opening NBV', align: 'right', width: '160px',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatCurrency(r.opening_nbv)}</span>,
    },
    {
      key: 'depreciation', header: 'Depreciation', align: 'right', width: '150px',
      render: r => <span style={{ color: tokens.color.danger, fontSize: 13 }}>−{formatCurrency(r.depreciation)}</span>,
    },
    {
      key: 'closing_nbv', header: 'Closing NBV', align: 'right', width: '160px',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.closing_nbv)}</span>,
    },
  ]

  const handleDispose = async () => {
    const proceeds = parseFloat(disposeForm.proceeds) || 0
    setDisposing(true)
    await new Promise(r => setTimeout(r, 500))

    const profitLoss = proceeds - asset.net_book_value
    update(asset.id, {
      status: 'disposed',
      accumulated_depreciation: asset.purchase_cost - asset.salvage_value,
      net_book_value: 0,
    })

    setDisposing(false)
    setShowDisposeModal(false)
    toast.success(`${asset.name} disposed. ${profitLoss >= 0 ? 'Profit' : 'Loss'} on disposal: ${formatCurrency(Math.abs(profitLoss))}.`)
  }

  const depPct = asset.purchase_cost > 0
    ? ((asset.accumulated_depreciation / asset.purchase_cost) * 100).toFixed(1)
    : '0'

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={asset.name}
        subtitle={`${asset.category} · Added ${formatDate(asset.created_at)}`}
        backHref="/accounting/fixed-assets"
        badge={<GlassBadge variant={STATUS_VARIANTS[asset.status] ?? 'neutral'}>{asset.status.replace('_', ' ')}</GlassBadge>}
        actions={
          <>
            {asset.status === 'active' && (
              <>
                <GlassButton variant="secondary" icon={Edit} onClick={() => navigate(`/accounting/fixed-assets/${id}/edit`)}>
                  Edit
                </GlassButton>
                <GlassButton variant="danger" onClick={() => setShowDisposeModal(true)}>
                  Dispose Asset
                </GlassButton>
              </>
            )}
            {asset.status === 'disposed' && (
              <GlassButton variant="danger" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </GlassButton>
            )}
          </>
        }
      >
        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Purchase Cost', value: formatCurrency(asset.purchase_cost) },
            { label: 'Accumulated Depreciation', value: formatCurrency(asset.accumulated_depreciation) },
            { label: 'Net Book Value', value: formatCurrency(asset.net_book_value) },
          ].map(({ label, value }) => (
            <GlassCard key={label} hover={false} className="p-4">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: tokens.color.text1 }}>{value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Details */}
        <GlassCard hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Asset Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Category', value: asset.category },
                { label: 'Vendor', value: asset.vendor_name ?? '—' },
                { label: 'Purchase Date', value: formatDate(asset.purchase_date) },
                { label: 'Depreciation Method', value: asset.depreciation_method === 'slm' ? 'Straight Line (SLM)' : 'Written Down Value (WDV)' },
                { label: 'Useful Life', value: `${asset.useful_life_years} years` },
                { label: 'Salvage Value', value: formatCurrency(asset.salvage_value) },
                { label: 'GL Account', value: asset.gl_account ?? '—' },
                { label: 'Depreciation %', value: `${depPct}%` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ color: tokens.color.text3, fontSize: 12 }}>{label}</p>
                  <p style={{ color: tokens.color.text1, fontWeight: 500 }} className="mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1" style={{ color: tokens.color.text3 }}>
                <span>Depreciated</span><span>{depPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: tokens.glass.border }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${depPct}%`, background: tokens.gradient.sunset }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Depreciation Schedule */}
        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>
              Depreciation Schedule {schedule.length === 60 ? '(first 60 months)' : ''}
            </h3>
            <GlassTable
              columns={scheduleColumns}
              data={schedule as unknown as Record<string, unknown>[]}
              rowKey="id"
            />
          </div>
        </GlassCard>
      </DetailPage>

      {/* Dispose Modal */}
      <GlassModal
        open={showDisposeModal}
        onClose={() => setShowDisposeModal(false)}
        title="Dispose Asset"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setShowDisposeModal(false)}>Cancel</GlassButton>
            <GlassButton variant="danger" loading={disposing} onClick={handleDispose}>Confirm Disposal</GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: tokens.color.text2 }}>
            Disposing <strong>{asset.name}</strong>. This will zero out the asset accounts.
            Current Net Book Value: <strong>{formatCurrency(asset.net_book_value)}</strong>
          </p>
          <GlassInput
            label="Disposal Date"
            type="date"
            value={disposeForm.date}
            onChange={e => setDisposeForm(f => ({ ...f, date: e.target.value }))}
            required
          />
          <GlassInput
            label="Sale Proceeds (₹)"
            type="number"
            placeholder="0"
            value={disposeForm.proceeds}
            onChange={e => setDisposeForm(f => ({ ...f, proceeds: e.target.value }))}
          />
          {disposeForm.proceeds && (
            <div className="text-sm p-3 rounded-md" style={{ background: tokens.glass.bg, border: `1px solid ${tokens.glass.border}` }}>
              {parseFloat(disposeForm.proceeds) >= asset.net_book_value
                ? <span style={{ color: tokens.color.success }}>Profit on disposal: {formatCurrency(parseFloat(disposeForm.proceeds) - asset.net_book_value)}</span>
                : <span style={{ color: tokens.color.danger }}>Loss on disposal: {formatCurrency(asset.net_book_value - parseFloat(disposeForm.proceeds))}</span>
              }
            </div>
          )}
        </div>
      </GlassModal>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { remove(asset.id); navigate('/accounting/fixed-assets') }}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}

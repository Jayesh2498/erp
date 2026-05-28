import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassButton } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_FIXED_ASSETS, MOCK_CONTACTS, MOCK_ACCOUNTS } from '@/lib/mockData'
import type { FixedAsset, Contact, Account } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { useToast } from '@/components/ui-kit'
import { todayISO } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

const CATEGORIES = [
  'Machinery', 'Computers & IT', 'Furniture & Fixtures', 'Vehicles',
  'Buildings', 'Equipment', 'Other',
]

export default function FixedAssetForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = !!id

  const { items: assets, create, update } = useLocalStore<FixedAsset>('fixed_assets', MOCK_FIXED_ASSETS)
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: accounts } = useLocalStore<Account>('accounts', MOCK_ACCOUNTS)

  const existing = isEdit ? assets.find(a => a.id === id) : undefined

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? 'Machinery',
    vendor_id: existing?.vendor_id ?? '',
    purchase_date: existing?.purchase_date ?? todayISO(),
    purchase_cost: String(existing?.purchase_cost ?? ''),
    depreciation_method: existing?.depreciation_method ?? 'slm' as 'slm' | 'wdv',
    useful_life_years: String(existing?.useful_life_years ?? '5'),
    salvage_value: String(existing?.salvage_value ?? '0'),
    gl_account: existing?.gl_account ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'Add'} Fixed Asset | ERP`
  }, [isEdit])

  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both')
  const assetAccounts = accounts.filter(a => a.type === 'asset')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.purchase_date) e.purchase_date = 'Purchase date is required'
    const cost = parseFloat(form.purchase_cost)
    if (isNaN(cost) || cost <= 0) e.purchase_cost = 'Enter a valid cost'
    const life = parseInt(form.useful_life_years)
    if (isNaN(life) || life <= 0) e.useful_life_years = 'Enter valid useful life'
    const salvage = parseFloat(form.salvage_value)
    if (isNaN(salvage) || salvage < 0) e.salvage_value = 'Enter valid salvage value'
    if (!isNaN(salvage) && !isNaN(cost) && salvage >= cost) e.salvage_value = 'Salvage value must be less than cost'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const cost = parseFloat(form.purchase_cost)
    const salvage = parseFloat(form.salvage_value)
    const vendor = contacts.find(c => c.id === form.vendor_id)

    const payload: Omit<FixedAsset, 'id'> = {
      name: form.name.trim(),
      category: form.category,
      vendor_id: form.vendor_id || undefined,
      vendor_name: vendor?.name,
      purchase_date: form.purchase_date,
      purchase_cost: cost,
      depreciation_method: form.depreciation_method,
      useful_life_years: parseInt(form.useful_life_years),
      salvage_value: salvage,
      accumulated_depreciation: existing?.accumulated_depreciation ?? 0,
      net_book_value: existing?.net_book_value ?? cost,
      gl_account: form.gl_account || undefined,
      status: existing?.status ?? 'active',
      created_at: existing?.created_at ?? new Date().toISOString(),
    }

    if (isEdit && id) {
      update(id, payload)
      toast.success(`${form.name} has been updated.`)
    } else {
      create(payload)
      toast.success(`${form.name} has been added.`)
    }

    navigate('/accounting/fixed-assets')
  }

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const next = { ...e }; delete next[field]; return next })
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Fixed Asset' : 'Add Fixed Asset'}
        subtitle={isEdit ? existing?.name : 'Track a new asset for depreciation'}
        backHref="/accounting/fixed-assets"
        onCancel={() => navigate('/accounting/fixed-assets')}
        onSave={handleSave}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Add Asset'}
      >
        <FormSection title="Asset Details">
          <GlassInput
            label="Asset Name"
            placeholder="e.g. Dell PowerEdge Server"
            value={form.name}
            onChange={v => set('name', v)}
            error={errors.name}
            required
          />
          <GlassSelect
            label="Category"
            value={form.category}
            onChange={v => set('category', v)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
            required
          />
          <GlassSelect
            label="Vendor (optional)"
            placeholder="Select vendor…"
            value={form.vendor_id}
            onChange={v => set('vendor_id', v)}
            options={[{ value: '', label: 'None' }, ...vendors.map(v => ({ value: v.id, label: v.name }))]}
          />
        </FormSection>

        <FormSection title="Purchase & Cost">
          <GlassInput
            label="Purchase Date"
            type="date"
            value={form.purchase_date}
            onChange={v => set('purchase_date', v)}
            error={errors.purchase_date}
            required
          />
          <GlassInput
            label="Purchase Cost (₹)"
            type="number"
            placeholder="e.g. 480000"
            value={form.purchase_cost}
            onChange={v => set('purchase_cost', v)}
            error={errors.purchase_cost}
            required
          />
          <GlassSelect
            label="GL Asset Account"
            placeholder="Select account…"
            value={form.gl_account}
            onChange={v => set('gl_account', v)}
            options={[
              { value: '', label: 'None' },
              ...assetAccounts.map(a => ({ value: a.code, label: `${a.code} — ${a.name}` })),
            ]}
          />
        </FormSection>

        <FormSection title="Depreciation">
          <GlassSelect
            label="Depreciation Method"
            value={form.depreciation_method}
            onChange={v => set('depreciation_method', v)}
            options={[
              { value: 'slm', label: 'SLM — Straight Line Method (constant)' },
              { value: 'wdv', label: 'WDV — Written Down Value (declining)' },
            ]}
            required
          />
          <GlassInput
            label="Useful Life (Years)"
            type="number"
            placeholder="e.g. 5"
            value={form.useful_life_years}
            onChange={v => set('useful_life_years', v)}
            error={errors.useful_life_years}
            required
          />
          <GlassInput
            label="Salvage Value (₹)"
            type="number"
            placeholder="e.g. 48000"
            value={form.salvage_value}
            onChange={v => set('salvage_value', v)}
            error={errors.salvage_value}
            required
          />

          {/* Preview */}
          {!errors.purchase_cost && !errors.useful_life_years && !errors.salvage_value &&
            form.purchase_cost && form.useful_life_years && (
            <div className="col-span-full rounded-md p-4 text-sm space-y-1"
              style={{ background: tokens.glass.bg, border: `1px solid ${tokens.glass.border}` }}>
              <p className="font-semibold" style={{ color: tokens.color.text1 }}>Monthly Depreciation Preview</p>
              {(() => {
                const cost = parseFloat(form.purchase_cost) || 0
                const salvage = parseFloat(form.salvage_value) || 0
                const life = parseInt(form.useful_life_years) || 1
                let monthly = 0
                if (form.depreciation_method === 'slm') {
                  monthly = (cost - salvage) / (life * 12)
                } else {
                  const annualRate = 1 - Math.pow(salvage / cost, 1 / life)
                  monthly = (cost * annualRate) / 12
                }
                return (
                  <p style={{ color: tokens.color.text2 }}>
                    ≈ ₹{Math.round(monthly).toLocaleString('en-IN')} / month
                    {form.depreciation_method === 'wdv' ? ' (year 1; declines over time)' : ' (constant)'}
                  </p>
                )
              })()}
            </div>
          )}
        </FormSection>
      </FormPage>
    </>
  )
}

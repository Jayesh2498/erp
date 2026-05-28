import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCheckbox } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import type { Product } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'

const CATEGORIES = [
  'Power Systems', 'Exosuits', 'Weapons', 'AI Systems', 'Materials',
  'Display Systems', 'Bundles', 'Maintenance Services', 'Professional Services', 'Other',
]

function generateSKU(name: string): string {
  const base = name.split(' ').map(w => w.charAt(0).toUpperCase()).join('').slice(0, 4)
  return `${base}-${Math.floor(Math.random() * 900 + 100)}`
}

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { items: products, create, update } = useLocalStore<Product>('products', MOCK_PRODUCTS)

  const existing = isEdit ? products.find(p => p.id === id) : undefined

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    type: existing?.type ?? 'product' as Product['type'],
    sku: existing?.sku ?? '',
    hsn_sac_code: existing?.hsn_sac_code ?? '',
    category: existing?.category ?? '',
    description: existing?.description ?? '',
    selling_price: String(existing?.selling_price ?? ''),
    cost_price: String(existing?.cost_price ?? ''),
    tax_rate: String(existing?.tax_rate ?? '18'),
    track_inventory: existing?.track_inventory ?? true,
    reorder_point: String(existing?.reorder_point ?? ''),
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Product | ERP`
  }, [isEdit])

  const set = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.selling_price) errs.selling_price = 'Selling price is required'
    if (!form.cost_price) errs.cost_price = 'Cost price is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const sku = form.sku.trim() || generateSKU(form.name)
    const payload: Omit<Product, 'id'> = {
      workspace_id: 'ws-demo',
      name: form.name.trim(),
      type: form.type,
      sku,
      hsn_sac_code: form.hsn_sac_code || undefined,
      category: form.category || undefined,
      description: form.description || undefined,
      selling_price: parseFloat(form.selling_price) || 0,
      cost_price: parseFloat(form.cost_price) || 0,
      tax_rate: parseFloat(form.tax_rate) || 18,
      track_inventory: form.type === 'service' ? false : form.track_inventory,
      reorder_point: form.reorder_point ? parseInt(form.reorder_point) : undefined,
      is_active: true,
      created_at: existing?.created_at ?? todayISO(),
    }

    if (isEdit && id) {
      update(id, payload)
      navigate(`/products/${id}`)
    } else {
      const created = create(payload)
      navigate(`/products/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? 'Edit Product' : 'New Product'}
        subtitle={isEdit ? existing?.name : 'Add a product or service'}
        backHref={isEdit ? `/products/${id}` : '/products'}
        onSave={handleSave}
        onCancel={() => navigate(isEdit ? `/products/${id}` : '/products')}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Create Product'}
      >
        <FormSection title="Basic Information" columns={2}>
          <GlassInput label="Name" value={form.name} onChange={v => set('name', v)} required error={errors.name} />
          <GlassSelect
            label="Type"
            value={form.type}
            onChange={v => set('type', v)}
            options={[{ value: 'product', label: 'Product' }, { value: 'service', label: 'Service' }]}
            required
          />
          <GlassInput
            label="SKU"
            value={form.sku}
            onChange={v => set('sku', v)}
            placeholder="Auto-generated if blank"
          />
          <GlassInput label="HSN / SAC Code" value={form.hsn_sac_code} onChange={v => set('hsn_sac_code', v)} placeholder="e.g. 85414000" />
          <GlassSelect
            label="Category"
            value={form.category}
            onChange={v => set('category', v)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
            placeholder="Select category…"
          />
          <GlassInput label="Description" as="textarea" rows={2} value={form.description} onChange={v => set('description', v)} />
        </FormSection>

        <FormSection title="Pricing & Tax" columns={3}>
          <GlassInput label="Selling Price" type="number" prefix="₹" value={form.selling_price} onChange={v => set('selling_price', v)} required error={errors.selling_price} />
          <GlassInput label="Cost Price" type="number" prefix="₹" value={form.cost_price} onChange={v => set('cost_price', v)} required error={errors.cost_price} />
          <GlassSelect
            label="GST Rate"
            value={form.tax_rate}
            onChange={v => set('tax_rate', v)}
            options={[
              { value: '0', label: '0%' },
              { value: '5', label: '5%' },
              { value: '12', label: '12%' },
              { value: '18', label: '18%' },
              { value: '28', label: '28%' },
            ]}
          />
        </FormSection>

        {form.type === 'product' && (
          <FormSection title="Inventory" columns={2}>
            <div>
              <GlassCheckbox
                checked={form.track_inventory}
                onChange={v => set('track_inventory', v)}
                label="Track inventory for this product"
              />
            </div>
            {form.track_inventory && (
              <GlassInput label="Reorder Point" type="number" value={form.reorder_point} onChange={v => set('reorder_point', v)} hint="Alert when stock falls below this quantity" />
            )}
          </FormSection>
        )}
      </FormPage>
    </>
  )
}

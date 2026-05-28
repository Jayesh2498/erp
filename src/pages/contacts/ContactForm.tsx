import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormPage, FormSection, GlassInput, GlassSelect, GlassCheckbox } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CONTACTS } from '@/lib/mockData'
import type { Contact, Address } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { todayISO } from '@/lib/format'

const INDIAN_STATES = [
  { value: '01', label: 'Jammu & Kashmir' }, { value: '02', label: 'Himachal Pradesh' },
  { value: '03', label: 'Punjab' }, { value: '04', label: 'Chandigarh' },
  { value: '05', label: 'Uttarakhand' }, { value: '06', label: 'Haryana' },
  { value: '07', label: 'Delhi' }, { value: '08', label: 'Rajasthan' },
  { value: '09', label: 'Uttar Pradesh' }, { value: '10', label: 'Bihar' },
  { value: '11', label: 'Sikkim' }, { value: '12', label: 'Arunachal Pradesh' },
  { value: '13', label: 'Nagaland' }, { value: '14', label: 'Manipur' },
  { value: '15', label: 'Mizoram' }, { value: '16', label: 'Tripura' },
  { value: '17', label: 'Meghalaya' }, { value: '18', label: 'Assam' },
  { value: '19', label: 'West Bengal' }, { value: '20', label: 'Jharkhand' },
  { value: '21', label: 'Odisha' }, { value: '22', label: 'Chhattisgarh' },
  { value: '23', label: 'Madhya Pradesh' }, { value: '24', label: 'Gujarat' },
  { value: '26', label: 'Dadra & Nagar Haveli' }, { value: '27', label: 'Maharashtra' },
  { value: '28', label: 'Andhra Pradesh' }, { value: '29', label: 'Karnataka' },
  { value: '30', label: 'Goa' }, { value: '31', label: 'Lakshadweep' },
  { value: '32', label: 'Kerala' }, { value: '33', label: 'Tamil Nadu' },
  { value: '34', label: 'Puducherry' }, { value: '35', label: 'Andaman & Nicobar' },
  { value: '36', label: 'Telangana' }, { value: '37', label: 'Andhra Pradesh (New)' },
]

const blankAddress = (): Address => ({ line1: '', city: '', state: '', state_code: '', pincode: '' })

export default function ContactForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { items: contacts, create, update } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)

  const existing = isEdit ? contacts.find(c => c.id === id) : undefined

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    type: existing?.type ?? 'customer' as Contact['type'],
    email: existing?.email ?? '',
    phone: existing?.phone ?? '',
    website: existing?.website ?? '',
    tax_treatment: existing?.tax_treatment ?? 'registered' as Contact['tax_treatment'],
    gstin: existing?.gstin ?? '',
    pan: existing?.pan ?? '',
    credit_limit: String(existing?.credit_limit ?? ''),
    payment_terms_days: String(existing?.payment_terms_days ?? '30'),
    notes: existing?.notes ?? '',
    billing_address: existing?.billing_address ?? blankAddress(),
    shipping_address: existing?.shipping_address ?? blankAddress(),
    same_as_billing: false,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Contact | ERP`
  }, [isEdit])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))
  const setBilling = (key: keyof Address, val: string) => {
    setForm(f => {
      const billing = { ...f.billing_address, [key]: val }
      if (key === 'state_code') {
        const stateName = INDIAN_STATES.find(s => s.value === val)?.label ?? ''
        billing.state = stateName
      }
      return { ...f, billing_address: billing, shipping_address: f.same_as_billing ? billing : f.shipping_address }
    })
  }
  const setShipping = (key: keyof Address, val: string) => {
    setForm(f => {
      const shipping = { ...f.shipping_address, [key]: val }
      if (key === 'state_code') {
        shipping.state = INDIAN_STATES.find(s => s.value === val)?.label ?? ''
      }
      return { ...f, shipping_address: shipping }
    })
  }

  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const payload: Omit<Contact, 'id'> = {
      workspace_id: 'ws-demo',
      name: form.name.trim(),
      type: form.type,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      tax_treatment: form.tax_treatment,
      gstin: form.gstin || undefined,
      pan: form.pan || undefined,
      state_code: form.billing_address.state_code || undefined,
      billing_address: form.billing_address.line1 ? form.billing_address : undefined,
      shipping_address: form.same_as_billing ? form.billing_address : (form.shipping_address.line1 ? form.shipping_address : undefined),
      credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : undefined,
      payment_terms_days: form.payment_terms_days ? parseInt(form.payment_terms_days) : undefined,
      notes: form.notes || undefined,
      is_active: true,
      created_at: existing?.created_at ?? todayISO(),
    }

    if (isEdit && id) {
      update(id, payload)
      navigate(`/contacts/${id}`)
    } else {
      const created = create(payload)
      navigate(`/contacts/${created.id}`)
    }
    setSaving(false)
  }

  const autoFillGSTIN = () => {
    if (form.billing_address.state_code) {
      set('gstin', `${form.billing_address.state_code}AABCS1429B1ZB`)
    }
  }

  return (
    <>
      <DemoBanner />
      <FormPage
        title={isEdit ? `Edit Contact` : 'New Contact'}
        subtitle={isEdit ? existing?.name : 'Add a customer or vendor'}
        backHref={isEdit ? `/contacts/${id}` : '/contacts'}
        onSave={handleSave}
        onCancel={() => navigate(isEdit ? `/contacts/${id}` : '/contacts')}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Create Contact'}
      >
        <FormSection title="Basic Information" columns={2}>
          <GlassInput label="Name" value={form.name} onChange={v => set('name', v)} required error={errors.name} />
          <GlassSelect
            label="Type"
            value={form.type}
            onChange={v => set('type', v)}
            options={[
              { value: 'customer', label: 'Customer' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'both', label: 'Customer & Vendor' },
            ]}
            required
          />
          <GlassInput label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
          <GlassInput label="Phone" value={form.phone} onChange={v => set('phone', v)} />
          <GlassInput label="Website" value={form.website} onChange={v => set('website', v)} />
          <GlassSelect
            label="Tax Treatment"
            value={form.tax_treatment}
            onChange={v => set('tax_treatment', v)}
            options={[
              { value: 'registered', label: 'Registered (GST)' },
              { value: 'unregistered', label: 'Unregistered' },
              { value: 'overseas', label: 'Overseas / Export' },
            ]}
          />
        </FormSection>

        <FormSection title="Tax Information" columns={2}>
          <div>
            <GlassInput label="GSTIN" value={form.gstin} onChange={v => set('gstin', v)} placeholder="27AABCS1429B1ZB" />
            <button
              type="button"
              className="mt-1 text-xs font-medium transition-colors"
              style={{ color: 'rgb(var(--sunset-orange))', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={autoFillGSTIN}
            >
              Auto-fill GSTIN from state
            </button>
          </div>
          <GlassInput label="PAN" value={form.pan} onChange={v => set('pan', v)} placeholder="AABCS1429B" />
        </FormSection>

        <FormSection title="Billing Address" columns={2}>
          <div className="sm:col-span-2">
            <GlassInput label="Address Line 1" value={form.billing_address.line1} onChange={v => setBilling('line1', v)} />
          </div>
          <GlassInput label="City" value={form.billing_address.city} onChange={v => setBilling('city', v)} />
          <GlassSelect
            label="State"
            value={form.billing_address.state_code}
            onChange={v => setBilling('state_code', v)}
            options={INDIAN_STATES}
            placeholder="Select state…"
          />
          <GlassInput label="Pincode" value={form.billing_address.pincode} onChange={v => setBilling('pincode', v)} />
        </FormSection>

        <FormSection title="Shipping Address" columns={2}>
          <div className="sm:col-span-2">
            <GlassCheckbox
              checked={form.same_as_billing}
              onChange={v => setForm(f => ({ ...f, same_as_billing: v, shipping_address: v ? f.billing_address : blankAddress() }))}
              label="Same as billing address"
            />
          </div>
          {!form.same_as_billing && (
            <>
              <div className="sm:col-span-2">
                <GlassInput label="Address Line 1" value={form.shipping_address.line1} onChange={v => setShipping('line1', v)} />
              </div>
              <GlassInput label="City" value={form.shipping_address.city} onChange={v => setShipping('city', v)} />
              <GlassSelect
                label="State"
                value={form.shipping_address.state_code}
                onChange={v => setShipping('state_code', v)}
                options={INDIAN_STATES}
                placeholder="Select state…"
              />
              <GlassInput label="Pincode" value={form.shipping_address.pincode} onChange={v => setShipping('pincode', v)} />
            </>
          )}
        </FormSection>

        <FormSection title="Credit & Payment Terms" columns={2}>
          <GlassInput label="Credit Limit" type="number" prefix="₹" value={form.credit_limit} onChange={v => set('credit_limit', v)} />
          <GlassSelect
            label="Payment Terms"
            value={form.payment_terms_days}
            onChange={v => set('payment_terms_days', v)}
            options={[
              { value: '0', label: 'Immediate' },
              { value: '15', label: 'Net 15' },
              { value: '30', label: 'Net 30' },
              { value: '45', label: 'Net 45' },
              { value: '60', label: 'Net 60' },
              { value: '90', label: 'Net 90' },
            ]}
          />
        </FormSection>

        <FormSection title="Notes" columns={1}>
          <GlassInput label="Internal Notes" as="textarea" rows={3} value={form.notes} onChange={v => set('notes', v)} />
        </FormSection>
      </FormPage>
    </>
  )
}

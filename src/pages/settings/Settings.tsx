import React, { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  Building2, Users, Shield, Bell, ChevronRight,
} from 'lucide-react'
import {
  GlassCard, GlassButton, GlassInput, GlassSelect, GlassTable,
  GlassModal, GlassBadge,
} from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_WORKSPACE_SETTINGS } from '@/lib/mockData'
import type { WorkspaceSettings } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { useToast } from '@/components/ui-kit'
import { tokens } from '@/components/ui-kit/tokens'
import { useAuth } from '@/providers/AuthProvider'
import { GlassCheckbox } from '@/components/ui-kit/atoms'

/* ── TDS Rates config ─────────────────────────────────────── */
interface TDSRate {
  id: string
  section: string
  description: string
  rate: number
  threshold: number
}

const DEFAULT_TDS_RATES: TDSRate[] = [
  { id: 'tds-1', section: '194C', description: 'Contractors / Sub-contractors', rate: 1, threshold: 100000 },
  { id: 'tds-2', section: '194J', description: 'Professional / Technical Services', rate: 10, threshold: 30000 },
  { id: 'tds-3', section: '194I', description: 'Rent', rate: 10, threshold: 240000 },
  { id: 'tds-4', section: '194H', description: 'Commission / Brokerage', rate: 5, threshold: 15000 },
  { id: 'tds-5', section: '194A', description: 'Interest (other than securities)', rate: 10, threshold: 40000 },
  { id: 'tds-6', section: 'Other', description: 'Other Payments', rate: 2, threshold: 0 },
]

/* ── User type ───────────────────────────────────────────── */
interface EmpUser {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
}

const DEFAULT_USERS: EmpUser[] = [
  { id: 'u-1', name: 'Tony Stark', email: 'admin@demo.com', role: 'admin', is_active: true },
  { id: 'u-2', name: 'Pepper Potts', email: 'manager@demo.com', role: 'manager', is_active: true },
  { id: 'u-3', name: 'Happy Hogan', email: 'staff@demo.com', role: 'staff', is_active: true },
]

/* ── Sidebar nav item ────────────────────────────────────── */
function SettingsNavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${isActive ? 'text-white' : ''}`
      }
      style={({ isActive }) => isActive
        ? { background: tokens.gradient.sunset, boxShadow: tokens.shadow.sunset }
        : { color: tokens.color.text2 }
      }
    >
      <Icon size={15} />
      <span className="flex-1">{label}</span>
      <ChevronRight size={12} style={{ color: 'inherit', opacity: 0.5 }} />
    </NavLink>
  )
}

/* ── Company Profile ─────────────────────────────────────── */
function CompanySettings() {
  const toast = useToast()
  const [settings, setSettings] = useState<WorkspaceSettings>(MOCK_WORKSPACE_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'Company Settings | ERP' }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    toast.success('Company profile has been updated.')
  }

  const STATES = [
    { value: '01', label: '01 — Jammu & Kashmir' },
    { value: '02', label: '02 — Himachal Pradesh' },
    { value: '03', label: '03 — Punjab' },
    { value: '07', label: '07 — Delhi' },
    { value: '08', label: '08 — Rajasthan' },
    { value: '09', label: '09 — Uttar Pradesh' },
    { value: '19', label: '19 — West Bengal' },
    { value: '27', label: '27 — Maharashtra' },
    { value: '29', label: '29 — Karnataka' },
    { value: '32', label: '32 — Kerala' },
    { value: '33', label: '33 — Tamil Nadu' },
    { value: '36', label: '36 — Telangana' },
  ]

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Company Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              label="Company Name"
              value={settings.company_name}
              onChange={v => setSettings(s => ({ ...s, company_name: v }))}
              required
            />
            <GlassInput
              label="GSTIN"
              value={settings.gstin}
              onChange={v => setSettings(s => ({ ...s, gstin: v }))}
              placeholder="27AABCS1429B1ZB"
            />
            <GlassInput
              label="PAN"
              value={settings.pan}
              onChange={v => setSettings(s => ({ ...s, pan: v }))}
              placeholder="AABCS1429B"
            />
            <GlassSelect
              label="State"
              value={settings.state_code}
              onChange={v => setSettings(s => ({ ...s, state_code: v }))}
              options={STATES}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="p-5">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <GlassInput
                label="Address Line 1"
                value={settings.address?.line1 ?? ''}
                onChange={v => setSettings(s => ({ ...s, address: { ...(s.address ?? { city: '', state: '', state_code: '', pincode: '' }), line1: v } }))}
              />
            </div>
            <GlassInput
              label="City"
              value={settings.address?.city ?? ''}
              onChange={v => setSettings(s => ({ ...s, address: { ...(s.address ?? { line1: '', state: '', state_code: '', pincode: '' }), city: v } }))}
            />
            <GlassInput
              label="Pincode"
              value={settings.address?.pincode ?? ''}
              onChange={v => setSettings(s => ({ ...s, address: { ...(s.address ?? { line1: '', city: '', state: '', state_code: '' }), pincode: v } }))}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="p-5">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: tokens.color.text1 }}>GST & E-Invoicing</h3>
          <div className="space-y-4">
            <GlassSelect
              label="Fiscal Year Start"
              value={settings.fiscal_year_start}
              onChange={v => setSettings(s => ({ ...s, fiscal_year_start: v }))}
              options={[
                { value: '04-01', label: 'April (Indian Fiscal Year)' },
                { value: '01-01', label: 'January (Calendar Year)' },
              ]}
            />
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: tokens.glass.bg, border: `1px solid ${tokens.glass.border}` }}>
              <div>
                <p className="text-sm font-medium" style={{ color: tokens.color.text1 }}>E-Invoicing Applicable</p>
                <p className="text-xs mt-0.5" style={{ color: tokens.color.text3 }}>Required for turnover &gt; ₹5 crore. Enables IRN generation on confirmed invoices.</p>
              </div>
              <GlassCheckbox
                checked={settings.e_invoicing}
                onChange={v => setSettings(s => ({ ...s, e_invoicing: v }))}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton variant="primary" loading={saving} onClick={handleSave}>Save Changes</GlassButton>
      </div>
    </div>
  )
}

/* ── TDS Rates ───────────────────────────────────────────── */
function TDSRates() {
  const { items: rates, update } = useLocalStore<TDSRate>('tds_rates', DEFAULT_TDS_RATES)

  useEffect(() => { document.title = 'TDS Rates | ERP' }, [])

  const columns: TableColumn<TDSRate>[] = [
    {
      key: 'section', header: 'Section', width: '100px',
      render: r => <span className="font-mono text-sm" style={{ color: tokens.color.text1 }}>{r.section}</span>,
    },
    {
      key: 'description', header: 'Description', width: '2fr',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.description}</span>,
    },
    {
      key: 'rate', header: 'Rate %', width: '100px', align: 'right',
      render: r => (
        <input
          type="number"
          value={r.rate}
          min={0} max={30} step={0.5}
          onChange={e => update(r.id, { rate: parseFloat(e.target.value) || 0 })}
          className="w-16 text-right text-sm px-2 py-1 rounded"
          style={{ background: tokens.glass.inputBg, border: `1px solid ${tokens.glass.inputBorder}`, color: tokens.color.text1, outline: 'none' }}
        />
      ),
    },
    {
      key: 'threshold', header: 'Threshold ₹', width: '150px', align: 'right',
      render: r => (
        <input
          type="number"
          value={r.threshold}
          min={0}
          onChange={e => update(r.id, { threshold: parseInt(e.target.value) || 0 })}
          className="w-28 text-right text-sm px-2 py-1 rounded"
          style={{ background: tokens.glass.inputBg, border: `1px solid ${tokens.glass.inputBorder}`, color: tokens.color.text1, outline: 'none' }}
        />
      ),
    },
  ]

  return (
    <GlassCard size="lg" hover={false} className="p-5">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>TDS Sections & Rates</h3>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>Click a value to edit inline</p>
        </div>
        <GlassTable
          columns={columns}
          data={rates as unknown as Record<string, unknown>[]}
          rowKey="id"
        />
      </div>
    </GlassCard>
  )
}

/* ── Users ───────────────────────────────────────────────── */
function UserSettings() {
  const { items: users, update } = useLocalStore<EmpUser>('erp_users', DEFAULT_USERS)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'staff' })
  const toast = useToast()

  useEffect(() => { document.title = 'Users | ERP' }, [])

  const columns: TableColumn<EmpUser>[] = [
    {
      key: 'name', header: 'User', width: '2fr',
      render: r => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: tokens.gradient.sunset }}
          >
            {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{r.name}</p>
            <p className="text-xs" style={{ color: tokens.color.text3 }}>{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role', width: '120px',
      render: r => (
        <GlassBadge variant={r.role === 'admin' ? 'confirmed' : r.role === 'manager' ? 'info' : 'neutral'}>
          {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
        </GlassBadge>
      ),
    },
    {
      key: 'is_active', header: 'Status', width: '100px',
      render: r => (
        <GlassBadge variant={r.is_active ? 'paid' : 'cancelled'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </GlassBadge>
      ),
    },
    {
      key: 'actions', header: '', width: '120px', align: 'right',
      render: r => (
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => update(r.id, { is_active: !r.is_active })}
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </GlassButton>
      ),
    },
  ]

  return (
    <>
      <GlassCard size="lg" hover={false} className="p-5">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>Team Members</h3>
            <GlassButton variant="primary" size="sm" onClick={() => setShowInvite(true)}>
              Invite User
            </GlassButton>
          </div>
          <GlassTable
            columns={columns}
            data={users as unknown as Record<string, unknown>[]}
            rowKey="id"
          />
        </div>
      </GlassCard>

      <GlassModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Team Member"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setShowInvite(false)}>Cancel</GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                setShowInvite(false)
                toast.success(`Invitation sent to ${inviteForm.email}.`)
              }}
            >
              Send Invite
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassInput
            label="Full Name"
            value={inviteForm.name}
            onChange={v => setInviteForm(f => ({ ...f, name: v }))}
            required
          />
          <GlassInput
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={v => setInviteForm(f => ({ ...f, email: v }))}
            required
          />
          <GlassSelect
            label="Role"
            value={inviteForm.role}
            onChange={v => setInviteForm(f => ({ ...f, role: v }))}
            options={[
              { value: 'admin', label: 'Admin — Full access' },
              { value: 'manager', label: 'Manager — Most features' },
              { value: 'staff', label: 'Staff — Operational tasks' },
              { value: 'viewer', label: 'Viewer — Read only' },
            ]}
          />
        </div>
      </GlassModal>
    </>
  )
}

/* ── Notifications Settings ──────────────────────────────── */
function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    overdueInvoices: true,
    lowStock: true,
    paymentReceived: true,
    billDue: false,
  })
  const toast = useToast()

  useEffect(() => { document.title = 'Notifications | ERP' }, [])

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const items = [
    { key: 'overdueInvoices' as const, label: 'Overdue Invoice Alerts', desc: 'Notify when invoices become overdue. Max once per 7 days per invoice.' },
    { key: 'lowStock' as const, label: 'Low Stock Alerts', desc: 'Notify when product quantity drops to or below reorder point. Max once per day.' },
    { key: 'paymentReceived' as const, label: 'Payment Received', desc: 'Notify when a customer payment is recorded.' },
    { key: 'billDue' as const, label: 'Vendor Bill Due', desc: 'Notify 3 days before a vendor bill is due.' },
  ]

  return (
    <div className="space-y-3">
      {items.map(item => (
        <GlassCard key={item.key} hover={false} className="p-4">
          <div style={{ position: 'relative', zIndex: 1 }} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: tokens.color.text3 }}>{item.desc}</p>
            </div>
            <GlassCheckbox checked={prefs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        </GlassCard>
      ))}
      <div className="flex justify-end">
        <GlassButton variant="primary" onClick={() => toast.success('Notification preferences saved.')}>
          Save Preferences
        </GlassButton>
      </div>
    </div>
  )
}

/* ── Main Settings shell ──────────────────────────────────── */
export default function Settings() {
  const { user } = useAuth()

  useEffect(() => { document.title = 'Settings | ERP' }, [])

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Shield size={40} style={{ color: tokens.color.text3, marginBottom: 16 }} className="mx-auto" />
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>Admin Only</p>
          <p className="text-xs mt-1" style={{ color: tokens.color.text3 }}>Settings are only accessible by administrators.</p>
        </div>
      </div>
    )
  }

  const NAV = [
    { to: '/settings', icon: Building2, label: 'Company Profile' },
    { to: '/settings/users', icon: Users, label: 'Users & Roles' },
    { to: '/settings/tds', icon: Shield, label: 'TDS Rates' },
    { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
  ]

  return (
    <>
      <DemoBanner />
      <div className="flex gap-6">
        {/* Sidebar */}
        <GlassCard hover={false} className="p-3 h-fit w-52 flex-shrink-0">
          <div style={{ position: 'relative', zIndex: 1 }} className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider px-3 py-2" style={{ color: tokens.color.text3 }}>
              Settings
            </p>
            {NAV.map(item => (
              <SettingsNavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </div>
        </GlassCard>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route index element={<CompanySettings />} />
            <Route path="users" element={<UserSettings />} />
            <Route path="tds" element={<TDSRates />} />
            <Route path="notifications" element={<NotificationSettings />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

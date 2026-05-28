import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, PowerOff } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton, GlassTable, ConfirmModal } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CONTACTS, MOCK_INVOICES, MOCK_BILLS } from '@/lib/mockData'
import type { Contact, Invoice, Bill } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency, formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items: contacts, update } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: invoices } = useLocalStore<Invoice>('invoices', MOCK_INVOICES)
  const { items: bills } = useLocalStore<Bill>('bills', [])
  const [showDeactivate, setShowDeactivate] = useState(false)

  const contact = contacts.find(c => c.id === id)

  useEffect(() => {
    document.title = `${contact?.name ?? 'Contact'} | ERP`
  }, [contact?.name])

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-[200px]" style={{ color: tokens.color.text3 }}>
        Contact not found.
      </div>
    )
  }

  const relatedInvoices = invoices.filter(i => i.customer_id === id)
  const relatedBills = bills.filter(b => b.vendor_id === id)

  const invoiceCols: TableColumn<Invoice>[] = [
    { key: 'number', header: 'Invoice #', width: '120px', render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'due_date', header: 'Due Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.due_date)}</span> },
    { key: 'total_amount', header: 'Amount', align: 'right', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.total_amount)}</span> },
    {
      key: 'status', header: 'Status', width: '110px',
      render: r => <GlassBadge variant={r.status === 'paid' ? 'paid' : r.status === 'overdue' ? 'overdue' : r.status === 'draft' ? 'draft' : 'confirmed'}>{r.status}</GlassBadge>,
    },
  ]

  const billCols: TableColumn<Bill>[] = [
    { key: 'number', header: 'Bill #', width: '120px', render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    { key: 'total_amount', header: 'Amount', align: 'right', render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.total_amount)}</span> },
    {
      key: 'status', header: 'Status', width: '110px',
      render: r => <GlassBadge variant={r.status === 'paid' ? 'paid' : r.status === 'overdue' ? 'overdue' : 'confirmed'}>{r.status}</GlassBadge>,
    },
  ]

  const totalBilled = relatedInvoices.reduce((s, i) => s + i.total_amount, 0)
  const outstanding = relatedInvoices.reduce((s, i) => s + i.amount_due, 0)

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Type', value: contact.type.charAt(0).toUpperCase() + contact.type.slice(1) },
            { label: 'Tax Treatment', value: contact.tax_treatment },
            { label: 'GSTIN', value: contact.gstin ?? '—' },
            { label: 'PAN', value: contact.pan ?? '—' },
            { label: 'Email', value: contact.email ?? '—' },
            { label: 'Phone', value: contact.phone ?? '—' },
            { label: 'Payment Terms', value: contact.payment_terms_days ? `Net ${contact.payment_terms_days}` : '—' },
            { label: 'Credit Limit', value: contact.credit_limit ? formatCurrency(contact.credit_limit) : '—' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>{item.label}</p>
              <p className="text-sm" style={{ color: tokens.color.text1 }}>{item.value}</p>
            </div>
          ))}
          {contact.billing_address && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>Billing Address</p>
              <p className="text-sm" style={{ color: tokens.color.text1 }}>
                {contact.billing_address.line1}, {contact.billing_address.city}, {contact.billing_address.state} — {contact.billing_address.pincode}
              </p>
            </div>
          )}
          {contact.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>Notes</p>
              <p className="text-sm" style={{ color: tokens.color.text2 }}>{contact.notes}</p>
            </div>
          )}
        </div>
      ),
    },
    ...(contact.type !== 'vendor' ? [{
      key: 'invoices',
      label: `Invoices (${relatedInvoices.length})`,
      content: (
        <GlassTable
          columns={invoiceCols as unknown as TableColumn<Record<string, unknown>>[]}
          data={relatedInvoices as unknown as Record<string, unknown>[]}
          onRowClick={row => navigate(`/sales/invoices/${(row as unknown as Invoice).id}`)}
          emptyText="No invoices for this contact"
        />
      ),
    }] : []),
    ...(contact.type !== 'customer' ? [{
      key: 'bills',
      label: `Bills (${relatedBills.length})`,
      content: (
        <GlassTable
          columns={billCols as unknown as TableColumn<Record<string, unknown>>[]}
          data={relatedBills as unknown as Record<string, unknown>[]}
          onRowClick={row => navigate(`/purchasing/bills/${(row as unknown as Bill).id}`)}
          emptyText="No bills for this contact"
        />
      ),
    }] : []),
  ]

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={contact.name}
        subtitle={`${contact.type} · ${contact.gstin ?? contact.email ?? ''}`}
        backHref="/contacts"
        badges={
          <>
            <GlassBadge variant={contact.type === 'customer' ? 'info' : 'confirmed'}>
              {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
            </GlassBadge>
            <GlassBadge variant={contact.is_active ? 'paid' : 'cancelled'}>
              {contact.is_active ? 'Active' : 'Inactive'}
            </GlassBadge>
          </>
        }
        actions={
          <>
            <GlassButton variant="secondary" icon={PowerOff} size="sm" onClick={() => setShowDeactivate(true)}>
              {contact.is_active ? 'Deactivate' : 'Activate'}
            </GlassButton>
            <GlassButton variant="primary" icon={Edit2} size="sm" onClick={() => navigate(`/contacts/${id}/edit`)}>
              Edit
            </GlassButton>
          </>
        }
        infoCards={[
          { label: 'Total Billed', value: formatCurrency(totalBilled) },
          { label: 'Outstanding', value: formatCurrency(outstanding) },
          { label: 'Payment Terms', value: contact.payment_terms_days ? `Net ${contact.payment_terms_days}` : '—' },
          { label: 'Credit Limit', value: contact.credit_limit ? formatCurrency(contact.credit_limit) : '—' },
        ]}
        tabs={tabs}
      />

      <ConfirmModal
        open={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={() => {
          update(id!, { is_active: !contact.is_active } as Partial<Contact>)
          setShowDeactivate(false)
        }}
        title={contact.is_active ? 'Deactivate Contact' : 'Activate Contact'}
        message={`Are you sure you want to ${contact.is_active ? 'deactivate' : 'activate'} ${contact.name}?`}
        confirmLabel={contact.is_active ? 'Deactivate' : 'Activate'}
        confirmVariant={contact.is_active ? 'danger' : 'primary'}
      />
    </>
  )
}

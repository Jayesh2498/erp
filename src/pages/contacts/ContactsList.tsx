import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CONTACTS } from '@/lib/mockData'
import type { Contact } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { tokens } from '@/components/ui-kit/tokens'

export default function ContactsList() {
  const navigate = useNavigate()
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => { document.title = 'Contacts | ERP' }, [])

  const filtered = useMemo(() => contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.gstin?.includes(q)
    const matchType = !typeFilter || c.type === typeFilter
    return matchSearch && matchType
  }), [contacts, search, typeFilter])

  const columns: TableColumn<Contact>[] = [
    {
      key: 'name', header: 'Name', width: '1.5fr',
      render: row => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{row.name}</p>
          {row.gstin && <p className="text-xs" style={{ color: tokens.color.text3 }}>GST: {row.gstin}</p>}
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', width: '100px',
      render: row => (
        <GlassBadge variant={row.type === 'customer' ? 'info' : row.type === 'vendor' ? 'confirmed' : 'neutral'}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </GlassBadge>
      ),
    },
    { key: 'email', header: 'Email', render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.email ?? '—'}</span> },
    { key: 'phone', header: 'Phone', render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.phone ?? '—'}</span> },
    {
      key: 'is_active', header: 'Status', width: '90px',
      render: row => (
        <GlassBadge variant={row.is_active ? 'paid' : 'cancelled'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </GlassBadge>
      ),
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Contacts"
        subtitle={`${filtered.length} contacts`}
        actions={
          <GlassButton variant="primary" icon={Plus} onClick={() => navigate('/contacts/new')}>
            New Contact
          </GlassButton>
        }
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/contacts/${(row as unknown as Contact).id}`)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search contacts…"
        filters={
          <GlassSelect
            placeholder="All Types"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'All Types' },
              { value: 'customer', label: 'Customer' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'both', label: 'Both' },
            ]}
          />
        }
        emptyText="No contacts found"
        emptySubtext="Create your first contact to get started."
      />
    </>
  )
}

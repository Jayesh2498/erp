import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import type { Product } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function ProductsList() {
  const navigate = useNavigate()
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => { document.title = 'Products | ERP' }, [])

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    const matchType = !typeFilter || p.type === typeFilter
    return matchSearch && matchType
  }), [products, search, typeFilter])

  const columns: TableColumn<Product>[] = [
    {
      key: 'name', header: 'Name', width: '1.5fr',
      render: row => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{row.name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', width: '90px',
      render: row => (
        <GlassBadge variant={row.type === 'product' ? 'info' : 'neutral'}>
          {row.type === 'product' ? 'Product' : 'Service'}
        </GlassBadge>
      ),
    },
    { key: 'category', header: 'Category', render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.category ?? '—'}</span> },
    {
      key: 'selling_price', header: 'Price', align: 'right', width: '110px',
      render: row => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(row.selling_price)}</span>,
    },
    {
      key: 'tax_rate', header: 'GST', width: '70px', align: 'right',
      render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.tax_rate}%</span>,
    },
    {
      key: 'is_active', header: 'Status', width: '80px',
      render: row => <GlassBadge variant={row.is_active ? 'paid' : 'cancelled'}>{row.is_active ? 'Active' : 'Inactive'}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Products"
        subtitle={`${filtered.length} products & services`}
        actions={
          <GlassButton variant="primary" icon={Plus} onClick={() => navigate('/products/new')}>
            New Product
          </GlassButton>
        }
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={row => navigate(`/products/${(row as unknown as Product).id}`)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products…"
        filters={
          <GlassSelect
            placeholder="All Types"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'All Types' },
              { value: 'product', label: 'Product' },
              { value: 'service', label: 'Service' },
            ]}
          />
        }
        emptyText="No products found"
        emptySubtext="Create your first product to get started."
      />
    </>
  )
}

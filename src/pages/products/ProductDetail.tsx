import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2 } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton, GlassTable } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PRODUCTS, MOCK_INVENTORY } from '@/lib/mockData'
import type { Product, InventoryItem } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)
  const { items: inventory } = useLocalStore<InventoryItem>('inventory', MOCK_INVENTORY)

  const product = products.find(p => p.id === id)
  const productStock = inventory.filter(i => i.product_id === id)

  useEffect(() => {
    document.title = `${product?.name ?? 'Product'} | ERP`
  }, [product?.name])

  if (!product) {
    return <div className="flex items-center justify-center min-h-[200px]" style={{ color: tokens.color.text3 }}>Product not found.</div>
  }

  const stockCols: TableColumn<InventoryItem>[] = [
    { key: 'warehouse_name', header: 'Warehouse', render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{r.warehouse_name}</span> },
    { key: 'quantity', header: 'Qty on Hand', align: 'right', render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{r.quantity}</span> },
    { key: 'committed_quantity', header: 'Committed', align: 'right', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.committed_quantity}</span> },
    { key: 'available', header: 'Available', align: 'right', render: r => <span style={{ color: tokens.color.text1, fontWeight: 600, fontSize: 13 }}>{r.quantity - r.committed_quantity}</span> },
    { key: 'reorder_point', header: 'Reorder Pt', align: 'right', render: r => <span style={{ color: tokens.color.text3, fontSize: 13 }}>{r.reorder_point}</span> },
    {
      key: 'status', header: 'Status', width: '90px',
      render: r => {
        const avail = r.quantity - r.committed_quantity
        const variant = avail <= 0 ? 'overdue' : avail <= r.reorder_point ? 'sent' : 'paid'
        const label = avail <= 0 ? 'Out of Stock' : avail <= r.reorder_point ? 'Low' : 'OK'
        return <GlassBadge variant={variant}>{label}</GlassBadge>
      },
    },
  ]

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        backHref="/products"
        badges={
          <>
            <GlassBadge variant={product.type === 'product' ? 'info' : 'neutral'}>
              {product.type === 'product' ? 'Product' : 'Service'}
            </GlassBadge>
            {product.category && <GlassBadge variant="neutral">{product.category}</GlassBadge>}
            <GlassBadge variant={product.is_active ? 'paid' : 'cancelled'}>
              {product.is_active ? 'Active' : 'Inactive'}
            </GlassBadge>
          </>
        }
        actions={
          <GlassButton variant="primary" icon={Edit2} size="sm" onClick={() => navigate(`/products/${id}/edit`)}>
            Edit
          </GlassButton>
        }
        infoCards={[
          { label: 'Selling Price', value: formatCurrency(product.selling_price) },
          { label: 'Cost Price', value: formatCurrency(product.cost_price) },
          { label: 'GST Rate', value: `${product.tax_rate}%` },
          { label: 'HSN / SAC', value: product.hsn_sac_code ?? '—' },
        ]}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Name', value: product.name },
                  { label: 'SKU', value: product.sku },
                  { label: 'Category', value: product.category ?? '—' },
                  { label: 'Track Inventory', value: product.track_inventory ? 'Yes' : 'No' },
                  { label: 'Reorder Point', value: product.reorder_point?.toString() ?? '—' },
                  { label: 'Description', value: product.description ?? '—' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>{item.label}</p>
                    <p className="text-sm" style={{ color: tokens.color.text1 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            ),
          },
          ...(product.track_inventory ? [{
            key: 'stock',
            label: 'Stock Levels',
            content: (
              <GlassTable
                columns={stockCols as TableColumn<Record<string, unknown>>[]}
                data={productStock as unknown as Record<string, unknown>[]}
                rowKey="warehouse_id"
                emptyText="No stock data"
              />
            ),
          }] : []),
        ]}
      />
    </>
  )
}

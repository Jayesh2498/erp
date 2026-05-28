import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassSelect, GlassTable, GlassBadge } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVENTORY, MOCK_WAREHOUSES, MOCK_PRODUCTS } from '@/lib/mockData'
import type { InventoryItem, Warehouse, Product } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

interface StockRow {
  id: string
  product_name: string
  sku: string
  warehouse: string
  quantity: number
  committed: number
  available: number
  reorder_point: number
  unit_value: number
  total_value: number
  status: 'ok' | 'low' | 'out'
}

export default function StockSummary() {
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { items: inventory } = useLocalStore<InventoryItem>('inventory', MOCK_INVENTORY)
  const { items: warehouses } = useLocalStore<Warehouse>('warehouses', MOCK_WAREHOUSES)
  const { items: products } = useLocalStore<Product>('products', MOCK_PRODUCTS)

  useEffect(() => { document.title = 'Stock Summary | ERP' }, [])

  const rows: StockRow[] = inventory.map(item => {
    const product = products.find(p => p.id === item.product_id)
    const committed = item.committed_quantity ?? 0
    const available = item.quantity - committed
    const reorder = item.reorder_point ?? product?.reorder_point ?? 0
    const unitValue = product?.cost_price ?? 0
    const status: StockRow['status'] = item.quantity === 0 ? 'out' : item.quantity <= reorder ? 'low' : 'ok'
    return {
      id: item.id,
      product_name: item.product_name,
      sku: product?.sku ?? '—',
      warehouse: item.warehouse_name,
      quantity: item.quantity,
      committed,
      available,
      reorder_point: reorder,
      unit_value: unitValue,
      total_value: unitValue * item.quantity,
      status,
    }
  })

  const filtered = rows.filter(r => {
    const matchWh = !warehouseFilter || r.warehouse === warehouseFilter
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchWh && matchStatus
  })

  const totalValue = filtered.reduce((s, r) => s + r.total_value, 0)
  const lowStockCount = rows.filter(r => r.status === 'low').length
  const outOfStockCount = rows.filter(r => r.status === 'out').length

  const columns: TableColumn<StockRow>[] = [
    {
      key: 'product_name', header: 'Product', width: '2fr',
      render: r => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{r.product_name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>SKU: {r.sku}</p>
        </div>
      ),
    },
    {
      key: 'warehouse', header: 'Warehouse', width: '130px',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.warehouse}</span>,
    },
    {
      key: 'quantity', header: 'On Hand', width: '90px', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.quantity}</span>,
    },
    {
      key: 'committed', header: 'Committed', width: '100px', align: 'right',
      render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.committed}</span>,
    },
    {
      key: 'available', header: 'Available', width: '100px', align: 'right',
      render: r => <span style={{ color: r.available < 0 ? tokens.color.danger : tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{r.available}</span>,
    },
    {
      key: 'reorder_point', header: 'Reorder At', width: '100px', align: 'right',
      render: r => <span style={{ color: tokens.color.text3, fontSize: 12 }}>{r.reorder_point}</span>,
    },
    {
      key: 'total_value', header: 'Stock Value', width: '140px', align: 'right',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{formatCurrency(r.total_value)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '90px',
      render: r => (
        <GlassBadge variant={r.status === 'ok' ? 'paid' : r.status === 'low' ? 'sent' : 'overdue'}>
          {r.status === 'ok' ? 'OK' : r.status === 'low' ? 'Low' : 'Out'}
        </GlassBadge>
      ),
    },
  ]

  return (
    <>
      <DemoBanner />
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <GlassCard hover={false} className="p-4">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>Total Stock Value</p>
            <p className="text-xl font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalValue)}</p>
          </div>
        </GlassCard>
        <GlassCard hover={false} className="p-4">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>Low Stock Items</p>
            <p className="text-xl font-bold" style={{ color: lowStockCount > 0 ? tokens.color.warning : tokens.color.text1 }}>
              {lowStockCount}
            </p>
          </div>
        </GlassCard>
        <GlassCard hover={false} className="p-4">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>Out of Stock</p>
            <p className="text-xl font-bold" style={{ color: outOfStockCount > 0 ? tokens.color.danger : tokens.color.text1 }}>
              {outOfStockCount}
            </p>
          </div>
        </GlassCard>
      </div>

      <PageLayout
        title="Stock Summary"
        subtitle={`${filtered.length} items across ${warehouses.length} warehouses`}
        actions={
          <div className="flex gap-2">
            <GlassSelect
              placeholder="All Warehouses"
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={[
                { value: '', label: 'All Warehouses' },
                ...warehouses.map(w => ({ value: w.name, label: w.name })),
              ]}
            />
            <GlassSelect
              placeholder="All Statuses"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ok', label: 'OK' },
                { value: 'low', label: 'Low Stock' },
                { value: 'out', label: 'Out of Stock' },
              ]}
            />
            <GlassButton variant="secondary" icon={Download} onClick={() => window.print()}>
              Export PDF
            </GlassButton>
          </div>
        }
      >
        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <GlassTable
              columns={columns}
              data={filtered as unknown as Record<string, unknown>[]}
              rowKey="id"
              emptyText="No stock records"
              emptySubtext="Add products and receive goods to see stock here."
            />
          </div>
        </GlassCard>
      </PageLayout>
    </>
  )
}

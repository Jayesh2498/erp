import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge, GlassSelect } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_INVENTORY, MOCK_WAREHOUSES } from '@/lib/mockData'
import type { InventoryItem, Warehouse } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { tokens } from '@/components/ui-kit/tokens'

export default function InventoryList() {
  const navigate = useNavigate()
  const { items: inventory } = useLocalStore<InventoryItem>('inventory', MOCK_INVENTORY)
  const { items: warehouses } = useLocalStore<Warehouse>('warehouses', MOCK_WAREHOUSES)
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')

  useEffect(() => { document.title = 'Inventory | ERP' }, [])

  const filtered = useMemo(() => inventory.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !q || i.product_name.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q)
    const matchWh = !warehouseFilter || i.warehouse_id === warehouseFilter
    return matchSearch && matchWh
  }), [inventory, search, warehouseFilter])

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: 'product_name', header: 'Product', width: '1.5fr',
      render: row => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{row.product_name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>{row.sku}</p>
        </div>
      ),
    },
    { key: 'warehouse_name', header: 'Warehouse', render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.warehouse_name}</span> },
    { key: 'quantity', header: 'On Hand', align: 'right', render: row => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{row.quantity}</span> },
    { key: 'committed_quantity', header: 'Committed', align: 'right', render: row => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{row.committed_quantity}</span> },
    { key: 'available', header: 'Available', align: 'right', render: row => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{row.quantity - row.committed_quantity}</span> },
    { key: 'reorder_point', header: 'Reorder Pt', align: 'right', render: row => <span style={{ color: tokens.color.text3, fontSize: 13 }}>{row.reorder_point}</span> },
    {
      key: 'status', header: 'Status', width: '90px',
      render: row => {
        const avail = row.quantity - row.committed_quantity
        if (avail <= 0) return <GlassBadge variant="overdue">Critical</GlassBadge>
        if (avail <= row.reorder_point) return <GlassBadge variant="sent">Low</GlassBadge>
        return <GlassBadge variant="paid">OK</GlassBadge>
      },
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Inventory"
        subtitle={`${filtered.length} items across ${warehouses.length} warehouses`}
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="secondary" icon={ArrowLeftRight} size="sm" onClick={() => navigate('/inventory/transfers')}>
              Transfers
            </GlassButton>
            <GlassButton variant="primary" icon={Plus} onClick={() => navigate('/inventory/adjustments/new')}>
              New Adjustment
            </GlassButton>
          </div>
        }
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products…"
        filters={
          <GlassSelect
            placeholder="All Warehouses"
            value={warehouseFilter}
            onChange={setWarehouseFilter}
            options={[
              { value: '', label: 'All Warehouses' },
              ...warehouses.map(w => ({ value: w.id, label: w.name })),
            ]}
          />
        }
        emptyText="No inventory records"
        emptySubtext="Add products with inventory tracking to see stock here."
      />
    </>
  )
}

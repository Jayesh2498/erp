import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ListPage, GlassButton, GlassBadge } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_STOCK_TRANSFERS } from '@/lib/mockData'
import type { StockTransfer } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

export default function TransfersList() {
  const navigate = useNavigate()
  const { items: transfers } = useLocalStore<StockTransfer>('transfers', MOCK_STOCK_TRANSFERS)

  useEffect(() => { document.title = 'Stock Transfers | ERP' }, [])

  const columns: TableColumn<StockTransfer>[] = [
    {
      key: 'number', header: 'Transfer #', width: '130px',
      render: r => <span className="font-semibold text-sm" style={{ color: tokens.color.sunsetOrange }}>{r.number}</span>,
    },
    { key: 'from_warehouse_name', header: 'From', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.from_warehouse_name}</span> },
    { key: 'to_warehouse_name', header: 'To', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{r.to_warehouse_name}</span> },
    { key: 'date', header: 'Date', render: r => <span style={{ color: tokens.color.text2, fontSize: 13 }}>{formatDate(r.date)}</span> },
    {
      key: 'items', header: 'Items', align: 'right', width: '80px',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{r.lines.length}</span>,
    },
    {
      key: 'status', header: 'Status', width: '110px',
      render: r => <GlassBadge variant={r.status === 'completed' ? 'paid' : 'draft'}>{r.status}</GlassBadge>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <ListPage
        title="Stock Transfers"
        subtitle={`${transfers.length} transfers`}
        backHref="/inventory"
        actions={
          <GlassButton variant="primary" icon={Plus} onClick={() => navigate('/inventory/transfers/new')}>
            New Transfer
          </GlassButton>
        }
        columns={columns}
        data={transfers as unknown as Record<string, unknown>[]}
        emptyText="No transfers yet"
        emptySubtext="Create a stock transfer to move goods between warehouses."
      />
    </>
  )
}

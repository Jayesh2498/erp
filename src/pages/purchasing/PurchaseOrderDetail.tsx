import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Send, Truck, FileSpreadsheet } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton, GlassModal, GlassInput, GlassCard } from '@/components/ui-kit'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_PURCHASE_ORDERS } from '@/lib/mockData'
import type { PurchaseOrder } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate, formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'sent' | 'paid' | 'cancelled' | 'confirmed'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', sent: 'sent', partially_received: 'confirmed',
  fully_received: 'paid', cancelled: 'cancelled',
}

export default function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workspace } = useAuth()
  const { items: orders, update } = useLocalStore<PurchaseOrder>('purchase-orders', MOCK_PURCHASE_ORDERS)
  const order = orders.find(o => o.id === id)
  const [receiveModal, setReceiveModal] = useState(false)
  const [receivedQtys, setReceivedQtys] = useState<Record<string, string>>({})

  useEffect(() => { document.title = `${order?.number ?? 'PO'} | ERP` }, [order?.number])

  if (!order) return <div style={{ color: tokens.color.text3 }}>Purchase order not found.</div>

  const handleReceive = () => {
    const updatedLines = order.lines.map(l => ({
      ...l,
      quantity_received: Math.min(l.quantity, l.quantity_received + (parseInt(receivedQtys[l.id] ?? '0') || 0)),
    }))
    const allReceived = updatedLines.every(l => l.quantity_received >= l.quantity)
    const anyReceived = updatedLines.some(l => l.quantity_received > 0)
    const status: PurchaseOrder['status'] = allReceived ? 'fully_received' : anyReceived ? 'partially_received' : order.status
    update(id!, { lines: updatedLines, status } as Partial<PurchaseOrder>)
    setReceiveModal(false)
    setReceivedQtys({})
  }

  const actions = (
    <>
      {order.status === 'draft' && (
        <>
          <GlassButton variant="secondary" icon={Edit2} size="sm" onClick={() => navigate(`/purchasing/orders/${id}/edit`)}>Edit</GlassButton>
          <GlassButton variant="primary" icon={Send} size="sm" onClick={() => update(id!, { status: 'sent' } as Partial<PurchaseOrder>)}>Send PO</GlassButton>
        </>
      )}
      {['sent', 'partially_received'].includes(order.status) && (
        <>
          <GlassButton variant="secondary" icon={FileSpreadsheet} size="sm" onClick={() => navigate(`/purchasing/bills/new?poId=${id}`)}>Create Bill</GlassButton>
          <GlassButton variant="primary" icon={Truck} size="sm" onClick={() => setReceiveModal(true)}>Receive Goods</GlassButton>
        </>
      )}
      {order.status === 'fully_received' && (
        <GlassButton variant="secondary" icon={FileSpreadsheet} size="sm" onClick={() => navigate(`/purchasing/bills/new?poId=${id}`)}>Create Bill</GlassButton>
      )}
    </>
  )

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={order.number}
        subtitle={order.vendor_name}
        backHref="/purchasing/orders"
        badges={<GlassBadge variant={statusVariant[order.status] ?? 'neutral'}>{order.status.replace('_', ' ')}</GlassBadge>}
        actions={actions}
        infoCards={[
          { label: 'Vendor', value: order.vendor_name },
          { label: 'Date', value: formatDate(order.date) },
          { label: 'Expected', value: order.expected_date ? formatDate(order.expected_date) : '—' },
          { label: 'Total', value: formatCurrency(order.total_amount) },
        ]}
        tabs={[
          {
            key: 'lines',
            label: 'Line Items',
            content: (
              <LineItemsEditor
                lines={order.lines as LineItem[]}
                onChange={() => {}}
                companyStateCode={workspace?.stateCode ?? '27'}
                customerStateCode="29"
                readOnly
              />
            ),
          },
        ]}
      />

      {/* Receive goods modal */}
      <GlassModal
        open={receiveModal}
        onClose={() => setReceiveModal(false)}
        title="Receive Goods"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setReceiveModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleReceive}>Confirm Receipt</GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: tokens.color.text2 }}>Enter quantities received for each line item.</p>
          {order.lines.map(line => (
            <div key={line.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{line.product_name}</p>
                <p className="text-xs" style={{ color: tokens.color.text3 }}>Ordered: {line.quantity} · Received so far: {line.quantity_received}</p>
              </div>
              <div style={{ width: 100 }}>
                <GlassInput
                  type="number"
                  placeholder="Qty"
                  value={receivedQtys[line.id] ?? ''}
                  onChange={v => setReceivedQtys(q => ({ ...q, [line.id]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassModal>
    </>
  )
}

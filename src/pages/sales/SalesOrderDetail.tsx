import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Check, Receipt, X } from 'lucide-react'
import { DetailPage, GlassBadge, GlassButton } from '@/components/ui-kit'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { LineItem } from '@/components/LineItemsEditor'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_SALES_ORDERS } from '@/lib/mockData'
import type { SalesOrder } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { DemoBanner } from '@/components/DemoBanner'
import { formatDate, formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

type BadgeVariant = 'draft' | 'confirmed' | 'sent' | 'paid' | 'cancelled'
const statusVariant: Record<string, BadgeVariant> = {
  draft: 'draft', confirmed: 'confirmed',
  partially_invoiced: 'sent', fully_invoiced: 'paid', cancelled: 'cancelled',
}

export default function SalesOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workspace } = useAuth()
  const { items: orders, update } = useLocalStore<SalesOrder>('sales-orders', MOCK_SALES_ORDERS)
  const order = orders.find(o => o.id === id)

  useEffect(() => { document.title = `${order?.number ?? 'Sales Order'} | ERP` }, [order?.number])

  if (!order) return <div style={{ color: tokens.color.text3 }}>Order not found.</div>

  const changeStatus = (status: SalesOrder['status']) => {
    update(id!, { status } as Partial<SalesOrder>)
  }

  const actions = (
    <>
      {order.status === 'draft' && (
        <>
          <GlassButton variant="secondary" icon={Edit2} size="sm" onClick={() => navigate(`/sales/orders/${id}/edit`)}>Edit</GlassButton>
          <GlassButton variant="primary" icon={Check} size="sm" onClick={() => changeStatus('confirmed')}>Confirm</GlassButton>
        </>
      )}
      {(order.status === 'confirmed' || order.status === 'partially_invoiced') && (
        <GlassButton variant="primary" icon={Receipt} size="sm" onClick={() => navigate(`/sales/invoices/new?soId=${id}`)}>
          Create Invoice
        </GlassButton>
      )}
      {(order.status === 'draft' || order.status === 'confirmed') && (
        <GlassButton variant="danger" icon={X} size="sm" onClick={() => changeStatus('cancelled')}>Cancel</GlassButton>
      )}
    </>
  )

  return (
    <>
      <DemoBanner />
      <DetailPage
        title={order.number}
        subtitle={order.customer_name}
        backHref="/sales/orders"
        badges={<GlassBadge variant={statusVariant[order.status] ?? 'neutral'}>{order.status.replace('_', ' ')}</GlassBadge>}
        actions={actions}
        infoCards={[
          { label: 'Customer', value: order.customer_name },
          { label: 'Order Date', value: formatDate(order.date) },
          { label: 'Expected Delivery', value: order.expected_delivery ? formatDate(order.expected_delivery) : '—' },
          { label: 'Total Amount', value: formatCurrency(order.total_amount) },
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
                customerStateCode="27"
                readOnly
              />
            ),
          },
          ...(order.notes ? [{
            key: 'details',
            label: 'Details',
            content: (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.color.text3 }}>Notes</p>
                <p className="text-sm" style={{ color: tokens.color.text2 }}>{order.notes}</p>
              </div>
            ),
          }] : []),
        ]}
      />
    </>
  )
}

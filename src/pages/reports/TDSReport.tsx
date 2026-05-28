import React, { useEffect, useState } from 'react'
import { Download, Clock } from 'lucide-react'
import { PageLayout, GlassCard, GlassButton, GlassSelect, GlassBadge, GlassTable } from '@/components/ui-kit'
import type { TableColumn } from '@/components/ui-kit'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_CONTACTS, MOCK_BILLS } from '@/lib/mockData'
import type { Contact, Bill } from '@/types'
import { DemoBanner } from '@/components/DemoBanner'
import { formatCurrency } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

interface TDSRow {
  id: string
  vendor_name: string
  pan: string
  section: string
  gross_payments: number
  tds_deducted: number
  net_paid: number
}

const PERIOD_OPTIONS = [
  { value: 'q1-2026', label: 'Q1 FY 2026-27 (Apr–Jun 2026)' },
  { value: 'q4-2025', label: 'Q4 FY 2025-26 (Jan–Mar 2026)' },
  { value: 'q3-2025', label: 'Q3 FY 2025-26 (Oct–Dec 2025)' },
  { value: 'q2-2025', label: 'Q2 FY 2025-26 (Jul–Sep 2025)' },
  { value: 'fy-2026', label: 'Full Year FY 2025-26' },
]

export default function TDSReport() {
  const [period, setPeriod] = useState('q1-2026')
  const { items: contacts } = useLocalStore<Contact>('contacts', MOCK_CONTACTS)
  const { items: bills } = useLocalStore<Bill>('bills', MOCK_BILLS)

  useEffect(() => { document.title = 'TDS Report | ERP' }, [])

  // Build TDS rows — derive from bills with vendor PAN
  const vendorBills = bills.filter(b => b.status === 'paid' || b.status === 'partially_paid')

  const tdsMap: Record<string, TDSRow> = {}
  vendorBills.forEach(bill => {
    const vendor = contacts.find(c => c.id === bill.vendor_id)
    if (!vendor) return
    const key = bill.vendor_id
    const gross = bill.total_amount
    const tds = Math.round(gross * 0.1) // 10% TDS (194J example)
    const net = gross - tds

    if (tdsMap[key]) {
      tdsMap[key].gross_payments += gross
      tdsMap[key].tds_deducted += tds
      tdsMap[key].net_paid += net
    } else {
      tdsMap[key] = {
        id: key,
        vendor_name: vendor.name,
        pan: vendor.pan ?? 'Not Available',
        section: '194J — Professional/Technical',
        gross_payments: gross,
        tds_deducted: tds,
        net_paid: net,
      }
    }
  })

  const rows = Object.values(tdsMap)
  const totalGross = rows.reduce((s, r) => s + r.gross_payments, 0)
  const totalTDS = rows.reduce((s, r) => s + r.tds_deducted, 0)
  const totalNet = rows.reduce((s, r) => s + r.net_paid, 0)

  const columns: TableColumn<TDSRow>[] = [
    {
      key: 'vendor_name', header: 'Vendor', width: '2fr',
      render: r => (
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>{r.vendor_name}</p>
          <p className="text-xs" style={{ color: tokens.color.text3 }}>PAN: {r.pan}</p>
        </div>
      ),
    },
    {
      key: 'section', header: 'TDS Section', width: '1.5fr',
      render: r => <span className="text-xs" style={{ color: tokens.color.text2 }}>{r.section}</span>,
    },
    {
      key: 'gross_payments', header: 'Gross Payments', align: 'right', width: '150px',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13 }}>{formatCurrency(r.gross_payments)}</span>,
    },
    {
      key: 'tds_deducted', header: 'TDS Deducted', align: 'right', width: '140px',
      render: r => <span style={{ color: tokens.color.danger, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.tds_deducted)}</span>,
    },
    {
      key: 'net_paid', header: 'Net Paid', align: 'right', width: '140px',
      render: r => <span style={{ color: tokens.color.text1, fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.net_paid)}</span>,
    },
  ]

  return (
    <>
      <DemoBanner />
      <PageLayout
        title="TDS Report"
        subtitle="Tax Deducted at Source — vendor-wise breakdown"
        actions={
          <div className="flex gap-2 items-center">
            <GlassSelect
              placeholder="Select period"
              value={period}
              onChange={setPeriod}
              options={PERIOD_OPTIONS}
            />
            <GlassButton variant="secondary" icon={Download} onClick={() => window.print()}>
              Export PDF
            </GlassButton>
            <GlassButton variant="secondary" disabled>
              <Clock size={13} className="mr-1.5" />
              Form 26Q
              <GlassBadge variant="neutral" className="ml-2">Soon</GlassBadge>
            </GlassButton>
          </div>
        }
      >
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Gross Payments', value: formatCurrency(totalGross) },
            { label: 'TDS Deducted', value: formatCurrency(totalTDS) },
            { label: 'Net Paid', value: formatCurrency(totalNet) },
          ].map(({ label, value }) => (
            <GlassCard key={label} hover={false} className="p-4">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs mb-1" style={{ color: tokens.color.text3 }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: tokens.color.text1 }}>{value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard size="lg" hover={false} className="p-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-xs font-semibold mb-3" style={{ color: tokens.color.text3 }}>
              Period: {PERIOD_OPTIONS.find(p => p.value === period)?.label}
            </p>
            <GlassTable
              columns={columns}
              data={rows as unknown as Record<string, unknown>[]}
              rowKey="id"
              emptyText="No TDS transactions in this period"
              emptySubtext="TDS is applicable only to eligible vendors with PAN."
            />
            {rows.length > 0 && (
              <div
                className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-right"
                style={{ borderColor: tokens.glass.border }}
              >
                <div>
                  <p className="text-xs" style={{ color: tokens.color.text3 }}>Total Gross</p>
                  <p className="text-sm font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalGross)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: tokens.color.text3 }}>Total TDS</p>
                  <p className="text-sm font-bold" style={{ color: tokens.color.danger }}>{formatCurrency(totalTDS)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: tokens.color.text3 }}>Total Net</p>
                  <p className="text-sm font-bold" style={{ color: tokens.color.text1 }}>{formatCurrency(totalNet)}</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </PageLayout>
    </>
  )
}

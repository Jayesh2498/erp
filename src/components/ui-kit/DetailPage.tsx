/**
 * DetailPage — standard detail/record page layout
 * ==================================================
 * Renders: PageLayout + hero header card (title, badges, actions) + info grid + tabs.
 *
 * USAGE:
 *   <DetailPage
 *     title="Acme Corp"
 *     subtitle="Customer · GST: 27AABCU9603R1ZX"
 *     badges={<GlassBadge variant="confirmed">Active</GlassBadge>}
 *     actions={
 *       <>
 *         <GlassButton variant="secondary" icon={Edit2}>Edit</GlassButton>
 *         <GlassButton variant="primary" icon={Plus}>New Invoice</GlassButton>
 *       </>
 *     }
 *     infoCards={[
 *       { label: 'Total Billed',  value: '₹24,50,000' },
 *       { label: 'Outstanding',   value: '₹3,20,000'  },
 *       { label: 'Last Invoice',  value: '12 Jan 2026' },
 *       { label: 'Credit Limit', value: '₹10,00,000' },
 *     ]}
 *     tabs={[
 *       { key: 'invoices', label: 'Invoices', content: <InvoicesTab /> },
 *       { key: 'payments', label: 'Payments', content: <PaymentsTab /> },
 *     ]}
 *     backHref="/contacts"
 *   />
 */
import React, { useState } from 'react'
import { GlassCard } from './GlassCard'
import { PageLayout } from './PageLayout'
import { tokens } from './tokens'

interface InfoCardItem {
  label: string
  value: React.ReactNode
  sub?: string
}

interface DetailTab {
  key: string
  label: string
  content: React.ReactNode
}

interface DetailPageProps {
  title: string
  subtitle?: string
  backHref?: string
  badges?: React.ReactNode
  actions?: React.ReactNode
  infoCards?: InfoCardItem[]
  tabs?: DetailTab[]
  children?: React.ReactNode
}

export function DetailPage({
  title,
  subtitle,
  backHref,
  badges,
  actions,
  infoCards,
  tabs,
  children,
}: DetailPageProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key ?? '')

  return (
    <PageLayout title={title} subtitle={subtitle} backHref={backHref} actions={actions}>

      {/* Hero header card: badges + info metrics */}
      {(badges || (infoCards && infoCards.length > 0)) && (
        <GlassCard size="lg" hover={false} className="p-6">
          <div className="flex flex-col gap-5">
            {badges && (
              <div className="flex items-center gap-2 flex-wrap">
                {badges}
              </div>
            )}
            {infoCards && infoCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {infoCards.map(item => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: tokens.color.text3 }}>
                      {item.label}
                    </p>
                    <p className="text-lg font-bold" style={{ color: tokens.color.text1 }}>
                      {item.value}
                    </p>
                    {item.sub && (
                      <p className="text-xs" style={{ color: tokens.color.text3 }}>{item.sub}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <GlassCard size="lg" hover={false}>
          {/* Tab bar — each tab uses only borderBottom (no border shorthand conflict) */}
          <div
            className="flex items-center gap-1 px-4 pt-4 pb-0 border-b flex-wrap"
            style={{ borderColor: tokens.glass.border }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="text-sm font-medium px-4 py-2.5 transition-all duration-150 cursor-pointer"
                  style={{
                    background: 'none',
                    outline: 'none',
                    marginBottom: -1,
                    paddingBottom: 10,
                    color: isActive ? tokens.color.sunsetOrange : tokens.color.text3,
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: isActive
                      ? `2px solid ${tokens.color.sunsetOrange}`
                      : '2px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Active tab content */}
          <div className="p-5">
            {tabs.find(t => t.key === activeTab)?.content}
          </div>
        </GlassCard>
      )}

      {/* Free-form children */}
      {children}
    </PageLayout>
  )
}

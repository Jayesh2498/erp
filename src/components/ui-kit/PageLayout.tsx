/**
 * PageLayout — standard page wrapper used by every page
 * =======================================================
 * Renders:
 *  - Page header: title + subtitle + action buttons (top-right)
 *  - Content area (children)
 *
 * USAGE:
 *   <PageLayout title="Contacts" subtitle="Manage your customers and vendors">
 *     <ContactsTable />
 *   </PageLayout>
 *
 *   <PageLayout
 *     title="New Invoice"
 *     subtitle="Create a new customer invoice"
 *     backHref="/sales"
 *     actions={
 *       <>
 *         <GlassButton variant="secondary">Save Draft</GlassButton>
 *         <GlassButton variant="primary" icon={Send}>Issue Invoice</GlassButton>
 *       </>
 *     }
 *   >
 *     ...form content...
 *   </PageLayout>
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { tokens } from './tokens'

interface PageLayoutProps {
  title: string
  subtitle?: string
  /** If provided, renders a back button that navigates to this path */
  backHref?: string
  /** Buttons / controls rendered in the top-right of the header */
  actions?: React.ReactNode
  children: React.ReactNode
}

export function PageLayout({ title, subtitle, backHref, actions, children }: PageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button */}
          {backHref && (
            <button
              onClick={() => navigate(backHref)}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                background: tokens.glass.bg,
                border: `1px solid ${tokens.glass.border}`,
                color: tokens.color.text2,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(-1px)'
                e.currentTarget.style.color = tokens.color.text1
                e.currentTarget.style.borderColor = tokens.glass.borderHover
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.color = tokens.color.text2
                e.currentTarget.style.borderColor = tokens.glass.border
              }}
              aria-label="Go back"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className="min-w-0">
            <h2
              className="text-xl font-bold leading-tight truncate"
              style={{ color: tokens.color.text1 }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm mt-0.5 truncate" style={{ color: tokens.color.text3 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions slot */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}

/**
 * FormPage — standard form page layout
 * ========================================
 * Renders: PageLayout + glass card form sections + sticky save/cancel footer.
 *
 * USAGE:
 *   <FormPage
 *     title="New Contact"
 *     subtitle="Add a customer or vendor"
 *     backHref="/contacts"
 *     onSave={handleSave}
 *     onCancel={() => navigate('/contacts')}
 *     saving={isSaving}
 *   >
 *     <FormSection title="Basic Info">
 *       <GlassInput label="Name" value={name} onChange={setName} required />
 *       <GlassInput label="Email" type="email" value={email} onChange={setEmail} />
 *     </FormSection>
 *     <FormSection title="Address">
 *       <GlassInput label="City" value={city} onChange={setCity} />
 *     </FormSection>
 *   </FormPage>
 */
import React from 'react'
import { GlassCard } from './GlassCard'
import { GlassButton } from './GlassButton'
import { PageLayout } from './PageLayout'
import { tokens } from './tokens'

/* ── FormSection helper ─────────────────────────────────────── */
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  columns?: 1 | 2 | 3
}

export function FormSection({ title, description, children, columns = 2 }: FormSectionProps) {
  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' }[columns]

  return (
    <GlassCard size="lg" hover={false} className="p-6">
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs mt-1" style={{ color: tokens.color.text3 }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`grid ${gridCols} gap-5`}>
        {children}
      </div>
    </GlassCard>
  )
}

/* ── FormPage ───────────────────────────────────────────────── */
interface FormPageProps {
  title: string
  subtitle?: string
  backHref?: string
  children: React.ReactNode
  onSave?: () => void | Promise<void>
  onCancel?: () => void
  saving?: boolean
  saveLabel?: string
  cancelLabel?: string
  /** Extra action buttons in the footer (left side) */
  footerExtra?: React.ReactNode
}

export function FormPage({
  title,
  subtitle,
  backHref,
  children,
  onSave,
  onCancel,
  saving = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  footerExtra,
}: FormPageProps) {
  return (
    <PageLayout title={title} subtitle={subtitle} backHref={backHref}>
      <div className="space-y-4">
        {children}
      </div>

      {/* Save / cancel footer */}
      {(onSave || onCancel) && (
        <div
          className="flex items-center justify-between flex-wrap gap-3 pt-2"
        >
          <div>{footerExtra}</div>
          <div className="flex items-center gap-3">
            {onCancel && (
              <GlassButton variant="secondary" onClick={onCancel} disabled={saving}>
                {cancelLabel}
              </GlassButton>
            )}
            {onSave && (
              <GlassButton variant="primary" onClick={onSave} loading={saving}>
                {saveLabel}
              </GlassButton>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}

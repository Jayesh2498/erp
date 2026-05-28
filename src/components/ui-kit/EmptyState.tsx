/**
 * EmptyState — empty content placeholder with glass card background
 * ===================================================================
 * USAGE:
 *   <EmptyState
 *     icon={FileText}
 *     title="No invoices yet"
 *     subtitle="Create your first invoice to get started."
 *     action={<GlassButton icon={Plus}>New Invoice</GlassButton>}
 *   />
 *   <EmptyState title="No results" subtitle="Try a different search." />
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {Icon && (
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: tokens.glass.bg,
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            border: `1px solid ${tokens.glass.border}`,
            boxShadow: tokens.shadow.sm,
          }}
        >
          <Icon size={26} style={{ color: tokens.color.text3 }} />
        </div>
      )}

      <h3 className="text-base font-semibold mb-1.5" style={{ color: tokens.color.text1 }}>
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm max-w-xs mb-5" style={{ color: tokens.color.text3 }}>
          {subtitle}
        </p>
      )}

      {action}
    </div>
  )
}

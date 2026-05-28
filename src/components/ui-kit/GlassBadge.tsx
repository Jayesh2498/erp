/**
 * GlassBadge — semantic pill badge
 * =====================================
 * Semi-transparent backgrounds with readable text in both themes.
 * All colours adapt automatically via CSS variables.
 *
 * USAGE:
 *   <GlassBadge variant="paid">Paid</GlassBadge>
 *   <GlassBadge variant="overdue">Overdue</GlassBadge>
 *   <GlassBadge variant="draft">Draft</GlassBadge>
 *   <GlassBadge variant="confirmed">Confirmed</GlassBadge>
 *   <GlassBadge variant="neutral" className="text-xs">Custom</GlassBadge>
 */
import React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'draft'
  | 'sent'
  | 'confirmed'
  | 'cancelled'
  | 'neutral'
  | 'info'

const variantClass: Record<BadgeVariant, string> = {
  paid:      'badge-paid',
  partial:   'badge-partial',
  overdue:   'badge-overdue',
  draft:     'badge-draft',
  sent:      'badge-sent',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  neutral:   'badge-draft',
  info:      'badge-info',
}

interface GlassBadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function GlassBadge({ variant = 'neutral', children, className }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

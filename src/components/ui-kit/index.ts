/**
 * Snow Glass UI Kit — Barrel Export
 * =====================================
 * Import everything from here — never import from individual files.
 *
 * USAGE:
 *   import { GlassCard, GlassButton, StatCard, GlassTable } from '@/components/ui-kit'
 *   import { tokens, glassStyle, shineStyle } from '@/components/ui-kit'
 *   import { PageLayout, ListPage, DetailPage, FormPage, FormSection } from '@/components/ui-kit'
 *   import { useToast, ToastProvider } from '@/components/ui-kit'
 */

/* ── Design tokens & style factories ────────────────────────── */
export { tokens, glassStyle, shineStyle, aboveShine } from './tokens'
export type { GlassSize } from './GlassCard'

/* ── Core glass primitives ───────────────────────────────────── */
export { GlassCard }         from './GlassCard'
export { GlassButton }       from './GlassButton'
export { GlassInput }        from './GlassInput'
export { GlassSelect }       from './GlassSelect'
export { GlassBadge }        from './GlassBadge'
export { GlassTable }        from './GlassTable'
export { GlassModal }        from './GlassModal'
export { ConfirmModal }      from './ConfirmModal'
export { ToastProvider, useToast } from './GlassToast'

/* ── Composite components ────────────────────────────────────── */
export { StatCard }          from './StatCard'
export { SearchBar }         from './SearchBar'
export { EmptyState }        from './EmptyState'
export { SkeletonLoader }    from './SkeletonLoader'
export { ActivityDot, SunsetGradientText, Sparkline, GlassCheckbox } from './atoms'


/* ── Layout patterns ─────────────────────────────────────────── */
export { PageLayout }        from './PageLayout'
export { ListPage }          from './ListPage'
export { DetailPage }        from './DetailPage'
export { FormPage, FormSection } from './FormPage'

/* ── Type exports ────────────────────────────────────────────── */
export type { TableColumn }  from './GlassTable'
export type { ButtonVariant, ButtonSize } from './GlassButton'
export type { ToastVariant } from './GlassToast'

/**
 * SkeletonLoader — glass-styled shimmer loading placeholder
 * ===========================================================
 * Uses the warm shimmer animation from the design system.
 * Automatically adapts to dark mode.
 *
 * USAGE:
 *   <SkeletonLoader />                           — full width, 20px high
 *   <SkeletonLoader height={52} />               — custom height (table row)
 *   <SkeletonLoader width="60%" height={14} />   — partial width (text line)
 *   <SkeletonLoader circle size={40} />          — circular (avatar)
 *   <SkeletonLoader count={3} gap={8} />         — multiple stacked lines
 */
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

interface SkeletonLoaderProps {
  height?: number | string
  width?: number | string
  /** Circular skeleton — use with size prop */
  circle?: boolean
  size?: number
  /** Render multiple rows */
  count?: number
  /** Gap between multiple rows in px */
  gap?: number
  className?: string
}

function SkeletonItem({
  height = 20,
  width = '100%',
  circle = false,
  size,
  className,
}: Omit<SkeletonLoaderProps, 'count' | 'gap'>) {
  const resolvedHeight = circle ? (size ?? 40) : height
  const resolvedWidth  = circle ? (size ?? 40) : width

  return (
    <div
      className={cn('skeleton', className)}
      style={{
        height: resolvedHeight,
        width: resolvedWidth,
        borderRadius: circle ? '50%' : tokens.radius.sm,
        flexShrink: 0,
      }}
    />
  )
}

export function SkeletonLoader({
  count = 1,
  gap = 8,
  ...props
}: SkeletonLoaderProps) {
  if (count === 1) return <SkeletonItem {...props} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} {...props} />
      ))}
    </div>
  )
}

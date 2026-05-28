/**
 * GlassCard — base glass panel component
 * =========================================
 * The foundation of the Snow Glass design system.
 * Every content section, modal body, and dropdown uses this.
 *
 * USAGE:
 *   <GlassCard>Content here</GlassCard>
 *   <GlassCard size="lg" className="p-6">Wide card</GlassCard>
 *   <GlassCard hover={false}>Static info panel — no lift on hover</GlassCard>
 *   <GlassCard size="sm">Compact item</GlassCard>
 *
 * DARK MODE: Automatic via CSS variables — no prop needed.
 */
import React, { JSX } from 'react'
import { cn } from '@/lib/utils'
import { tokens, shineStyle, aboveShine } from './tokens'

export type GlassSize = 'sm' | 'md' | 'lg'

interface GlassCardProps {
  children: React.ReactNode
  /** Size controls border-radius and shadow weight */
  size?: GlassSize
  /** Enable hover lift + border brighten. Default: true */
  hover?: boolean
  /** Extra Tailwind/CSS classes (padding, grid, etc.) */
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  as?: keyof JSX.IntrinsicElements
}

const radiusMap: Record<GlassSize, string> = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
}
const shadowMap: Record<GlassSize, string> = {
  sm: tokens.shadow.sm,
  md: tokens.shadow.md,
  lg: tokens.shadow.lg,
}
const shineMap: Record<GlassSize, number> = { sm: 45, md: 40, lg: 38 }

export function GlassCard({
  children,
  size = 'md',
  hover = true,
  className,
  style,
  onClick,
  as: Tag = 'div',
}: GlassCardProps) {
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!hover) return
    const el = e.currentTarget as HTMLElement
    el.style.transform = 'translateY(-2px)'
    el.style.boxShadow = tokens.shadow.hover
    el.style.borderColor = tokens.glass.borderHover
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!hover) return
    const el = e.currentTarget as HTMLElement
    el.style.transform = ''
    el.style.boxShadow = shadowMap[size]
    el.style.borderColor = tokens.glass.border
  }

  return (
    <Tag
      className={cn(className)}
      style={{
        position: 'relative',
        background: tokens.glass.bg,
        backdropFilter: tokens.glass.blur,
        WebkitBackdropFilter: tokens.glass.blur,
        border: `1px solid ${tokens.glass.border}`,
        borderRadius: radiusMap[size],
        overflow: 'hidden',
        boxShadow: shadowMap[size],
        isolation: 'isolate',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Frosted shine — top portion only */}
      <div aria-hidden style={shineStyle(shineMap[size])} />
      {/* Content sits above shine */}
      <div style={aboveShine} className="h-full">
        {children}
      </div>
    </Tag>
  )
}

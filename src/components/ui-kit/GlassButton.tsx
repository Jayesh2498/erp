/**
 * GlassButton — all button variants
 * =====================================
 * Primary: sunset gradient + warm glow shadow
 * Secondary: glass panel bg + warm border
 * Danger: red gradient + red glow
 * Ghost: transparent + border on hover only
 * All variants read from CSS token variables — no hardcoded colors.
 *
 * USAGE:
 *   <GlassButton>Save</GlassButton>
 *   <GlassButton variant="primary" icon={Plus}>New Invoice</GlassButton>
 *   <GlassButton variant="secondary" size="sm">Cancel</GlassButton>
 *   <GlassButton variant="danger" onClick={handleDelete}>Delete</GlassButton>
 *   <GlassButton variant="ghost" icon={Search} iconOnly />
 *   <GlassButton loading>Saving…</GlassButton>
 *   <GlassButton disabled>Unavailable</GlassButton>
 */
import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize    = 'sm' | 'md' | 'lg'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ElementType
  iconOnly?: boolean
  loading?: boolean
  children?: React.ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-sm px-6 py-3 gap-2.5',
}
const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
}
const iconSizeMap: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 17 }

function getVariantStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: tokens.gradient.sunset,
        border: 'none',
        boxShadow: tokens.shadow.sunset,
        color: 'white',
      }
    case 'secondary':
      return {
        background: tokens.glass.bg,
        backdropFilter: tokens.glass.blur,
        WebkitBackdropFilter: tokens.glass.blur,
        border: `1px solid ${tokens.glass.border}`,
        boxShadow: tokens.shadow.sm,
        color: tokens.color.text2,
      }
    case 'danger':
      return {
        background: tokens.gradient.danger,
        border: 'none',
        boxShadow: tokens.button.dangerShadow,
        color: 'white',
      }
    case 'ghost':
      return {
        background: 'transparent',
        border: '1px solid transparent',
        boxShadow: 'none',
        color: tokens.color.text2,
      }
  }
}

function applyHover(el: HTMLButtonElement, variant: ButtonVariant) {
  el.style.transform = 'translateY(-1px)'
  switch (variant) {
    case 'primary':
      el.style.boxShadow = tokens.button.primaryHoverShadow
      break
    case 'secondary':
      el.style.boxShadow = tokens.shadow.md
      el.style.borderColor = tokens.glass.borderHover
      el.style.color = tokens.color.text1
      break
    case 'danger':
      el.style.boxShadow = tokens.button.dangerHoverShadow
      break
    case 'ghost':
      el.style.borderColor = tokens.glass.border
      el.style.color = tokens.color.text1
      el.style.background = tokens.glass.bg
      break
  }
}

function resetHover(el: HTMLButtonElement, variant: ButtonVariant) {
  el.style.transform = ''
  const base = getVariantStyle(variant)
  el.style.boxShadow  = (base.boxShadow  as string) ?? ''
  el.style.background = (base.background as string) ?? ''
  el.style.color      = (base.color      as string) ?? ''
  el.style.borderColor = ''
}

export function GlassButton({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  loading = false,
  disabled,
  children,
  className,
  onClick,
  type = 'button',
  ...rest
}: GlassButtonProps) {
  const isDisabled = disabled || loading
  const iconSize = iconSizeMap[size]

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold select-none',
        'focus-visible:outline-none focus-visible:ring-2',
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        isDisabled && 'opacity-60 cursor-not-allowed',
        !isDisabled && 'cursor-pointer',
        className,
      )}
      style={{
        ...getVariantStyle(variant),
        borderRadius: tokens.radius.pill,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease, background 0.15s ease, opacity 0.15s ease',
      }}
      onMouseEnter={e => { if (!isDisabled) applyHover(e.currentTarget, variant) }}
      onMouseLeave={e => { if (!isDisabled) resetHover(e.currentTarget, variant) }}
      onMouseDown={e => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(0.5px)'; e.currentTarget.style.opacity = '0.85' } }}
      onMouseUp={e => { if (!isDisabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '1' } }}
      onClick={onClick}
      {...rest}
    >
      {loading
        ? <Loader2 size={iconSize} className="animate-spin" />
        : Icon && <Icon size={iconSize} className={iconOnly || !children ? '' : 'flex-shrink-0'} />
      }
      {!iconOnly && children}
    </button>
  )
}

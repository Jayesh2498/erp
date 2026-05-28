/**
 * Snow Glass Design Token System
 * ================================
 * Single source of truth for ALL design values.
 * All tokens map to CSS variables defined in src/index.css.
 * Components ONLY reference these tokens — never hardcode colors or rgba values.
 *
 * DARK MODE: The theme toggle switches CSS variables on <html>.
 * All token values adapt automatically — no per-component theme logic needed.
 *
 * USAGE:
 *   import { tokens, glassStyle, shineStyle, aboveShine } from '@/components/ui-kit/tokens'
 *   style={{ color: tokens.color.text1 }}
 *   style={{ boxShadow: tokens.shadow.md }}
 */
import type { CSSProperties } from 'react'

export const tokens = {
  /* ── Color references (via CSS variables) ─────────────────── */
  color: {
    page:         'rgb(var(--bg-page))',
    text1:        'rgb(var(--text-1))',
    text2:        'rgb(var(--text-2))',
    text3:        'rgb(var(--text-3))',
    textInverse:  'rgb(var(--text-inverse))',
    sunsetCoral:  'rgb(var(--sunset-coral))',
    sunsetOrange: 'rgb(var(--sunset-orange))',
    sunsetGold:   'rgb(var(--sunset-gold))',
    success:      'rgb(var(--color-success))',
    warning:      'rgb(var(--color-warning))',
    danger:       'rgb(var(--color-danger))',
    info:         'rgb(var(--color-info))',
  },

  /* ── Glass surfaces ────────────────────────────────────────── */
  glass: {
    bg:               'var(--glass-bg)',
    border:           'var(--glass-border)',
    borderHover:      'var(--glass-border-hover)',
    blur:             'var(--glass-blur)',
    shineStart:       'var(--glass-shine-start)',
    shineEnd:         'var(--glass-shine-end)',
    sidebarBg:        'var(--sidebar-bg)',
    sidebarBlur:      'var(--sidebar-blur)',
    sidebarBorder:    'var(--sidebar-border)',
    inputBg:          'var(--input-bg)',
    inputBorder:      'var(--input-border)',
    inputFocusBorder: 'var(--input-focus-border)',
    inputFocusShadow: 'var(--input-focus-shadow)',
  },

  /* ── Semantic surface tokens (keeps rgba out of components) ── */
  surface: {
    /** Dark overlay for modal/drawer backdrops */
    modalBackdrop:      'var(--modal-backdrop)',
    /** Semi-transparent danger tint — icon bubbles, ConfirmModal */
    dangerTint:         'var(--surface-danger-tint)',
    dangerTintBorder:   'var(--surface-danger-tint-border)',
    /** Semi-transparent success tint */
    successTint:        'var(--surface-success-tint)',
    successTintBorder:  'var(--surface-success-tint-border)',
    /** Warm sunset icon bubble bg (used in StatCard, ActivityRow) */
    iconBubble:         'var(--surface-icon-bubble)',
    /** Mobile sidebar backdrop */
    mobileBackdrop:     'var(--mobile-backdrop)',
  },

  /* ── Button variant surfaces ─────────────────────────────────
     Keeps hex gradients and rgba shadows out of GlassButton     */
  button: {
    dangerBg:           'var(--btn-danger-bg)',
    dangerShadow:       'var(--btn-danger-shadow)',
    dangerHoverShadow:  'var(--btn-danger-hover-shadow)',
    primaryHoverShadow: 'var(--btn-primary-hover-shadow)',
  },

  /* ── Toast accent borders ────────────────────────────────────
     Each toast variant has a coloured left border              */
  toast: {
    successAccent: 'var(--toast-success-accent)',
    errorAccent:   'var(--toast-error-accent)',
    warningAccent: 'var(--toast-warning-accent)',
    infoAccent:    'var(--toast-info-accent)',
  },

  /* ── Input focus error ring ──────────────────────────────────*/
  input: {
    errorShadow: 'var(--input-error-shadow)',
  },

  /* ── Shadows ───────────────────────────────────────────────── */
  shadow: {
    sm:     'var(--shadow-sm)',
    md:     'var(--shadow-md)',
    lg:     'var(--shadow-lg)',
    hover:  'var(--shadow-hover)',
    sunset: 'var(--shadow-sunset)',
  },

  /* ── Border radius ─────────────────────────────────────────── */
  radius: {
    sm:   'var(--radius-sm)',    // 12px — inputs, rows, chips
    md:   'var(--radius-md)',    // 18px — standard cards
    lg:   'var(--radius-lg)',    // 22px — large cards, modals
    pill: 'var(--radius-pill)',  // 999px — buttons, badges, avatars
  },

  /* ── Gradients ─────────────────────────────────────────────── */
  gradient: {
    sunset:  'var(--gradient-sunset)',   // 135deg coral→orange→gold
    sunsetH: 'var(--gradient-sunset-h)', // 90deg with fade (accent bars, stat top lines)
    danger:  'var(--gradient-danger)',   // danger button background
  },

  /* ── Notification dot ───────────────────────────────────────── */
  notif: {
    dotColor:  'var(--notif-dot-color)',
    dotShadow: 'var(--notif-dot-shadow)',
    avatarHoverShadow: 'var(--notif-avatar-hover-shadow)',
  },

  /* ── Activity dot colors (semantic data colours) ────────────── */
  dot: {
    success: 'var(--dot-success)',
    orange:  'var(--dot-orange)',
    danger:  'var(--dot-danger)',
    warning: 'var(--dot-warning)',
    info:    'var(--dot-info)',
  },

  /* ── Transitions ────────────────────────────────────────────── */
  /* ── Transitions ────────────────────────────────────────────── */
  transition: {
    fast:  '0.15s ease',
    base:  '0.18s ease',
    theme: '0.35s ease',   /* matches --transition-theme in index.css */
  },
} as const

/* ── Shared inline style factories ────────────────────────────
   Returns a CSSProperties object — spread onto style props.
   These are the pre-baked glass style recipes used inside components. */

export const glassStyle = {
  /** Standard card/panel — radius-md, shadow-md */
  panel: {
    position: 'relative' as const,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden' as const,
    boxShadow: 'var(--shadow-md)',
    isolation: 'isolate' as const,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
  } satisfies CSSProperties,

  /** Large card / modal — radius-lg, shadow-lg */
  panelLg: {
    position: 'relative' as const,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden' as const,
    boxShadow: 'var(--shadow-lg)',
    isolation: 'isolate' as const,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
  } satisfies CSSProperties,

  /** Row item — no backdrop-filter (parent glass card handles blur) */
  row: {
    position: 'relative' as const,
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden' as const,
    boxShadow: 'var(--shadow-sm)',
    isolation: 'isolate' as const,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  } satisfies CSSProperties,

  /** Form input */
  input: {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-sm)',
    outline: 'none' as const,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  } satisfies CSSProperties,

  /** Pill-shaped container (search, badge, avatar ring) */
  pill: {
    position: 'relative' as const,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden' as const,
    boxShadow: 'var(--shadow-sm)',
  } satisfies CSSProperties,

  /** Primary action button */
  buttonPrimary: {
    background: 'var(--gradient-sunset)',
    border: 'none' as const,
    borderRadius: 'var(--radius-pill)',
    boxShadow: 'var(--shadow-sunset)',
    color: 'white',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
  } satisfies CSSProperties,

  /** Secondary button */
  buttonSecondary: {
    position: 'relative' as const,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-pill)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  } satisfies CSSProperties,
}

/** Shine overlay div style — top N% frosted gradient.
 *  Always use with aria-hidden. Never use inset:0 (it sets bottom:0 and kills height). */
export const shineStyle = (heightPct = 40): CSSProperties => ({
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: `${heightPct}%`,
  background: `linear-gradient(180deg, var(--glass-shine-start), var(--glass-shine-end))`,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  zIndex: 0,
})

/** Apply to content wrappers that must sit above the shine overlay */
export const aboveShine: CSSProperties = { position: 'relative', zIndex: 1 }

/**
 * GlassToast — notification toasts with left accent border
 * ==========================================================
 * Left border: coloured semantic accent from CSS token.
 * Background: glass panel. Auto-dismisses after 4 seconds.
 * Stacks in bottom-right corner.
 * All colors from CSS token variables — no hardcoded rgba values.
 *
 * USAGE:
 *   const toast = useToast()
 *   toast.success('Invoice saved successfully')
 *   toast.error('Failed to save — please try again')
 *   toast.warning('Stock running low for SKU-4421')
 *   toast.info('Sync started in background')
 *
 * SETUP: <ToastProvider> wraps the app in App.tsx (already done).
 */
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { tokens } from './tokens'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  variant: ToastVariant
  message: string
}

const ToastContext = createContext<{
  addToast: (variant: ToastVariant, message: string) => void
} | null>(null)

/* Variant config — accents and icons from token variables */
const variantConfig: Record<ToastVariant, {
  icon: React.ElementType
  accent: string      // left border color — token reference
  iconColor: string   // icon fill — token reference
}> = {
  success: { icon: CheckCircle2, accent: tokens.toast.successAccent, iconColor: tokens.color.success },
  error:   { icon: XCircle,      accent: tokens.toast.errorAccent,   iconColor: tokens.color.danger  },
  warning: { icon: AlertTriangle,accent: tokens.toast.warningAccent, iconColor: tokens.color.warning },
  info:    { icon: Info,         accent: tokens.toast.infoAccent,    iconColor: tokens.color.info    },
}

/* ── Single toast item ────────────────────────────────────────── */
function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const cfg = variantConfig[item.variant]
  const Icon = cfg.icon

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(item.id), 300)
    }, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [item.id, onDismiss])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(item.id), 300)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        minWidth: 280,
        maxWidth: 380,
        background: tokens.glass.bg,
        backdropFilter: tokens.glass.blur,
        WebkitBackdropFilter: tokens.glass.blur,
        border: `1px solid ${tokens.glass.border}`,
        /* borderLeft overrides the left side with the accent color */
        borderLeft: `3px solid ${cfg.accent}`,
        borderRadius: tokens.radius.md,
        boxShadow: tokens.shadow.lg,
        isolation: 'isolate',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(24px)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}
    >
      <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }} />
      <p className="flex-1 text-sm font-medium leading-snug" style={{ color: tokens.color.text1 }}>
        {item.message}
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 transition-colors duration-150"
        style={{ color: tokens.color.text3 }}
        onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text1 }}
        onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

/* ── ToastProvider ────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((variant: ToastVariant, message: string) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, variant, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Stack — bottom-right, grows upward */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(item => (
          <div key={item.id} style={{ pointerEvents: 'all' }}>
            <Toast item={item} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ── Hook ─────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  const { addToast } = ctx
  return {
    success: (msg: string) => addToast('success', msg),
    error:   (msg: string) => addToast('error',   msg),
    warning: (msg: string) => addToast('warning', msg),
    info:    (msg: string) => addToast('info',    msg),
  }
}

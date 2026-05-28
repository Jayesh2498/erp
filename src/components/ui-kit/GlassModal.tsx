/**
 * GlassModal — overlay with glass card body
 * ===========================================
 * Backdrop: dark blur overlay using --modal-backdrop token.
 * Body: glass-lg panel with title, content, and action footer.
 * ESC key closes. Clicking backdrop closes.
 * All colors from CSS tokens — no hardcoded rgba values.
 *
 * USAGE:
 *   <GlassModal open={open} onClose={() => setOpen(false)} title="Edit Contact">
 *     <GlassInput label="Name" value={name} onChange={setName} />
 *   </GlassModal>
 *
 *   <GlassModal open={open} onClose={onClose} title="Invoice Details"
 *     footer={
 *       <>
 *         <GlassButton variant="secondary" onClick={onClose}>Cancel</GlassButton>
 *         <GlassButton variant="primary" onClick={onSave}>Save</GlassButton>
 *       </>
 *     }
 *   >
 *     ...content...
 *   </GlassModal>
 */
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens, shineStyle, aboveShine } from './tokens'

interface GlassModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
  persistent?: boolean
}

export function GlassModal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  persistent = false,
}: GlassModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !persistent) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, persistent])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: tokens.surface.modalBackdrop,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget && !persistent) onClose() }}
    >
      <div
        className={cn('w-full animate-scale-in', maxWidth)}
        style={{
          position: 'relative',
          background: tokens.glass.bg,
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          border: `1px solid ${tokens.glass.border}`,
          borderRadius: tokens.radius.lg,
          overflow: 'hidden',
          boxShadow: tokens.shadow.lg,
          isolation: 'isolate',
        }}
      >
        <div aria-hidden style={shineStyle(36)} />

        <div style={aboveShine}>
          {title && (
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: tokens.glass.border }}
            >
              <h2 className="text-base font-semibold" style={{ color: tokens.color.text1 }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                style={{ color: tokens.color.text3 }}
                onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text1; e.currentTarget.style.background = tokens.glass.bg }}
                onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3; e.currentTarget.style.background = 'transparent' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="px-6 py-5">{children}</div>

          {footer && (
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: tokens.glass.border }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ConfirmModal — extends GlassModal for destructive confirmations
 * ================================================================
 * All colors from CSS token variables — no hardcoded rgba values.
 *
 * USAGE:
 *   <ConfirmModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Contact"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"
 *     confirmVariant="danger"
 *   />
 */
import { Trash2, CheckCircle } from 'lucide-react'
import { GlassModal } from './GlassModal'
import { GlassButton, ButtonVariant } from './GlassButton'
import { tokens } from './tokens'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonVariant
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const isDanger = confirmVariant === 'danger'
  const Icon = isDanger ? Trash2 : CheckCircle

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <GlassButton variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </GlassButton>
          <GlassButton variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </GlassButton>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 pb-1">
        {/* Icon bubble — tinted background from token, no hardcoded rgba */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: isDanger ? tokens.surface.dangerTint : tokens.surface.successTint,
            border: `1px solid ${isDanger ? tokens.surface.dangerTintBorder : tokens.surface.successTintBorder}`,
          }}
        >
          <Icon
            size={24}
            style={{ color: isDanger ? tokens.color.danger : tokens.color.success }}
          />
        </div>
        <h3 className="text-base font-bold" style={{ color: tokens.color.text1 }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: tokens.color.text2 }}>
          {message}
        </p>
      </div>
    </GlassModal>
  )
}

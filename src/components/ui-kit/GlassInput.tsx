/**
 * GlassInput — all input variants with glass styling
 * =====================================================
 * Clean glass background, warm border, orange glow on focus.
 * NO heavy inset/clay shadows. All colors from token variables.
 *
 * USAGE:
 *   <GlassInput label="Email" type="email" value={email} onChange={setEmail} />
 *   <GlassInput label="Amount" type="number" prefix="₹" />
 *   <GlassInput label="Password" type="password" />
 *   <GlassInput label="Notes" as="textarea" rows={4} />
 *   <GlassInput label="Date" type="date" />
 *   <GlassInput placeholder="Search…" icon={Search} />
 */
import React, { useState, useId } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

interface GlassInputProps {
  label?: string
  error?: string
  hint?: string
  icon?: React.ElementType
  prefix?: string
  suffix?: string
  as?: 'input' | 'textarea'
  rows?: number
  type?: React.HTMLInputTypeAttribute
  value?: string | number
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  autoFocus?: boolean
  id?: string
  name?: string
  min?: number | string
  max?: number | string
  step?: number | string
  className?: string
  inputClassName?: string
  readOnly?: boolean
}

export function GlassInput({
  label, error, hint, icon: Icon, prefix, suffix,
  as = 'input', rows = 3, type = 'text',
  value, onChange, onBlur, placeholder, required, disabled,
  autoComplete, autoFocus, id: idProp, name,
  min, max, step, className, inputClassName, readOnly,
}: GlassInputProps) {
  const [showPwd, setShowPwd] = useState(false)
  const autoId = useId()
  const id = idProp ?? autoId
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPwd ? 'text' : 'password') : type

  const inputStyle: React.CSSProperties = {
    background: tokens.glass.inputBg,
    border: `1px solid ${error ? tokens.color.danger : tokens.glass.inputBorder}`,
    borderRadius: tokens.radius.sm,
    outline: 'none',
    color: tokens.color.text1,
    width: '100%',
    transition: `border-color ${tokens.transition.fast}, box-shadow ${tokens.transition.fast}`,
  }

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = error ? tokens.color.danger : tokens.glass.inputFocusBorder
    e.currentTarget.style.boxShadow = error
      ? `0 0 0 3px ${tokens.input.errorShadow}`
      : `0 0 0 3px ${tokens.glass.inputFocusShadow}`
  }
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = error ? tokens.color.danger : tokens.glass.inputBorder
    e.currentTarget.style.boxShadow = ''
    onBlur?.()
  }

  const sharedProps = {
    id, name, value, placeholder, required, disabled,
    readOnly, autoComplete, autoFocus,
    style: { ...inputStyle },
    onFocus: handleFocus,
    onBlur: handleBlur,
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: tokens.color.text2 }}>
          {label}
          {required && <span style={{ color: tokens.color.danger, marginLeft: 3 }}>*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: tokens.color.text3 }}
          />
        )}
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none"
            style={{ color: tokens.color.text3 }}>
            {prefix}
          </span>
        )}

        {as === 'textarea' ? (
          <textarea
            {...sharedProps} rows={rows}
            onChange={e => onChange?.(e.target.value)}
            className={cn('px-4 py-3 text-sm resize-none',
              Icon && 'pl-9', prefix && 'pl-8', suffix && 'pr-10', inputClassName)}
          />
        ) : (
          <input
            {...sharedProps} type={resolvedType} min={min} max={max} step={step}
            onChange={e => onChange?.(e.target.value)}
            className={cn('px-4 py-3 text-sm',
              Icon && 'pl-9', prefix && 'pl-8',
              (suffix || isPassword) && 'pr-10', inputClassName)}
          />
        )}

        {suffix && !isPassword && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none"
            style={{ color: tokens.color.text3 }}>
            {suffix}
          </span>
        )}
        {isPassword && (
          <button type="button" tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
            style={{ color: tokens.color.text3 }}
            onClick={() => setShowPwd(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text2 }}
            onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium animate-fade-in" style={{ color: tokens.color.danger }}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs" style={{ color: tokens.color.text3 }}>{hint}</p>
      )}
    </div>
  )
}

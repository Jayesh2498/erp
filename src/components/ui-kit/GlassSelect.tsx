/**
 * GlassSelect — dropdown with glass styling
 * ============================================
 * Matches GlassInput visually — warm glass bg, warm border, orange focus glow.
 *
 * USAGE:
 *   <GlassSelect label="Status" value={status} onChange={setStatus}
 *     options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
 *   />
 *   <GlassSelect label="Type" placeholder="Select type…" options={typeOptions} />
 */
import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface GlassSelectProps {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  className?: string
}

export function GlassSelect({
  label,
  error,
  hint,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  required,
  disabled,
  id: idProp,
  name,
  className,
}: GlassSelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium"
          style={{ color: tokens.color.text2 }}
        >
          {label}
          {required && <span style={{ color: tokens.color.danger, marginLeft: 3 }}>*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          onChange={e => onChange?.(e.target.value)}
          className="w-full appearance-none px-4 py-3 pr-9 text-sm cursor-pointer"
          style={{
            background: tokens.glass.inputBg,
            border: `1px solid ${error ? tokens.color.danger : tokens.glass.inputBorder}`,
            borderRadius: tokens.radius.sm,
            outline: 'none',
            color: value ? tokens.color.text1 : tokens.color.text3,
            transition: `border-color ${tokens.transition.fast}, box-shadow ${tokens.transition.fast}`,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = tokens.glass.inputFocusBorder
            e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.glass.inputFocusShadow}`
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? tokens.color.danger : tokens.glass.inputBorder
            e.currentTarget.style.boxShadow = ''
          }}
        >
          <option value="" disabled style={{ color: tokens.color.text3 }}>
            {placeholder}
          </option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: tokens.color.text3 }}
        />
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

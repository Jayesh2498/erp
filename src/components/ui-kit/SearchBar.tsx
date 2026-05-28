/**
 * SearchBar — global search pill with Ctrl+K shortcut
 * =====================================================
 * Pill-shaped glass input with search icon, Ctrl+K hint, and debounced onChange.
 * Results dropdown can be provided via the `results` prop.
 *
 * USAGE:
 *   <SearchBar value={q} onChange={setQ} placeholder="Search contacts…" />
 *   <SearchBar onSearch={handleSearch} debounce={300} />
 *   <SearchBar compact />   ← smaller size for table filter bars
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  /** Called after debounce delay (ms). Default: 300ms */
  onSearch?: (value: string) => void
  debounce?: number
  placeholder?: string
  compact?: boolean
  className?: string
  /** Show Ctrl+K hint (shown only when empty) */
  showShortcut?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  debounce: debounceMs = 300,
  placeholder = 'Search…',
  compact = false,
  className,
  showShortcut = true,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (controlledValue === undefined) setInternalValue(v)
    onChange?.(v)
    if (onSearch) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onSearch(v), debounceMs)
    }
  }, [controlledValue, onChange, onSearch, debounceMs])

  const handleClear = () => {
    if (controlledValue === undefined) setInternalValue('')
    onChange?.('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  // Ctrl+K / Cmd+K focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'px-3 py-2' : 'px-4 py-2.5',
        className,
      )}
      style={{
        position: 'relative',
        background: tokens.glass.inputBg,
        border: `1px solid ${tokens.glass.inputBorder}`,
        borderRadius: tokens.radius.pill,
        boxShadow: tokens.shadow.sm,
        transition: `border-color ${tokens.transition.fast}, box-shadow ${tokens.transition.fast}`,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={compact ? 12 : 13} style={{ color: tokens.color.text3, flexShrink: 0 }} />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn('flex-1 bg-transparent outline-none border-none', compact ? 'text-xs' : 'text-sm')}
        style={{ color: tokens.color.text1, minWidth: 0 }}
        onFocus={e => {
          const parent = e.currentTarget.closest('[style]') as HTMLElement
          if (parent) {
            parent.style.borderColor = tokens.glass.inputFocusBorder
            parent.style.boxShadow = `0 0 0 3px ${tokens.glass.inputFocusShadow}`
          }
        }}
        onBlur={e => {
          const parent = e.currentTarget.closest('[style]') as HTMLElement
          if (parent) {
            parent.style.borderColor = tokens.glass.inputBorder
            parent.style.boxShadow = tokens.shadow.sm
          }
        }}
      />

      {/* Clear button (visible when value exists) */}
      {value && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); handleClear() }}
          className="flex-shrink-0 transition-colors duration-150"
          style={{ color: tokens.color.text3 }}
          onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text1 }}
          onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
        >
          <X size={12} />
        </button>
      )}

      {/* Ctrl+K hint (shown when empty + not compact) */}
      {!value && showShortcut && !compact && (
        <kbd
          className="flex-shrink-0 text-xs hidden lg:block select-none"
          style={{ color: tokens.color.text3, opacity: 0.6 }}
        >
          ⌘K
        </kbd>
      )}
    </div>
  )
}

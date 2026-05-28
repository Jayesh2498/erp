/**
 * Atomic display components
 * ==========================
 * Small reusable primitives used throughout all pages.
 *
 * ActivityDot — coloured status dot with matching glow
 *   <ActivityDot color="#22C55E" />
 *   <ActivityDot color={tokens.color.sunsetOrange} size={10} />
 *
 * SunsetGradientText — text rendered with sunset gradient via background-clip
 *   <SunsetGradientText>View all</SunsetGradientText>
 *   <SunsetGradientText className="text-xl font-bold">ERP</SunsetGradientText>
 *
 * Sparkline — mini bar chart for stat cards and trend indicators
 *   <Sparkline values={[42,55,49,60,72,80]} positive />
 *   <Sparkline values={[80,72,65,60]} positive={false} />
 *
 * GlassCheckbox — design-system checkbox
 *   <GlassCheckbox checked={val} onChange={setVal} label="Set as default" />
 *   <GlassCheckbox checked={val} onChange={setVal} /> (no label — icon-only)
 */
import React from 'react'
import { tokens } from './tokens'

/* ── ActivityDot ─────────────────────────────────────────────── */
interface ActivityDotProps {
  color: string
  size?: number
  className?: string
}

export function ActivityDot({ color, size = 8, className }: ActivityDotProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size}px ${color}66`,
        flexShrink: 0,
      }}
    />
  )
}

/* ── SunsetGradientText ──────────────────────────────────────── */
interface SunsetGradientTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  as?: keyof JSX.IntrinsicElements
}

export function SunsetGradientText({ children, className, style, as: Tag = 'span' }: SunsetGradientTextProps) {
  return (
    <Tag
      className={className}
      style={{
        background: 'var(--gradient-sunset)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

/* ── Sparkline ───────────────────────────────────────────────── */
interface SparklineProps {
  values: number[]
  positive?: boolean
  height?: number
  width?: number
  barWidth?: number
  gap?: number
}

export function Sparkline({
  values,
  positive = true,
  height = 28,
  width = 52,
  barWidth = 5,
  gap = 3,
}: SparklineProps) {
  const max = Math.max(...values)
  const baseColor = positive ? '255,107,107' : '239,68,68'

  return (
    <div
      className="flex items-end"
      style={{ height, width, gap, flexShrink: 0 }}
    >
      {values.map((v, i) => {
        const opacity = 0.25 + (i / Math.max(values.length - 1, 1)) * 0.75
        const h = Math.max(3, Math.round((v / max) * height))
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: h,
              borderRadius: 3,
              background: `rgba(${baseColor},${opacity})`,
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}

/* ── GlassCheckbox ───────────────────────────────────────────── */
/**
 * Accessible, design-system checkbox.
 * Uses a hidden native <input> for keyboard/screen-reader support and
 * a visible styled box that reflects the checked state via tokens.
 *
 * Checked  — sunset-gradient fill + white SVG checkmark
 * Unchecked — transparent fill with input-border ring
 * Hover     — input-focus-border ring brightens
 */
interface GlassCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function GlassCheckbox({ checked, onChange, label, disabled = false, className }: GlassCheckboxProps) {
  const id = React.useId()

  return (
    <label
      htmlFor={id}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Hidden native input for a11y */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        tabIndex={-1}
      />

      {/* Visible styled box */}
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => {
          if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault()
            onChange(!checked)
          }
        }}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: 17,
          height: 17,
          borderRadius: tokens.radius.sm,
          border: checked ? 'none' : `1.5px solid ${tokens.glass.inputBorder}`,
          background: checked ? 'var(--gradient-sunset)' : tokens.glass.inputBg,
          boxShadow: checked ? 'var(--shadow-sunset)' : 'none',
          transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          outline: 'none',
        }}
        onFocus={e => {
          if (!checked) {
            (e.currentTarget as HTMLSpanElement).style.borderColor = tokens.glass.inputFocusBorder
          }
        }}
        onBlur={e => {
          if (!checked) {
            (e.currentTarget as HTMLSpanElement).style.borderColor = tokens.glass.inputBorder
          }
        }}
      >
        {checked && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M1 3.5L3.8 6.5L9 1"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Optional label text */}
      {label && (
        <span style={{ fontSize: 14, color: tokens.color.text2, lineHeight: 1.4 }}>
          {label}
        </span>
      )}
    </label>
  )
}

/**
 * StatCard — glass card for summary metrics
 * ==========================================
 * Extends GlassCard with:
 *  - 3px sunset gradient top bar
 *  - Icon bubble (top-right)
 *  - Formatted primary value
 *  - Trend indicator (up/down/neutral) + sparkline bars
 *
 * USAGE:
 *   <StatCard
 *     label="Total Revenue"
 *     value={formatCurrency(1245000)}
 *     change="+12.4%"
 *     changeType="up"
 *     icon={TrendingUp}
 *     sparklineData={[42,55,49,60,58,72,80]}
 *   />
 *   <StatCard label="Pending Bills" value="₹3,40,000" change="−5 bills" changeType="down" />
 *   <StatCard label="SKUs" value="1,092" changeType="neutral" />
 */
import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { tokens, shineStyle } from './tokens'
import { Sparkline } from './atoms'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon?: React.ElementType
  sparklineData?: number[]
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  sparklineData,
  className = '',
}: StatCardProps) {
  const trendColor =
    changeType === 'up'   ? tokens.color.success :
    changeType === 'down' ? tokens.color.danger   :
                            tokens.color.text3

  const TrendIcon =
    changeType === 'up'   ? TrendingUp   :
    changeType === 'down' ? TrendingDown :
                            Minus

  return (
    <div
      className={`overflow-hidden flex flex-col ${className}`}
      style={{
        position: 'relative',
        background: tokens.glass.bg,
        backdropFilter: tokens.glass.blur,
        WebkitBackdropFilter: tokens.glass.blur,
        border: `1px solid ${tokens.glass.border}`,
        borderRadius: tokens.radius.lg,
        boxShadow: tokens.shadow.lg,
        isolation: 'isolate',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = tokens.shadow.hover
        el.style.borderColor = tokens.glass.borderHover
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = tokens.shadow.lg
        el.style.borderColor = tokens.glass.border
      }}
    >
      {/* 3px sunset top bar — clipped by parent overflow:hidden */}
      <div
        style={{
          height: 3,
          background: tokens.gradient.sunsetH,
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
        }}
      />

      {/* Frosted shine — z:1, top 40% only */}
      <div aria-hidden style={{ ...shineStyle(40), zIndex: 1 }} />

      {/* Card content — z:2 above shine */}
      <div className="p-5 flex flex-col gap-3 flex-1" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header: label + icon */}
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: tokens.color.text3 }}
          >
            {label}
          </p>
          {Icon && (
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{
                background: tokens.surface.iconBubble,
                borderRadius: tokens.radius.sm,
              }}
            >
              <Icon size={14} style={{ color: tokens.color.sunsetOrange }} />
            </div>
          )}
        </div>

        {/* Primary value */}
        <p
          className="text-2xl font-bold leading-none"
          style={{ color: tokens.color.text1 }}
        >
          {value}
        </p>

        {/* Footer: trend + sparkline */}
        {(change || sparklineData) && (
          <div className="flex items-end justify-between mt-auto">
            {change && (
              <div className="flex items-center gap-1.5">
                <TrendIcon size={12} style={{ color: trendColor }} />
                <span className="text-xs font-bold" style={{ color: trendColor }}>
                  {change}
                </span>
                <span className="text-xs" style={{ color: tokens.color.text3 }}>
                  vs last month
                </span>
              </div>
            )}
            {sparklineData && (
              <Sparkline
                values={sparklineData}
                positive={changeType !== 'down'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

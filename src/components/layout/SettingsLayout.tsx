/**
 * Settings layout — shared settings sub-nav + admin-only guard
 *
 * Non-admin users who navigate directly to any /settings/* route are
 * redirected silently to /dashboard. The sidebar already hides the
 * Settings link for non-admins, so this is a belt-and-suspenders guard.
 */
import React from 'react'
import { NavLink, useLocation, Navigate } from 'react-router-dom'
import { Building2, Users, Shield, Bell } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { tokens } from '@/components/ui-kit/tokens'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  { key: 'company',       label: 'Company Profile', href: '/settings',               icon: Building2 },
  { key: 'users',         label: 'Users & Roles',   href: '/settings/users',          icon: Users },
  { key: 'tds',           label: 'TDS Rates',        href: '/settings/tds',            icon: Shield },
  { key: 'notifications', label: 'Notifications',    href: '/settings/notifications',  icon: Bell },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // While auth is still loading, render nothing (avoids flash-redirect)
  if (isLoading) return null

  // Non-admin → redirect to dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex gap-6 max-w-screen-xl mx-auto animate-fade-in">
      {/* Settings sub-nav */}
      <aside
        className="flex-shrink-0 w-52"
        style={{
          background: tokens.glass.bg,
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          border: `1px solid ${tokens.glass.border}`,
          borderRadius: tokens.radius.md,
          boxShadow: tokens.shadow.sm,
          padding: '12px 8px',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 24,
        }}
      >
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: tokens.color.text3 }}>
          Settings
        </p>
        <nav className="space-y-0.5">
          {SETTINGS_NAV.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.href ||
              location.pathname.startsWith(item.href + '/')
            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium',
                  'transition-all duration-150 select-none',
                )}
                style={isActive ? {
                  background: 'var(--gradient-sunset)',
                  boxShadow: 'var(--shadow-sunset)',
                  color: 'white',
                } : { color: tokens.color.text2 }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = tokens.glass.bg
                    e.currentTarget.style.color = tokens.color.text1
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.color = tokens.color.text2
                  }
                }}
              >
                <Icon size={15} style={{ color: isActive ? 'white' : tokens.color.text3, flexShrink: 0 }} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

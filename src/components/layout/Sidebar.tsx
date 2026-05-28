import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, ChevronDown } from 'lucide-react'
import { useSidebar } from '@/providers/SidebarProvider'
import { useAuth } from '@/providers/AuthProvider'
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation'
import type { NavItem } from '@/config/navigation'
import { cn } from '@/lib/utils'

/* ── Collapsed tooltip ──────────────────────────────────────── */
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div
        className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[9999]
          px-3 py-1.5 text-xs font-semibold whitespace-nowrap
          opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100
          glass-sm transition-all duration-150"
        style={{ color: 'rgb(var(--text-1))' }}
      >
        {label}
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
          style={{ borderRightColor: 'var(--glass-border)' }}
        />
      </div>
    </div>
  )
}

/* ── Leaf nav item (no children) ────────────────────────────── */
function LeafNavItem({ item, collapsed, depth = 0, onNavigate }: {
  item: NavItem
  collapsed: boolean
  depth?: number
  onNavigate: () => void
}) {
  const location = useLocation()
  const isActive =
    location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href + '/'))
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center rounded-sm text-sm font-medium transition-all duration-150 select-none',
        collapsed ? 'justify-center p-2.5' : 'gap-3 py-2 px-3',
        depth > 0 && !collapsed ? 'pl-8 py-1.5 text-xs' : '',
        isActive ? 'text-white' : '',
      )}
      style={isActive ? {
        background: 'var(--gradient-sunset)',
        boxShadow: 'var(--shadow-sunset)',
      } : {
        color: 'rgb(var(--text-2))',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--glass-bg)'
          e.currentTarget.style.color = 'rgb(var(--text-1))'
          e.currentTarget.style.transform = 'translateX(2px)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = ''
          e.currentTarget.style.color = 'rgb(var(--text-2))'
          e.currentTarget.style.transform = ''
        }
      }}
    >
      <Icon size={depth > 0 ? 14 : 17} className="flex-shrink-0"
        style={{ color: isActive ? 'white' : 'rgb(var(--text-3))' }} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )

  return collapsed ? (
    <NavTooltip label={item.label}>{link}</NavTooltip>
  ) : link
}

/* ── Group nav item (has children) ─────────────────────────── */
function GroupNavItem({ item, collapsed, onNavigate }: {
  item: NavItem
  collapsed: boolean
  onNavigate: () => void
}) {
  const location = useLocation()
  const isGroupActive = item.children?.some(child =>
    location.pathname === child.href ||
    location.pathname.startsWith(child.href + '/')
  )
  const [open, setOpen] = useState(isGroupActive ?? false)
  const Icon = item.icon

  // Collapsed: show tooltip on parent icon — clicking does nothing
  if (collapsed) {
    return (
      <NavTooltip label={item.label}>
        <button
          className="w-full flex justify-center items-center p-2.5 rounded-sm transition-all duration-150 select-none"
          style={{ color: isGroupActive ? 'rgb(var(--sunset-coral))' : 'rgb(var(--text-3))' }}
          onClick={() => setOpen(v => !v)}
        >
          <Icon size={17} />
        </button>
      </NavTooltip>
    )
  }

  return (
    <div>
      {/* Parent row */}
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium
          transition-all duration-150 select-none"
        style={{ color: isGroupActive ? 'rgb(var(--sunset-coral))' : 'rgb(var(--text-2))' }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '' }}
      >
        <Icon size={17} className="flex-shrink-0"
          style={{ color: isGroupActive ? 'rgb(var(--sunset-coral))' : 'rgb(var(--text-3))' }} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          size={13}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'rgb(var(--text-3))',
          }}
        />
      </button>

      {/* Children */}
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {item.children?.map(child => (
            <LeafNavItem
              key={child.key}
              item={child}
              collapsed={false}
              depth={1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────────────────── */
export default function Sidebar() {
  const { collapsed, toggle, setMobileOpen, mobileOpen } = useSidebar()
  const { user, workspace, logout } = useAuth()

  const visibleMain = NAV_ITEMS
  const visibleBottom = BOTTOM_NAV_ITEMS.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role))
  )

  const renderItem = (item: NavItem) =>
    item.children?.length ? (
      <GroupNavItem key={item.key} item={item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
    ) : (
      <LeafNavItem key={item.key} item={item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
    )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'var(--mobile-backdrop)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full flex flex-col',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:flex-shrink-0',
          'transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[64px]' : 'w-[220px]',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{
          position: 'relative',
          background: 'var(--sidebar-bg)',
          backdropFilter: 'var(--sidebar-blur)',
          WebkitBackdropFilter: 'var(--sidebar-blur)',
          borderRight: '1px solid var(--sidebar-border)',
          borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
          isolation: 'isolate',
        }}
      >
        {/* Warm shine overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: 'var(--sidebar-shine)', pointerEvents: 'none',
            borderRadius: 'inherit', zIndex: 0,
          }}
        />

        {/* User / workspace header */}
        <div
          className={cn(
            'flex items-center gap-3 py-5 border-b',
            collapsed ? 'justify-center px-2' : 'px-4',
          )}
          style={{ borderColor: 'var(--sidebar-border)', position: 'relative', zIndex: 1 }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-pill flex items-center justify-center text-sm font-bold text-white select-none"
            style={{ background: 'var(--gradient-sunset)', boxShadow: 'var(--shadow-sunset)' }}
          >
            {user?.avatarInitials ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in overflow-hidden">
              <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'rgb(var(--text-1))' }}>
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: 'rgb(var(--text-3))' }}>
                {workspace?.name ?? 'Workspace'}
              </p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {visibleMain.map(renderItem)}
        </nav>

        {/* Footer */}
        <div
          className="p-2 border-t space-y-0.5"
          style={{ borderColor: 'var(--sidebar-border)', position: 'relative', zIndex: 1 }}
        >
          {/* Bottom pinned items (Settings — admin only) */}
          {visibleBottom.map(renderItem)}

          {/* Logout */}
          {collapsed ? (
            <NavTooltip label="Logout">
              <button
                className="w-full flex justify-center items-center p-2.5 rounded-sm transition-all duration-150"
                style={{ color: 'rgb(var(--text-3))' }}
                onClick={logout}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--color-danger))' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-3))' }}
              >
                <LogOut size={16} />
              </button>
            </NavTooltip>
          ) : (
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-150"
              style={{ color: 'rgb(var(--text-3))' }}
              onClick={logout}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--color-danger))' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-3))' }}
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          )}

          {/* Collapse toggle */}
          <button
            className="w-full flex items-center justify-center p-2 rounded-sm transition-all duration-150"
            style={{ color: 'rgb(var(--text-3))' }}
            onClick={toggle}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--text-1))' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-3))' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={15} />
              : <span className="flex items-center gap-1.5 text-xs font-medium"><ChevronLeft size={15} /> Collapse</span>
            }
          </button>
        </div>
      </aside>
    </>
  )
}

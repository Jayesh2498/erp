import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sun, Moon, Search, Menu } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useSidebar } from '@/providers/SidebarProvider'
import { NAV_ITEMS } from '@/config/navigation'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'
import { GlobalSearch } from '@/components/GlobalSearch'

function usePageTitle(): string {
  const { pathname } = useLocation()
  return NAV_ITEMS.find(n => pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href)))?.label ?? 'Dashboard'
}

/* ── Glass icon button ──────────────────────────────────────── */
function GlassBtn({ onClick, label, children, className = '' }: {
  onClick?: () => void
  label?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative w-10 h-10 rounded-pill flex items-center justify-center glass-pill transition-all duration-150 select-none ${className}`}
      style={{ color: 'rgb(var(--text-2))' }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'rgb(var(--text-1))'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'rgb(var(--text-2))'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)'; e.currentTarget.style.opacity = '0.8' }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

/* ── Navbar ──────────────────────────────────────────────────── */
export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { setMobileOpen } = useSidebar()
  const pageTitle = usePageTitle()
  const [searchOpen, setSearchOpen] = useState(false)

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className="sticky top-0 z-20 flex flex-col"
        style={{
          height: 'var(--navbar-h)',
          background: 'var(--sidebar-bg)',
          backdropFilter: 'var(--sidebar-blur)',
          WebkitBackdropFilter: 'var(--sidebar-blur)',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Main bar */}
        <div className="flex-1 flex items-center gap-3 px-4 md:px-6">

          {/* Mobile hamburger */}
          <GlassBtn label="Open menu" className="lg:hidden flex-shrink-0" onClick={() => setMobileOpen(true)}>
            <Menu size={17} />
          </GlassBtn>

          {/* Page title */}
          <h1 className="text-sm font-semibold hidden sm:block" style={{ color: 'rgb(var(--text-1))' }}>
            {pageTitle}
          </h1>

          <div className="flex-1" />

          {/* Search pill — clickable */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 w-52 lg:w-68 cursor-pointer glass-pill transition-all duration-150"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgb(var(--sunset-orange) / 0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--input-border)' }}
          >
            <Search size={13} style={{ color: 'rgb(var(--text-3))', flexShrink: 0 }} />
            <span className="text-sm flex-1 text-left select-none" style={{ color: 'rgb(var(--text-3))' }}>Search…</span>
            <kbd className="text-xs hidden lg:block" style={{ color: 'rgb(var(--text-3))', opacity: 0.55 }}>⌘K</kbd>
          </button>

          {/* Mobile search button */}
          <GlassBtn label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}>
            <Search size={15} />
          </GlassBtn>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <GlassBtn label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </GlassBtn>

            {/* Notifications — wired up */}
            <NotificationsDropdown />

            {/* User avatar */}
            <button
              className="w-9 h-9 rounded-pill flex items-center justify-center text-sm font-bold text-white select-none transition-all duration-150"
              style={{ background: 'var(--gradient-sunset)', boxShadow: 'var(--shadow-sunset)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--notif-avatar-hover-shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sunset)' }}
            >
              {user?.avatarInitials ?? 'U'}
            </button>
          </div>
        </div>

        {/* Sunset accent line — fades to transparent at the end */}
        <div style={{ height: '2px', background: 'var(--gradient-sunset-h)', flexShrink: 0 }} />
      </header>

      {/* Global Search dialog — rendered outside header so it can be full-screen */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

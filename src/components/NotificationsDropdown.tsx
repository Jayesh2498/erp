import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useLocalStore } from '@/hooks/useLocalStore'
import { MOCK_NOTIFICATIONS } from '@/lib/mockData'
import type { Notification } from '@/types'
import { formatRelativeTime } from '@/lib/format'
import { tokens } from '@/components/ui-kit/tokens'

const dotColors: Record<Notification['type'], string> = {
  overdue: tokens.dot.danger,
  low_stock: tokens.dot.warning,
  payment: tokens.dot.success,
  info: tokens.dot.info,
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { items: notifications, update, setItems } = useLocalStore<Notification>('notifications', MOCK_NOTIFICATIONS)

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const markAllRead = () => {
    setItems(notifications.map(n => ({ ...n, is_read: true })))
  }

  const markRead = (id: string) => {
    update(id, { is_read: true } as Partial<Notification>)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-pill flex items-center justify-center glass-pill transition-all duration-150 select-none"
        style={{ color: 'rgb(var(--text-2))' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--text-1))'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-2))'; e.currentTarget.style.transform = '' }}
      >
        <Bell size={15} />
        {unread > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{
              background: 'var(--notif-dot-color)',
              borderColor: 'rgb(var(--bg-page))',
              boxShadow: 'var(--notif-dot-shadow)',
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 animate-fade-in"
          style={{
            background: tokens.glass.bg,
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            border: `1px solid ${tokens.glass.border}`,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadow.lg,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: tokens.glass.border }}>
            <span className="text-sm font-semibold" style={{ color: tokens.color.text1 }}>
              Notifications {unread > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full" style={{ background: 'var(--gradient-sunset)', color: 'white' }}>{unread}</span>}
            </span>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: tokens.color.text3 }}
              onMouseEnter={e => { e.currentTarget.style.color = tokens.color.sunsetOrange }}
              onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center" style={{ color: tokens.color.text3, fontSize: 13 }}>
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-all"
                  style={{
                    borderColor: tokens.glass.border,
                    background: n.is_read ? 'transparent' : 'rgba(255,142,83,0.04)',
                  }}
                  onClick={() => markRead(n.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,142,83,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(255,142,83,0.04)' }}
                >
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                      background: dotColors[n.type],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: tokens.color.text1 }}>{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: tokens.color.text2 }}>{n.message}</p>
                    <p className="text-xs mt-1" style={{ color: tokens.color.text3 }}>{formatRelativeTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={e => { e.stopPropagation(); markRead(n.id) }}
                      style={{ color: tokens.color.text3, flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text1 }}
                      onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

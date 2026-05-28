import React from 'react'
import { useSidebar } from '@/providers/SidebarProvider'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { mobileOpen } = useSidebar()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'rgb(var(--bg-page))' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 animate-fade-in" style={{ color: 'rgb(var(--text-1))' }}>
          {children}
        </main>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-30 lg:hidden" />}
    </div>
  )
}

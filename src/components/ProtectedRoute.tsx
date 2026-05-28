import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import AppLayout from '@/components/layout/AppLayout'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** When true, renders without the app shell (sidebar + navbar). Used for full-screen pages like Onboarding. */
  noLayout?: boolean
}

export default function ProtectedRoute({ children, noLayout = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-3" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (noLayout) return <>{children}</>

  return <AppLayout>{children}</AppLayout>
}

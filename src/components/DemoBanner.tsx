import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

export function DemoBanner() {
  const { workspace } = useAuth()
  if (workspace?.slug !== 'DEMO') return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 mb-4 rounded-md text-sm font-medium"
      style={{
        background: 'rgba(234,179,8,0.12)',
        border: '1px solid rgba(234,179,8,0.3)',
        color: '#92400E',
      }}
    >
      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
      <span>Demo workspace — Data is stored locally and may reset.</span>
    </div>
  )
}

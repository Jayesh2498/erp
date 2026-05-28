import React, { useEffect } from 'react'
import { Clock } from 'lucide-react'
import { EmptyState } from '@/components/ui-kit'

interface ComingSoonProps {
  title?: string
  description?: string
}

export default function ComingSoon({ title = 'Coming Soon', description = 'This feature is under development.' }: ComingSoonProps) {
  useEffect(() => {
    document.title = `${title} | ERP`
  }, [title])

  return (
    <EmptyState
      icon={Clock}
      title={title}
      subtitle={description}
    />
  )
}

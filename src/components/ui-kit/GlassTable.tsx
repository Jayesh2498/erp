/**
 * GlassTable — table where every row is a glass panel
 * ======================================================
 * Header: plain text labels, no background.
 * Rows: individual glass-row panels with hover lift + shine.
 * No backdrop-filter on rows — parent GlassCard handles blur.
 *
 * USAGE:
 *   const cols: TableColumn<Invoice>[] = [
 *     { key: 'number', header: 'Invoice #', width: '120px' },
 *     { key: 'status', header: 'Status', render: row => <GlassBadge variant={row.status}>{row.status}</GlassBadge> },
 *     { key: 'amount', header: 'Amount', align: 'right' },
 *   ]
 *   <GlassTable columns={cols} data={invoices} onRowClick={row => navigate(`/invoices/${row.id}`)} />
 *   <GlassTable columns={cols} data={[]} emptyText="No invoices yet" />
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from './tokens'
import { EmptyState } from './EmptyState'
import { SkeletonLoader } from './SkeletonLoader'

export interface TableColumn<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GlassTableProps<T extends Record<string, any>> {
  columns: TableColumn<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyText?: string
  emptySubtext?: string
  skeletonRows?: number
  className?: string
  rowKey?: keyof T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GlassTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyText = 'No records found',
  emptySubtext = 'Try adjusting your filters or create a new entry.',
  skeletonRows = 5,
  className,
  rowKey = 'id' as keyof T,
}: GlassTableProps<T>) {
  const gridTemplate = columns.map(c => c.width ?? '1fr').join(' ')

  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="grid gap-3 px-4 pb-1" style={{ gridTemplateColumns: gridTemplate }}>
          {columns.map(col => (
            <span key={col.key} className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: tokens.color.text3, textAlign: col.align ?? 'left' }}>
              {col.header}
            </span>
          ))}
        </div>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <SkeletonLoader key={i} height={52} />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyText} subtitle={emptySubtext} className={className} />
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Headers */}
      <div className="grid gap-3 px-4 pb-1" style={{ gridTemplateColumns: gridTemplate }}>
        {columns.map(col => (
          <span key={col.key} className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: tokens.color.text3, textAlign: col.align ?? 'left' }}>
            {col.header}
          </span>
        ))}
      </div>

      {/* Rows — each is an individual glass panel */}
      {data.map((row, rowIdx) => (
        <div
          key={String(row[rowKey as string] ?? rowIdx)}
          className="glass-row grid items-center gap-3 px-4 py-3.5"
          style={{ gridTemplateColumns: gridTemplate, cursor: onRowClick ? 'pointer' : 'default' }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-1px)'
            el.style.boxShadow = tokens.shadow.md
            el.style.borderColor = tokens.glass.borderHover
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.transform = ''
            el.style.boxShadow = tokens.shadow.sm
            el.style.borderColor = tokens.glass.border
          }}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map(col => (
            <div key={col.key} className={cn('truncate', col.className)}
              style={{ position: 'relative', zIndex: 1, textAlign: col.align ?? 'left' }}>
              {col.render
                ? col.render(row, rowIdx)
                : <span className="text-sm" style={{ color: tokens.color.text1 }}>{String(row[col.key] ?? '—')}</span>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * ListPage — standard list/table page layout
 * =============================================
 * Composes: PageLayout + filter bar + GlassTable + optional pagination.
 * Used by: Contacts, Products, Invoices, Bills, POs, etc.
 *
 * USAGE:
 *   <ListPage
 *     title="Contacts"
 *     subtitle="342 contacts"
 *     actions={<GlassButton icon={Plus}>New Contact</GlassButton>}
 *     columns={contactColumns}
 *     data={contacts}
 *     onRowClick={c => navigate(`/contacts/${c.id}`)}
 *     loading={isLoading}
 *     filters={
 *       <GlassSelect options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
 *     }
 *   />
 */
import React from 'react'
import { GlassCard } from './GlassCard'
import { GlassTable, TableColumn } from './GlassTable'
import { SearchBar } from './SearchBar'
import { PageLayout } from './PageLayout'
import { tokens } from './tokens'

interface ListPageProps<T extends Record<string, unknown>> {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
  /** Column definitions for GlassTable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: TableColumn<any>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyText?: string
  emptySubtext?: string
  rowKey?: keyof T
  /** Extra filter controls (selects, toggles) shown right of search */
  filters?: React.ReactNode
  /** Search bar: controlled value */
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  /** Pagination */
  pagination?: React.ReactNode
}

export function ListPage<T extends Record<string, unknown>>({
  title,
  subtitle,
  backHref,
  actions,
  columns,
  data,
  onRowClick,
  loading,
  emptyText,
  emptySubtext,
  rowKey,
  filters,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  pagination,
}: ListPageProps<T>) {
  return (
    <PageLayout title={title} subtitle={subtitle} backHref={backHref} actions={actions}>
      <GlassCard size="lg" hover={false} className="p-5">
        {/* Filter bar */}
        {(searchValue !== undefined || filters) && (
          <div
            className="flex items-center gap-3 mb-5 flex-wrap"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {searchValue !== undefined && (
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
                className="flex-1 min-w-[200px] max-w-sm"
              />
            )}
            {filters && (
              <div className="flex items-center gap-2 flex-wrap">
                {filters}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <GlassTable
            columns={columns}
            data={data}
            onRowClick={onRowClick}
            loading={loading}
            emptyText={emptyText}
            emptySubtext={emptySubtext}
            rowKey={rowKey}
          />
        </div>

        {/* Pagination */}
        {pagination && (
          <div
            className="flex justify-end mt-5 pt-4 border-t"
            style={{ borderColor: tokens.glass.border, position: 'relative', zIndex: 1 }}
          >
            {pagination}
          </div>
        )}
      </GlassCard>
    </PageLayout>
  )
}

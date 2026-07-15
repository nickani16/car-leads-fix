import type { AdminPermission } from '@/lib/admin/permissions'
import { requireAdminPermission } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminTable,
  Badge,
  FilterSelect,
} from './AdminUI'
import {
  type AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from './admin-helpers'

type ResourceRow = Record<string, unknown>

export type ResourceColumn = {
  key: string
  label: string
  format?: 'date' | 'money' | 'status' | 'boolean'
}

function displayValue(row: ResourceRow, column: ResourceColumn) {
  const value = row[column.key]
  if (column.format === 'date') return formatDate(typeof value === 'string' ? value : null)
  if (column.format === 'boolean') return value ? 'Ja' : 'Nej'
  if (column.format === 'money') {
    const amount = typeof value === 'number' ? value / 100 : 0
    const currency = String(row.currency || 'SEK').toUpperCase()
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency }).format(amount)
  }
  if (Array.isArray(value)) return value.join(', ') || '–'
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value ?? '–')
}

export default async function AdminResourcePage({
  searchParams,
  permission,
  table,
  select,
  title,
  eyebrow,
  description,
  basePath,
  columns,
  searchColumns = [],
  statusOptions = [],
  statusColumn = 'status',
  orderBy = 'created_at',
  emptyText,
  actions,
  actionsPermission,
  toolbar,
  toolbarPermission,
}: {
  searchParams: AdminSearchParams
  permission: AdminPermission
  table: string
  select: string
  title: string
  eyebrow: string
  description: string
  basePath: string
  columns: ResourceColumn[]
  searchColumns?: string[]
  statusOptions?: { value: string; label: string }[]
  statusColumn?: string
  orderBy?: string
  emptyText: string
  actions?: (row: ResourceRow) => React.ReactNode
  actionsPermission?: AdminPermission
  toolbar?: React.ReactNode
  toolbarPermission?: AdminPermission
}) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const context = await requireAdminPermission(permission)
  const { adminClient } = context
  const canAct = !actionsPermission || context.permissions.includes(actionsPermission)

  let query = adminClient
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderBy, { ascending: false })
    .range(from, to)

  if (status) query = query.eq(statusColumn, status)
  if (q && searchColumns.length) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(searchColumns.map((column) => `${column}.ilike.%${escaped}%`).join(','))
  }

  const { data, count, error } = await query
  const rows = (data || []) as unknown as ResourceRow[]

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} />
      {toolbar && (!toolbarPermission || context.permissions.includes(toolbarPermission)) ? (
        <div className="mb-6">{toolbar}</div>
      ) : null}
      <AdminFilters search={q} searchPlaceholder={`Sök i ${title.toLowerCase()}`}>
        {statusOptions.length ? (
          <FilterSelect name="status" value={status} label="Status" options={statusOptions} />
        ) : null}
      </AdminFilters>
      {error ? (
        <AdminEmpty text={`Datakällan är inte tillgänglig ännu: ${error.message}`} />
      ) : !rows.length ? (
        <AdminEmpty text={emptyText} />
      ) : (
        <>
          <AdminTable columns={[...columns.map((column) => column.label), ...(actions && canAct ? ['Åtgärder'] : [])]}>
            {rows.map((row) => (
              <tr key={String(row.id)} className="hover:bg-[#f8fafc]">
                {columns.map((column) => (
                  <td key={column.key} className="max-w-[340px] px-4 py-4 align-top text-[#344054]">
                    {column.format === 'status' ? (
                      <Badge label={displayValue(row, column)} tone={statusTone(String(row[column.key] || ''))} />
                    ) : (
                      <span className="line-clamp-3 break-words">{displayValue(row, column)}</span>
                    )}
                  </td>
                ))}
                {actions && canAct ? <td className="px-4 py-4 align-top">{actions(row)}</td> : null}
              </tr>
            ))}
          </AdminTable>
          <AdminPagination
            page={page}
            hasNext={page * 20 < (count || 0)}
            basePath={basePath}
            query={queryToUrlSearchParams(params)}
          />
        </>
      )}
    </main>
  )
}

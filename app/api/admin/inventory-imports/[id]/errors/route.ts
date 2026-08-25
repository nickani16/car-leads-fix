import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('inventory_imports.read')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  if (!uuidPattern.test(id)) return new Response('Ogiltigt käll-ID.', { status: 400 })

  const { data: source, error } = await auth.adminClient.from('dealer_import_sources').select('id,name,organization_id,last_error').eq('id', id).maybeSingle()
  if (error) return new Response(error.message, { status: 400 })
  if (!source) return new Response('Importkällan hittades inte.', { status: 404 })

  const [{ data: runs }, { data: items }] = await Promise.all([
    auth.adminClient.from('dealer_import_runs').select('id,status,created_at,last_error_code,last_error_message,summary').eq('source_id', id).order('created_at', { ascending: false }).limit(500),
    auth.adminClient.from('dealer_import_items').select('id,source_url,sync_status,parse_confidence,warnings,updated_at').eq('source_id', id).or('sync_status.eq.import_error,sync_status.eq.import_review').order('updated_at', { ascending: false }).limit(5000),
  ])

  const rows: string[][] = [['kind', 'record_id', 'url', 'status', 'error_code', 'message', 'timestamp']]
  for (const run of runs || []) {
    const failedUrls = run.summary && typeof run.summary === 'object' && !Array.isArray(run.summary) ? (run.summary as Record<string, unknown>).failed_urls : null
    if (run.last_error_code || (Array.isArray(failedUrls) && failedUrls.length > 0)) {
      rows.push(['run', String(run.id), '', String(run.status), String(run.last_error_code || ''), String(run.last_error_message || ''), String(run.created_at || '')])
    }
    if (Array.isArray(failedUrls)) for (const entry of failedUrls) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
      const value = entry as Record<string, unknown>
      rows.push(['url', String(run.id), String(value.url || ''), String(run.status), String(value.code || ''), String(value.message || ''), String(run.created_at || '')])
    }
  }
  for (const item of items || []) rows.push(['item', String(item.id), String(item.source_url || ''), String(item.sync_status), '', Array.isArray(item.warnings) ? item.warnings.join('; ') : '', String(item.updated_at || '')])
  if (source.last_error) rows.push(['source', String(source.id), '', 'error', 'SOURCE_LAST_ERROR', String(source.last_error), new Date().toISOString()])

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'inventory_imports.read',
    action: 'inventory_import_export_errors',
    targetType: 'dealer_import_source',
    targetId: id,
    reason: 'Administratör exporterade källans felrapport.',
    metadata: { row_count: rows.length - 1 },
  })

  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
  const filename = `autorell-import-errors-${safeFilename(String(source.name))}-${id.slice(0, 8)}.csv`
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}

function csvCell(value: string) {
  const protectedValue = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${protectedValue.replace(/"/g, '""')}"`
}

function safeFilename(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'source' }

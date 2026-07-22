import { NextResponse } from 'next/server'
import {
  requireAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const statuses = new Set(['reviewing', 'actioned', 'closed'])

type AdminReportRouteContext = {
  params: Promise<{ id: string }>
}

const reportAuditSelect = `
  id,
  listing_id,
  category,
  details,
  contact_email,
  contact_phone,
  status,
  reviewed_by,
  reviewed_at,
  created_at
`

export async function PATCH(
  request: Request,
  context: AdminReportRouteContext,
) {
  const auth = await requireAdminRoute('reports.manage')
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const status = String(body.action || '')
  if (!statuses.has(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }
  if ((status === 'actioned' || status === 'closed') && String(body.reason || '').trim().length < 8) {
    return NextResponse.json({ error: 'A reason of at least 8 characters is required.' }, { status: 400 })
  }

  const { adminClient, user } = auth
  const { data: before, error: beforeError } = await adminClient
    .from('marketplace_reports')
    .select(reportAuditSelect)
    .eq('id', id)
    .maybeSingle()

  if (beforeError || !before) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  }

  const patch: Record<string, unknown> = { status }
  if (status === 'actioned' || status === 'closed') {
    patch.reviewed_by = user.id
    patch.reviewed_at = new Date().toISOString()
  }

  let { error } = await adminClient
    .from('marketplace_reports')
    .update(patch)
    .eq('id', id)

  if (error && String(error.message).includes('column')) {
    const fallback = await adminClient
      .from('marketplace_reports')
      .update({ status })
      .eq('id', id)
    error = fallback.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await writeAdminAuditLog({
    adminClient,
    actorUserId: user.id,
    actorRole: auth.primaryRole,
    permission: 'reports.manage',
    action: `marketplace_report_${status}`,
    targetType: 'marketplace_report',
    targetId: id,
    reason: body.reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })

  return NextResponse.json({ success: true })
}

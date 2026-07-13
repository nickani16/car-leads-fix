import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contextHasPermission, getAdminContext } from '@/lib/admin/context'
import type { AdminPermission, AdminRole } from '@/lib/admin/permissions'

export async function requireAdminRoute(permission: AdminPermission) {
  const context = await getAdminContext()

  if (!context) {
    return {
      error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }),
    }
  }

  if (!contextHasPermission(context, permission)) {
    return {
      error: NextResponse.json(
        { error: 'You do not have permission to perform this action.' },
        { status: 403 },
      ),
    }
  }

  return context
}

export async function requireSuperAdminRoute() {
  return requireAdminRoute('administrators.manage')
}

export async function writeAdminAuditLog({
  adminClient,
  actorUserId,
  actorRole,
  permission,
  action,
  targetType,
  targetId,
  reason,
  beforeData,
  afterData,
  success = true,
  errorCode,
  requestId,
  sessionId,
  metadata,
}: {
  adminClient: ReturnType<typeof createAdminClient>
  actorUserId: string
  actorRole?: AdminRole | string
  permission?: AdminPermission | null
  action: string
  targetType: string
  targetId?: string | null
  reason?: string | null
  beforeData?: unknown
  afterData?: unknown
  success?: boolean
  errorCode?: string | null
  requestId?: string | null
  sessionId?: string | null
  metadata?: Record<string, unknown> | null
}) {
  const baseEntry = {
    actor_user_id: actorUserId,
    actor_role: actorRole || 'unknown',
    action,
    target_type: targetType,
    target_id: targetId || null,
    reason: reason || null,
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
  }

  let { error } = await adminClient.from('admin_audit_log').insert({
    ...baseEntry,
    permission: permission || null,
    success,
    error_code: errorCode || null,
    request_id: requestId || null,
    session_id: sessionId || null,
    metadata: metadata || {},
  })

  if (error && /column|schema cache/i.test(error.message)) {
    const fallback = await adminClient.from('admin_audit_log').insert(baseEntry)
    error = fallback.error
  }

  if (error) {
    console.error('Admin audit log failed:', error)
  }

  return { success: !error, error }
}

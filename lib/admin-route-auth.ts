import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireSuperAdminRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }),
    }
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role,is_active')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser) {
    return {
      error: NextResponse.json(
        { error: 'Super admin access required.' },
        { status: 403 }
      ),
    }
  }

  return { user, adminUser, adminClient }
}

export async function writeAdminAuditLog({
  adminClient,
  actorUserId,
  action,
  targetType,
  targetId,
  reason,
  beforeData,
  afterData,
}: {
  adminClient: ReturnType<typeof createAdminClient>
  actorUserId: string
  action: string
  targetType: string
  targetId?: string | null
  reason?: string | null
  beforeData?: unknown
  afterData?: unknown
}) {
  const { error } = await adminClient.from('admin_audit_log').insert({
    actor_user_id: actorUserId,
    actor_role: 'super_admin',
    action,
    target_type: targetType,
    target_id: targetId || null,
    reason: reason || null,
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
  })

  if (error) {
    console.error('Admin audit log failed:', error)
  }
}

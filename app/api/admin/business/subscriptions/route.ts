import { NextResponse } from 'next/server'
import { requireSuperAdminRoute } from '@/lib/admin-route-auth'

export async function GET() {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const { data, error } = await auth.adminClient.from('business_subscriptions').select('*').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscriptions: data || [] })
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json()) as { id?: string; status?: string; manuallyActivated?: boolean; temporaryQuota?: number | null; freePeriodEndsAt?: string | null }
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (body.status) patch.status = body.status
  if (typeof body.manuallyActivated === 'boolean') patch.manually_activated = body.manuallyActivated
  if (body.temporaryQuota !== undefined) patch.temporary_quota = body.temporaryQuota
  if (body.freePeriodEndsAt !== undefined) patch.free_period_ends_at = body.freePeriodEndsAt
  patch.updated_at = new Date().toISOString()
  const { data, error } = await auth.adminClient.from('business_subscriptions').update(patch).eq('id', body.id).select('user_id,plan_key,status,manually_activated,temporary_quota,free_period_ends_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (data?.user_id && (body.manuallyActivated || body.status === 'active')) await auth.adminClient.from('marketplace_profiles').update({ business_onboarding_status: 'active' }).eq('user_id', data.user_id)
  return NextResponse.json({ subscription: data })
}

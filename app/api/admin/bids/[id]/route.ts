import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function getEditableBid(
  adminClient: SupabaseClient,
  id: string
) {
  const [{ data: bid }, { data: deal }] = await Promise.all([
    adminClient.from('bids').select('*').eq('id', id).maybeSingle(),
    adminClient
      .from('deals')
      .select('id,status')
      .eq('winning_bid_id', id)
      .maybeSingle(),
  ])
  return { bid, deal }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid bid.' }, { status: 400 })
  }
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json().catch(() => ({}))) as {
    amount?: number
    reason?: string
  }
  const amount = Number(body.amount)
  const reason = body.reason?.trim() || ''
  if (!Number.isFinite(amount) || amount <= 0 || reason.length < 8) {
    return NextResponse.json(
      { error: 'Enter a valid amount and a reason of at least 8 characters.' },
      { status: 400 }
    )
  }

  const { bid, deal } = await getEditableBid(auth.adminClient, id)
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found.' }, { status: 404 })
  }
  if (deal) {
    return NextResponse.json(
      {
        error: `This bid is linked to deal ${deal.id}. Cancel or reopen that deal before changing the bid.`,
      },
      { status: 409 }
    )
  }

  const { data: after, error } = await auth.adminClient
    .from('bids')
    .update({ amount })
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'bid_amount_updated',
    targetType: 'bid',
    targetId: id,
    reason,
    beforeData: bid,
    afterData: after,
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid bid.' }, { status: 400 })
  }
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json().catch(() => ({}))) as { reason?: string }
  const reason = body.reason?.trim() || ''
  if (reason.length < 8) {
    return NextResponse.json(
      { error: 'Enter a reason of at least 8 characters.' },
      { status: 400 }
    )
  }

  const { bid, deal } = await getEditableBid(auth.adminClient, id)
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found.' }, { status: 404 })
  }
  if (deal) {
    return NextResponse.json(
      {
        error: `This bid is linked to deal ${deal.id}. Cancel or reopen that deal before deleting the bid.`,
      },
      { status: 409 }
    )
  }

  const { error } = await auth.adminClient.from('bids').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'bid_deleted',
    targetType: 'bid',
    targetId: id,
    reason,
    beforeData: bid,
  })
  return NextResponse.json({ success: true })
}

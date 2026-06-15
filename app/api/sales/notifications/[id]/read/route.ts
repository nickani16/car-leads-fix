import { NextResponse } from 'next/server'
import { requireSalesRoute } from '@/lib/sales-route-auth'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireSalesRoute()
  if ('error' in auth) return auth.error

  const { data, error } = await auth.adminClient
    .from('notifications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('recipient_user_id', auth.user.id)
    .select('id,action_url,deal_id')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Notification was not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    href: data.action_url || (data.deal_id ? `/sales?deal=${data.deal_id}` : '/sales'),
  })
}

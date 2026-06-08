import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Notification = {
  id: string
  recipient_user_id: string | null
  recipient_email: string | null
  audience: 'admin' | 'sales' | 'dealer' | 'seller'
  title: string
  body: string
  deal_id: string | null
  channels: string[]
  attempts: number
}

function portalLink(audience: Notification['audience'], dealId: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.autorell.com'
  const path =
    audience === 'admin'
      ? '/admin/deals'
      : audience === 'sales'
        ? '/sales'
        : audience === 'dealer'
          ? '/dealer'
          : '/'

  const url = new URL(path, baseUrl)
  if (dealId && audience !== 'seller') {
    url.searchParams.set('deal', dealId)
  }
  return url.toString()
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (
    !secret ||
    request.headers.get('authorization') !== `Bearer ${secret}`
  ) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: 'Notification email is not configured.' },
      { status: 503 }
    )
  }

  const adminClient = createAdminClient()
  const resend = new Resend(resendKey)
  const { data, error } = await adminClient
    .from('notifications')
    .select(
      'id,recipient_user_id,recipient_email,audience,title,body,deal_id,channels,attempts'
    )
    .eq('status', 'pending')
    .contains('channels', ['email'])
    .lte('available_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(25)

  if (error) {
    console.error('Notification queue read error:', error)
    return NextResponse.json({ error: 'Queue could not be read.' }, { status: 500 })
  }

  let sent = 0
  let failed = 0

  for (const notification of (data || []) as Notification[]) {
    const { data: claimed } = await adminClient
      .from('notifications')
      .update({
        status: 'processing',
        attempts: notification.attempts + 1,
        last_error: null,
      })
      .eq('id', notification.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (!claimed) continue

    let recipient = notification.recipient_email
    if (!recipient && notification.recipient_user_id) {
      const { data: authUser } = await adminClient.auth.admin.getUserById(
        notification.recipient_user_id
      )
      recipient = authUser.user?.email || null
    }

    if (!recipient) {
      failed += 1
      await adminClient
        .from('notifications')
        .update({
          status: 'failed',
          last_error: 'Recipient email is missing.',
        })
        .eq('id', notification.id)
      continue
    }

    const link = portalLink(notification.audience, notification.deal_id)
    const { error: sendError } = await resend.emails.send({
      from:
        process.env.NOTIFICATION_FROM_EMAIL ||
        process.env.CONTACT_FROM_EMAIL ||
        'Autorell <onboarding@resend.dev>',
      to: recipient,
      subject: notification.title,
      text: `${notification.body}\n\nOpen Autorell: ${link}\n\nThis is an automated message from Autorell.`,
    })

    if (sendError) {
      failed += 1
      await adminClient
        .from('notifications')
        .update({
          status: notification.attempts + 1 >= 5 ? 'failed' : 'pending',
          available_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          last_error: sendError.message,
        })
        .eq('id', notification.id)
      continue
    }

    sent += 1
    await adminClient
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', notification.id)
  }

  return NextResponse.json({
    success: true,
    processed: sent + failed,
    sent,
    failed,
  })
}

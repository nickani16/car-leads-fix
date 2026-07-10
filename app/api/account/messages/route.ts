import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { publicSellerName } from '@/lib/public-seller'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const body = (await request.json()) as { conversationId?: string; message?: string }
  const message = body.message?.trim() || ''
  if (!body.conversationId || message.length < 1 || message.length > 3000) {
    return NextResponse.json({ error: 'Write a message of up to 3,000 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: conversation } = await admin
    .from('marketplace_conversations')
    .select('id,buyer_user_id,seller_user_id,status,listing_id')
    .eq('id', body.conversationId)
    .maybeSingle()

  if (
    !conversation ||
    conversation.status !== 'open' ||
    ![conversation.buyer_user_id, conversation.seller_user_id].includes(user.id)
  ) {
    return NextResponse.json({ error: 'Conversation is unavailable.' }, { status: 403 })
  }

  const { data: insertedMessage, error } = await admin.from('marketplace_messages').insert({
    conversation_id: conversation.id,
    sender_user_id: user.id,
    body: message,
  })
    .select('id,created_at')
    .single()
  if (!error) {
    await admin.from('marketplace_conversations').update({
      last_message_at: new Date().toISOString(),
    }).eq('id', conversation.id)
    await sendMessageNotification({
      admin,
      conversation,
      senderUserId: user.id,
      senderEmail: user.email || '',
      message,
      messageCreatedAt: insertedMessage?.created_at || new Date().toISOString(),
    })
  }

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}

type ConversationRow = {
  id: string
  listing_id: string | null
  buyer_user_id: string
  seller_user_id: string
}

type AdminClient = ReturnType<typeof createAdminClient>

async function sendMessageNotification({
  admin,
  conversation,
  senderUserId,
  senderEmail,
  message,
  messageCreatedAt,
}: {
  admin: AdminClient
  conversation: ConversationRow
  senderUserId: string
  senderEmail: string
  message: string
  messageCreatedAt: string
}) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const recipientUserId =
    conversation.buyer_user_id === senderUserId
      ? conversation.seller_user_id
      : conversation.buyer_user_id

  try {
    const [{ data: profileData }, { data: listing }] = await Promise.all([
      admin
        .from('marketplace_profiles')
        .select('user_id,email,display_name,first_name,last_name,company_name,account_type')
        .in('user_id', [senderUserId, recipientUserId]),
      conversation.listing_id
        ? admin
            .from('marketplace_listings')
            .select('id,title,category,city,country_code')
            .eq('id', conversation.listing_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const profiles = profileData || []
    const senderProfile = profiles.find((profile) => profile.user_id === senderUserId)
    const recipientProfile = profiles.find((profile) => profile.user_id === recipientUserId)
    const recipientEmail =
      recipientProfile?.email ||
      (await admin.auth.admin.getUserById(recipientUserId)).data.user?.email ||
      ''

    if (!recipientEmail || recipientEmail === senderEmail) return

    const senderName = displayProfileName(senderProfile) || senderEmail || 'A user'
    const listingTitle = listing?.title || 'a listing'
    const messageUrl = `https://www.autorell.com/account/messages?conversation=${encodeURIComponent(conversation.id)}`
    const preview = truncateMessage(message, 420)
    const subject = `New message about ${listingTitle}`
    const resend = new Resend(resendKey)

    const { error: sendError } = await resend.emails.send({
      from: 'Autorell <noreply@autorell.com>',
      to: recipientEmail,
      subject,
      text: [
        `You have a new message from ${senderName}.`,
        '',
        `Listing: ${listingTitle}`,
        listing?.city || listing?.country_code ? `Location: ${[listing?.city, listing?.country_code].filter(Boolean).join(', ')}` : '',
        '',
        'Message preview:',
        preview,
        '',
        `Open the conversation: ${messageUrl}`,
        '',
        'Autorell marketplace',
      ].filter(Boolean).join('\n'),
      html: buildMessageNotificationHtml({
        subject,
        senderName,
        listingTitle,
        listingLocation: [listing?.city, listing?.country_code].filter(Boolean).join(', '),
        preview,
        messageUrl,
        messageCreatedAt,
      }),
    })

    if (sendError) {
      console.error('Message notification email failed', sendError)
    }
  } catch (error) {
    console.error('Message notification email failed', error)
  }
}

function displayProfileName(profile?: {
  account_type?: string | null
  company_name?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
}) {
  if (!profile) return ''
  return publicSellerName({
    account_type: profile.account_type,
    company_name: profile.company_name,
    display_name: profile.display_name,
    first_name: profile.first_name,
  }, '')
}

function truncateMessage(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}...` : clean
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildMessageNotificationHtml({
  subject,
  senderName,
  listingTitle,
  listingLocation,
  preview,
  messageUrl,
  messageCreatedAt,
}: {
  subject: string
  senderName: string
  listingTitle: string
  listingLocation: string
  preview: string
  messageUrl: string
  messageCreatedAt: string
}) {
  const sentAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(messageCreatedAt))

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;background:#f3f7ff;color:#101828;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Open your Autorell conversation to reply.</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7ff;padding:36px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;overflow:hidden;border:1px solid #dce5f4;border-radius:24px;background:#ffffff;box-shadow:0 22px 60px rgba(16,24,40,.10);">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf1f7;">
                  <img src="https://www.autorell.com/autorell-logo-primary.png" width="138" alt="Autorell" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
                  <div style="margin-top:12px;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">New marketplace message</div>
                </td>
              </tr>
              <tr><td style="padding:34px 32px 28px;text-align:left;">
                <h1 style="margin:0;font-size:28px;line-height:1.18;letter-spacing:-1px;color:#101828;">You have a new message</h1>
                <p style="margin:12px 0 0;color:#475467;font-size:15px;line-height:1.7;">${escapeHtml(senderName)} sent you a message about <strong>${escapeHtml(listingTitle)}</strong>.</p>
                ${listingLocation ? `<p style="margin:8px 0 0;color:#667085;font-size:13px;line-height:1.6;">${escapeHtml(listingLocation)}</p>` : ''}
                <div style="margin:24px 0 0;border-radius:18px;background:#f8fbff;padding:20px;border:1px solid #dce5f4;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0866ff;">Message preview</div>
                  <p style="margin:10px 0 0;color:#101828;font-size:15px;line-height:1.7;">${escapeHtml(preview)}</p>
                </div>
                <p style="margin:18px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">Sent ${escapeHtml(sentAt)}.</p>
                <a href="${escapeHtml(messageUrl)}" style="display:inline-block;margin-top:24px;border-radius:14px;background:#0866ff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 20px;">Open message</a>
              </td></tr>
              <tr><td style="padding:20px 32px;border-top:1px solid #edf1f7;color:#98a2b3;font-size:12px;line-height:1.6;">Autorell marketplace<br />Europe's trusted marketplace for buying and selling vehicles.</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `
}

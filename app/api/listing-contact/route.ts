import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

type ContactPayload = {
  listingId?: string
  name?: string
  phone?: string
  email?: string
  offer?: string
  message?: string
  privacy?: boolean
  locale?: string
}

function clean(value: unknown, maxLength: number) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function cleanMultiline(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function listingUrl(request: Request, listingId: string) {
  const origin = new URL(request.url).origin
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      if (url.pathname.includes('/listings/')) return url.toString()
    } catch {
      // Ignore invalid referer.
    }
  }
  return `${origin}/listings/${listingId}`
}

export async function POST(request: Request) {
  const limit = checkRateLimit({
    key: `listing-contact:${getClientIp(request)}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = (await request.json().catch(() => null)) as ContactPayload | null
  const listingId = clean(body?.listingId, 80)
  const name = clean(body?.name, 120)
  const phone = clean(body?.phone, 80)
  const email = clean(body?.email, 160).toLowerCase()
  const offer = clean(body?.offer, 120)
  const message = cleanMultiline(body?.message, 3000)

  if (!listingId || !name || !phone || !email || !message || !body?.privacy) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email is not configured.' }, { status: 503 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,title,city,country_code,seller_user_id,status')
    .eq('id', listingId)
    .eq('status', 'published')
    .maybeSingle()

  if (!listing?.seller_user_id) {
    return NextResponse.json({ error: 'Listing is unavailable.' }, { status: 404 })
  }

  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('email')
    .eq('user_id', listing.seller_user_id)
    .maybeSingle()

  const sellerEmail =
    profile?.email ||
    (await admin.auth.admin.getUserById(listing.seller_user_id)).data.user?.email ||
    ''

  if (!sellerEmail || sellerEmail === email) {
    return NextResponse.json({ error: 'Seller email is unavailable.' }, { status: 400 })
  }

  const url = listingUrl(request, listing.id)
  const submittedAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date())
  const subject = `New enquiry about ${listing.title}`
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || 'Autorell <noreply@autorell.com>',
    to: sellerEmail,
    replyTo: email,
    subject,
    text: [
      `You have a new enquiry about ${listing.title}.`,
      '',
      `Listing: ${listing.title}`,
      `Location: ${[listing.city, listing.country_code].filter(Boolean).join(', ')}`,
      `Listing URL: ${url}`,
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      offer ? `Offer: ${offer}` : '',
      '',
      'Message:',
      message,
      '',
      `Submitted: ${submittedAt}`,
      'The buyer agreed that Autorell may send these contact details to you for this listing.',
    ].filter(Boolean).join('\n'),
    html: buildListingContactHtml({
      subject,
      listingTitle: listing.title,
      location: [listing.city, listing.country_code].filter(Boolean).join(', '),
      listingUrl: url,
      name,
      email,
      phone,
      offer,
      message,
      submittedAt,
    }),
  })

  if (error) {
    console.error('Listing contact email failed', error)
    return NextResponse.json({ error: 'Could not send enquiry.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

function buildListingContactHtml({
  subject,
  listingTitle,
  location,
  listingUrl,
  name,
  email,
  phone,
  offer,
  message,
  submittedAt,
}: {
  subject: string
  listingTitle: string
  location: string
  listingUrl: string
  name: string
  email: string
  phone: string
  offer: string
  message: string
  submittedAt: string
}) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;background:#f3f7ff;color:#101828;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">A buyer sent an enquiry via Autorell.</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7ff;padding:36px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;overflow:hidden;border:1px solid #dce5f4;border-radius:24px;background:#ffffff;box-shadow:0 22px 60px rgba(16,24,40,.10);">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf1f7;">
                  <img src="https://www.autorell.com/autorell-logo-primary.png" width="138" alt="Autorell" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
                  <div style="margin-top:12px;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">New seller enquiry</div>
                </td>
              </tr>
              <tr><td style="padding:34px 32px 28px;text-align:left;">
                <h1 style="margin:0;font-size:28px;line-height:1.18;letter-spacing:-1px;color:#101828;">You have a new enquiry</h1>
                <p style="margin:12px 0 0;color:#475467;font-size:15px;line-height:1.7;">${escapeHtml(name)} contacted you about <strong>${escapeHtml(listingTitle)}</strong>.</p>
                ${location ? `<p style="margin:8px 0 0;color:#667085;font-size:13px;line-height:1.6;">${escapeHtml(location)}</p>` : ''}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border:1px solid #dce5f4;border-radius:18px;background:#f8fbff;">
                  ${detailRow('Name', name)}
                  ${detailRow('Email', email)}
                  ${detailRow('Phone', phone)}
                  ${offer ? detailRow('Offer', offer) : ''}
                </table>
                <div style="margin:24px 0 0;border-radius:18px;background:#ffffff;padding:20px;border:1px solid #dce5f4;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0866ff;">Message</div>
                  <p style="margin:10px 0 0;color:#101828;font-size:15px;line-height:1.7;">${safeMessage}</p>
                </div>
                <p style="margin:18px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">Submitted ${escapeHtml(submittedAt)}. The buyer agreed that Autorell may send these contact details for this listing.</p>
                <a href="${escapeHtml(listingUrl)}" style="display:inline-block;margin-top:24px;border-radius:14px;background:#0866ff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 20px;">Open listing</a>
              </td></tr>
              <tr><td style="padding:20px 32px;border-top:1px solid #edf1f7;color:#98a2b3;font-size:12px;line-height:1.6;">Autorell marketplace<br />Reply directly to this email to answer the buyer.</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid #dce5f4;color:#667085;font-size:12px;width:110px;">${escapeHtml(label)}</td>
      <td style="padding:14px 18px;border-bottom:1px solid #dce5f4;color:#101828;font-size:14px;font-weight:700;">${escapeHtml(value)}</td>
    </tr>
  `
}

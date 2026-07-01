import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  codeExpiresAt,
  codeHash,
  emailHash,
  generateEmailCode,
  isValidEmail,
  normalizeEmail,
} from '@/lib/email-code-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const requestWindow = new Map<string, number>()
const REQUEST_COOLDOWN_MS = 20_000

function clientKey(request: Request, email: string) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `${ip}:${email}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const previous = requestWindow.get(key)
  if (previous && now - previous < REQUEST_COOLDOWN_MS) return true
  requestWindow.set(key, now)
  return false
}

function emailCopy(code: string) {
  return {
    subject: `${code} is your Autorell sign-in code`,
    preheader: 'Use this one-time code to sign in to Autorell.',
    heading: 'Sign in to Autorell',
    intro: 'Enter the code below to continue to your Autorell account.',
    expiry: 'The code is valid for 10 minutes and can only be used once.',
    ignore: 'If you did not request this code, you can ignore this email.',
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = normalizeEmail(body.email)
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Ange en giltig e-postadress.' },
        { status: 400 },
      )
    }

    const requestLimit = checkRateLimit({
      key: `email-code-request:${getClientIp(request)}:${email}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    })
    if (requestLimit.limited) {
      return NextResponse.json(
        { error: 'VÃ¤nta nÃ¥gra minuter innan du begÃ¤r fler koder.' },
        {
          status: 429,
          headers: { 'Retry-After': String(requestLimit.retryAfter) },
        },
      )
    }

    if (isRateLimited(clientKey(request, email))) {
      return NextResponse.json(
        { error: 'Vänta några sekunder innan du begär en ny kod.' },
        { status: 429 },
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json(
        { error: 'Inloggning via e-post är tillfälligt otillgänglig.' },
        { status: 503 },
      )
    }

    const admin = createAdminClient()
    const hashedEmail = emailHash(email)
    const since = new Date(Date.now() - REQUEST_COOLDOWN_MS).toISOString()
    const { count } = await admin
      .from('auth_email_codes')
      .select('id', { count: 'exact', head: true })
      .eq('email_hash', hashedEmail)
      .gte('created_at', since)
    if (count) {
      return NextResponse.json(
        { error: 'Vänta några sekunder innan du begär en ny kod.' },
        { status: 429 },
      )
    }

    const code = generateEmailCode()
    const { error: insertError } = await admin.from('auth_email_codes').insert({
      email,
      email_hash: hashedEmail,
      code_hash: codeHash(email, code),
      expires_at: codeExpiresAt(),
    })
    if (insertError) throw insertError

    const copy = emailCopy(code)
    const resend = new Resend(resendKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Autorell <noreply@autorell.com>',
      to: email,
      subject: copy.subject,
      text: [
        copy.heading,
        '',
        code,
        '',
        copy.intro,
        copy.expiry,
        copy.ignore,
        '',
        'Autorell marketplace',
      ].join('\n'),
      html: `
        <!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="x-apple-disable-message-reformatting" />
            <title>${copy.subject}</title>
          </head>
          <body style="margin:0;background:#f3f7ff;color:#101828;font-family:Arial,Helvetica,sans-serif;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${copy.preheader}</div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7ff;padding:36px 12px;">
              <tr><td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #dce5f4;border-radius:24px;background:#ffffff;box-shadow:0 22px 60px rgba(16,24,40,.10);">
                  <tr>
                    <td style="padding:28px 32px;border-bottom:1px solid #edf1f7;">
                      <img src="https://www.autorell.com/autorell-logo-primary.png" width="138" alt="Autorell" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
                      <div style="margin-top:12px;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">Secure sign-in</div>
                    </td>
                  </tr>
                  <tr><td style="padding:34px 32px 28px;text-align:left;">
                    <h1 style="margin:0;font-size:28px;line-height:1.18;letter-spacing:-1px;color:#101828;">${copy.heading}</h1>
                    <p style="margin:12px 0 0;color:#475467;font-size:15px;line-height:1.7;">${copy.intro}</p>
                    <div style="margin:26px 0 0;border-radius:18px;background:#eef5ff;padding:22px;text-align:center;border:1px solid #cfe0ff;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0866ff;">One-time code</div>
                      <div style="margin-top:10px;font-size:46px;font-weight:800;letter-spacing:10px;color:#101828;">${code}</div>
                    </div>
                    <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">${copy.expiry}</p>
                    <p style="margin:18px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">${copy.ignore}</p>
                  </td></tr>
                  <tr><td style="padding:20px 32px;border-top:1px solid #edf1f7;color:#98a2b3;font-size:12px;line-height:1.6;">Autorell marketplace<br />Europe's trusted marketplace for buying and selling vehicles.</td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    })
    if (sendError) throw sendError

    return NextResponse.json({ success: true, retryAfter: 20 })
  } catch (error) {
    console.error('Email code request failed', error)
    return NextResponse.json(
      { error: 'Koden kunde inte skickas. Försök igen om en stund.' },
      { status: 500 },
    )
  }
}

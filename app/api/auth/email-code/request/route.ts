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
    heading: 'Your sign-in code',
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
          <body style="margin:0;background:#f4f5f7;color:#101828;font-family:Arial,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;">
              <tr><td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #e1e5ec;border-radius:24px;background:#ffffff;">
                  <tr><td style="padding:28px 32px;border-bottom:1px solid #eaecf0;font-size:28px;font-weight:700;color:#0866ff;">autorell</td></tr>
                  <tr><td style="padding:36px 32px;text-align:center;">
                    <div style="font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">${copy.heading}</div>
                    <div style="margin-top:22px;font-size:44px;font-weight:700;letter-spacing:12px;color:#101828;">${code}</div>
                    <p style="margin:24px auto 0;max-width:420px;color:#667085;font-size:15px;line-height:1.7;">${copy.intro}</p>
                    <p style="margin:18px auto 0;max-width:420px;color:#98a2b3;font-size:12px;line-height:1.6;">${copy.expiry}<br />${copy.ignore}</p>
                  </td></tr>
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

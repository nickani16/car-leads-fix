import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const requestWindow = new Map<string, number>()
const REQUEST_COOLDOWN_MS = 60_000

function getHostname(request: Request) {
  return (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
}

function getOrigin(request: Request) {
  const hostname = getHostname(request)

  if (hostname.endsWith('autorell.de')) return 'https://www.autorell.de'
  if (hostname.endsWith('autorell.se')) return 'https://www.autorell.se'
  return 'https://www.autorell.com'
}

function getClientKey(request: Request, email: string) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  return `${ip}:${email}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const previousRequest = requestWindow.get(key)

  if (requestWindow.size > 500) {
    for (const [storedKey, requestedAt] of requestWindow) {
      if (now - requestedAt >= REQUEST_COOLDOWN_MS) {
        requestWindow.delete(storedKey)
      }
    }
  }

  if (previousRequest && now - previousRequest < REQUEST_COOLDOWN_MS) {
    return true
  }

  requestWindow.set(key, now)
  return false
}

export async function POST(request: Request) {
  const genericResponse = NextResponse.json({ success: true })

  try {
    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase() || ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 },
      )
    }

    if (isRateLimited(getClientKey(request, email))) {
      return genericResponse
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('Password recovery email is missing RESEND_API_KEY.')
      return NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503 },
      )
    }

    const origin = getOrigin(request)
    const redirectTo = `${origin}/auth/callback?next=/reset-password`
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (error || !data.properties?.action_link) {
      console.info('Password recovery requested for an unknown account.')
      return genericResponse
    }

    const resend = new Resend(resendKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Autorell <info@autorell.com>',
      to: email,
      subject: 'Reset your Autorell password',
      text: [
        'Reset your Autorell password',
        '',
        'We received a request to reset the password for your dealer account.',
        `Open this secure link to choose a new password: ${data.properties.action_link}`,
        '',
        'The link is temporary and can only be used once.',
        'If you did not request this reset, you can ignore this email.',
        '',
        'Autorell Dealer Network',
      ].join('\n'),
      html: `
        <!doctype html>
        <html>
          <body style="margin:0;background:#f3f2ee;color:#202124;font-family:Arial,sans-serif;">
            <div style="display:none;max-height:0;overflow:hidden;">
              Use this secure link to reset your Autorell dealer password.
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2ee;padding:28px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #deddd7;border-radius:24px;overflow:hidden;">
                    <tr>
                      <td style="background:#202427;padding:30px 34px;color:#ffffff;">
                        <div style="font-size:30px;letter-spacing:-1px;">Autorell</div>
                        <div style="margin-top:8px;color:#b4d9ef;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Dealer Network · Secure account recovery</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:38px 34px;">
                        <div style="display:inline-block;border-radius:999px;background:#e4f3fa;color:#315f74;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Password reset</div>
                        <h1 style="margin:20px 0 0;font-size:32px;line-height:1.15;letter-spacing:-1px;">Choose a new password.</h1>
                        <p style="margin:16px 0 0;color:#64747b;font-size:15px;line-height:1.75;">We received a request to reset the password for your Autorell dealer account. Use the secure button below to continue.</p>
                        <a href="${data.properties.action_link}" style="display:inline-block;margin-top:28px;border-radius:999px;background:#202427;color:#ffffff;text-decoration:none;padding:16px 25px;font-size:14px;font-weight:700;">Reset password</a>
                        <div style="margin-top:28px;border-left:4px solid #b4d9ef;background:#edf6fa;border-radius:0 14px 14px 0;padding:18px 20px;color:#536b76;font-size:13px;line-height:1.7;">
                          This link is temporary and can only be used once. If you did not request a password reset, no action is required.
                        </div>
                        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e7e5df;color:#899196;font-size:11px;line-height:1.7;">
                          Autorell AB · European dealer platform<br />
                          Security messages are sent from info@autorell.com.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (sendError) {
      console.error('Password recovery Resend error:', sendError)
      return genericResponse
    }

    return genericResponse
  } catch (error) {
    console.error('Password recovery route error:', error)
    return NextResponse.json(
      { error: 'Password recovery is temporarily unavailable.' },
      { status: 500 },
    )
  }
}

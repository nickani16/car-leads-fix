import { NextResponse } from 'next/server'
import { Resend } from 'resend'

type ContactLocale = 'sv' | 'de' | 'en'

const marketDetails = {
  sv: {
    code: 'SE',
    domain: 'autorell.se',
    label: 'Sverige',
  },
  de: {
    code: 'DE',
    domain: 'autorell.de',
    label: 'Deutschland',
  },
  en: {
    code: 'EU',
    domain: 'autorell.com',
    label: 'Europe',
  },
} as const

function value(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function singleLine(input: string, maxLength: number) {
  return input.replace(/[\r\n]+/g, ' ').slice(0, maxLength)
}

function getSafeReferer(request: Request, fallback: string) {
  const referer = request.headers.get('referer')
  if (!referer) return fallback

  try {
    const url = new URL(referer)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : fallback
  } catch {
    return fallback
  }
}

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

function getLocale(request: Request, form: FormData): ContactLocale {
  const submittedLocale = value(form, 'locale')
  if (
    submittedLocale === 'sv' ||
    submittedLocale === 'de' ||
    submittedLocale === 'en'
  ) {
    return submittedLocale
  }

  const hostname = getHostname(request)
  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

function getRecipients() {
  return (process.env.CONTACT_TO_EMAIL || 'nikolai.parkkila@outlook.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const name = singleLine(value(form, 'name'), 120)
    const email = value(form, 'email')
    const phone = value(form, 'phone')
    const subject = singleLine(value(form, 'subject'), 160)
    const message = value(form, 'message')
    const privacy = value(form, 'privacy')
    const honeypot = value(form, 'website')

    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    if (!name || !subject || !message || !privacy) {
      return NextResponse.json(
        { error: 'Fyll i alla obligatoriska fält.' },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ange en giltig e-postadress.' },
        { status: 400 },
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Meddelandet är för långt.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Kontaktformuläret är inte konfigurerat ännu.' },
        { status: 503 },
      )
    }

    const locale = getLocale(request, form)
    const market = marketDetails[locale]
    const reference = `AR-${Date.now().toString(36).toUpperCase()}`
    const receivedAt = new Intl.DateTimeFormat('sv-SE', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Stockholm',
    }).format(new Date())
    const referer = getSafeReferer(
      request,
      `https://www.${market.domain}`,
    )
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone || 'Ej angivet')
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />')
    const safeReferer = escapeHtml(referer)

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from:
        process.env.CONTACT_FROM_EMAIL ||
        'Autorell Contact <onboarding@resend.dev>',
      to: getRecipients(),
      replyTo: email,
      subject: `[AUTORELL ${market.code}] Ny kontakt: ${subject} – ${name}`,
      text: [
        `NY KONTAKT VIA AUTORELL ${market.code}`,
        `Referens: ${reference}`,
        `Marknad: ${market.label} (${market.domain})`,
        `Mottaget: ${receivedAt}`,
        `Sida: ${referer}`,
        '',
        `Namn: ${name}`,
        `E-post: ${email}`,
        `Telefon: ${phone || 'Ej angivet'}`,
        `Ämne: ${subject}`,
        '',
        'MEDDELANDE',
        message,
        '',
        `Svara direkt på mejlet för att kontakta ${name}.`,
      ].join('\n'),
      html: `
        <!doctype html>
        <html>
          <body style="margin:0;background:#f3f2ee;color:#202124;font-family:Arial,sans-serif;">
            <div style="display:none;max-height:0;overflow:hidden;">
              ${safeName} har skickat ett nytt meddelande via ${market.domain}.
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2ee;padding:28px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #deddd7;border-radius:24px;overflow:hidden;">
                    <tr>
                      <td style="background:#202427;padding:28px 32px;color:#ffffff;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <div style="font-size:28px;letter-spacing:-1px;">Autorell</div>
                              <div style="margin-top:8px;color:#b4d9ef;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ny kontaktförfrågan</div>
                            </td>
                            <td align="right" valign="top">
                              <span style="display:inline-block;border-radius:999px;background:#b4d9ef;color:#202124;padding:9px 13px;font-size:12px;font-weight:700;">${market.code} · ${market.domain}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <div style="color:#78858b;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">${reference} · ${receivedAt}</div>
                        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;letter-spacing:-0.8px;">${safeSubject}</h1>
                        <p style="margin:10px 0 0;color:#64747b;font-size:15px;line-height:1.7;">Nytt meddelande från <strong style="color:#202124;">${safeName}</strong> via ${market.label}.</p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:26px;background:#f7f6f2;border:1px solid #e3e2dc;border-radius:16px;">
                          <tr>
                            <td style="padding:18px 20px;border-bottom:1px solid #e3e2dc;color:#7b878c;font-size:12px;width:120px;">Namn</td>
                            <td style="padding:18px 20px;border-bottom:1px solid #e3e2dc;font-size:14px;font-weight:700;">${safeName}</td>
                          </tr>
                          <tr>
                            <td style="padding:18px 20px;border-bottom:1px solid #e3e2dc;color:#7b878c;font-size:12px;">E-post</td>
                            <td style="padding:18px 20px;border-bottom:1px solid #e3e2dc;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#315f74;">${safeEmail}</a></td>
                          </tr>
                          <tr>
                            <td style="padding:18px 20px;color:#7b878c;font-size:12px;">Telefon</td>
                            <td style="padding:18px 20px;font-size:14px;">${phone ? `<a href="tel:${safePhone}" style="color:#315f74;">${safePhone}</a>` : safePhone}</td>
                          </tr>
                        </table>

                        <div style="margin-top:24px;border-left:4px solid #b4d9ef;background:#edf6fa;border-radius:0 14px 14px 0;padding:22px 24px;">
                          <div style="color:#66808c;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;">Meddelande</div>
                          <div style="margin-top:12px;font-size:15px;line-height:1.75;">${safeMessage}</div>
                        </div>

                        <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="display:inline-block;margin-top:28px;border-radius:999px;background:#202427;color:#ffffff;text-decoration:none;padding:15px 24px;font-size:14px;font-weight:700;">Svara ${safeName}</a>

                        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e7e5df;color:#899196;font-size:11px;line-height:1.7;">
                          Inskickad från <a href="${safeReferer}" style="color:#567587;">${safeReferer}</a><br />
                          Du kan också svara direkt på detta mejl. Reply-To är satt till kundens e-postadress.
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

    if (error) {
      console.error('Contact email error:', error)
      return NextResponse.json(
        { error: 'Meddelandet kunde inte skickas.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, reference })
  } catch (error) {
    console.error('Contact route error:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod.' },
      { status: 500 },
    )
  }
}

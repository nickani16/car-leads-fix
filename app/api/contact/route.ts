import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function value(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const name = value(form, 'name')
    const email = value(form, 'email')
    const phone = value(form, 'phone')
    const subject = value(form, 'subject')
    const message = value(form, 'message')
    const privacy = value(form, 'privacy')

    if (!name || !subject || !message || !privacy) {
      return NextResponse.json({ error: 'Fyll i alla obligatoriska fält.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ange en giltig e-postadress.' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Meddelandet är för långt.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Kontaktformuläret är inte konfigurerat ännu.' }, { status: 503 })
    }

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || 'Autorell <onboarding@resend.dev>',
      to: process.env.CONTACT_TO_EMAIL || 'info@autorell.com',
      replyTo: email,
      subject: `Kontakt: ${subject} – ${name}`,
      text: [
        `Namn: ${name}`,
        `E-post: ${email}`,
        `Telefon: ${phone || 'Ej angivet'}`,
        `Ämne: ${subject}`,
        '',
        message,
      ].join('\n'),
    })

    if (error) {
      console.error('Contact email error:', error)
      return NextResponse.json({ error: 'Meddelandet kunde inte skickas.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact route error:', error)
    return NextResponse.json({ error: 'Ett oväntat fel uppstod.' }, { status: 500 })
  }
}

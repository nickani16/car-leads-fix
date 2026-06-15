import { NextResponse } from 'next/server'
import { trackConversion } from '@/lib/conversion-tracking'

export async function POST(request: Request) {
  const consent = request.headers
    .get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('autorell_cookie_consent='))
    ?.split('=')[1]

  if (consent !== 'all') {
    return new NextResponse(null, { status: 204 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    eventName?: string
    pageUrl?: string
  }

  if (body.eventName !== 'whatsapp_clicked') {
    return NextResponse.json({ error: 'Unsupported event.' }, { status: 400 })
  }

  await trackConversion(request, {
    eventName: 'whatsapp_clicked',
    pageUrl: body.pageUrl,
  })

  return NextResponse.json({ success: true })
}

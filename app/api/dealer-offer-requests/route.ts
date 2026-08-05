import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

type DealerOfferPayload = {
  vin?: string
  make?: string
  model?: string
  modelYear?: string
  details?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export async function POST(request: Request) {
  const limit = checkRateLimit({
    key: `dealer-offer:${getClientIp(request)}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  let payload: DealerOfferPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig förfrågan.' }, { status: 400 })
  }

  const vin = clean(payload.vin, 17).toUpperCase()
  const make = clean(payload.make, 80)
  const model = clean(payload.model, 80)
  const modelYear = clean(payload.modelYear, 4)
  const details = clean(payload.details, 2200)
  const contactName = clean(payload.contactName, 160)
  const contactEmail = clean(payload.contactEmail, 180).toLowerCase()
  const contactPhone = clean(payload.contactPhone, 60)
  const hasVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(vin)
  const hasManualVehicle = make.length >= 2 && model.length >= 1 && /^\d{4}$/.test(modelYear)
  const hasDetails = details.length >= 10
  const hasContact = contactName.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) && contactPhone.length >= 6

  if (!hasVin && !hasManualVehicle) {
    return NextResponse.json(
      { error: 'Ange ett giltigt VIN eller märke, modell och årsmodell.' },
      { status: 400 },
    )
  }
  if (!hasDetails || !hasContact) {
    return NextResponse.json(
      { error: 'Ange kontaktuppgifter och information om fordonet.' },
      { status: 400 },
    )
  }

  const reference = `DOR-${Date.now().toString(36).toUpperCase()}`
  const admin = createAdminClient()
  const { error } = await admin.from('dealer_vehicle_leads').insert({
    reference,
    vin: hasVin ? vin : null,
    make: make || null,
    model: model || null,
    model_year: modelYear ? Number(modelYear) : null,
    details: details || null,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    status: 'new',
    source_path: safeReferer(request),
  })

  if (error) {
    console.error('dealer_vehicle_leads insert failed', error)
    return NextResponse.json(
      { error: 'Förfrågan kunde inte skickas just nu.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, reference })
}

function clean(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/[\u0000-\u001f]+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function safeReferer(request: Request) {
  const referer = request.headers.get('referer') || ''
  try {
    const url = new URL(referer)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

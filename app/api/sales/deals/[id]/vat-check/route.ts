import { NextResponse } from 'next/server'
import { requireSalesRoute } from '@/lib/sales-route-auth'

function xmlValue(xml: string, tag: string) {
  return (
    xml.match(new RegExp(`<(?:\\w+:)?${tag}>([\\s\\S]*?)</(?:\\w+:)?${tag}>`))?.[1]
      ?.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>') || ''
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireSalesRoute()
  if ('error' in auth) return auth.error

  const body = (await request.json().catch(() => ({}))) as {
    vatNumber?: string
    countryCode?: string
  }
  const countryCode = body.countryCode?.trim().toUpperCase() || ''
  const viesCountryCode = countryCode === 'GR' ? 'EL' : countryCode
  let vatNumber = body.vatNumber?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || ''
  if (
    vatNumber.startsWith(countryCode) ||
    vatNumber.startsWith(viesCountryCode)
  ) {
    vatNumber = vatNumber.slice(2)
  }

  if (!/^[A-Z]{2}$/.test(countryCode) || vatNumber.length < 4) {
    return NextResponse.json(
      { error: 'Enter a valid EU country and VAT number.' },
      { status: 400 }
    )
  }

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soapenv:Body><urn:checkVat><urn:countryCode>${viesCountryCode}</urn:countryCode><urn:vatNumber>${vatNumber}</urn:vatNumber></urn:checkVat></soapenv:Body>
</soapenv:Envelope>`

  let status: 'valid' | 'invalid' | 'unavailable' = 'unavailable'
  let name = ''
  let address = ''
  let requestId = ''

  try {
    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        body: envelope,
        cache: 'no-store',
      }
    )
    const xml = await response.text()
    if (!response.ok || xml.includes('<faultstring>')) throw new Error('VIES unavailable')
    status = xmlValue(xml, 'valid') === 'true' ? 'valid' : 'invalid'
    name = xmlValue(xml, 'name')
    address = xmlValue(xml, 'address')
    requestId = xmlValue(xml, 'requestIdentifier')
  } catch {
    status = 'unavailable'
  }

  const checkedAt = new Date().toISOString()
  const { error } = await auth.adminClient
    .from('contract_parties')
    .update({
      vat_number: `${countryCode}${vatNumber}`,
      vat_validation_status: status,
      vat_validated_at: checkedAt,
      vat_validation_name: name || null,
      vat_validation_address: address || null,
      vat_validation_request_id: requestId || null,
      updated_at: checkedAt,
    })
    .eq('deal_id', id)
    .eq('party_role', 'buyer')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await auth.adminClient.from('contract_events').insert({
    deal_id: id,
    actor_user_id: auth.user.id,
    actor_role: 'sales',
    event_type: 'vat_checked',
    summary:
      status === 'valid'
        ? 'Buyer VAT number verified in VIES'
        : status === 'invalid'
          ? 'Buyer VAT number was not valid in VIES'
          : 'VIES was unavailable during VAT check',
    metadata: { country_code: countryCode, vat_number: vatNumber, status },
  })

  return NextResponse.json({ status, name, address, checkedAt })
}

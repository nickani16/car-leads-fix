import { NextResponse } from 'next/server'

import { getGeoRegions, normalizeGeoCountry } from '@/lib/marketplace-geo'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const country = normalizeGeoCountry(url.searchParams.get('country'))
  const regions = await getGeoRegions(country)

  return NextResponse.json({
    country,
    regions,
  })
}

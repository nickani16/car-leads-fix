import { NextResponse } from 'next/server'

import { normalizeGeoCountry, searchGeoPlaces } from '@/lib/marketplace-geo'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const country = normalizeGeoCountry(url.searchParams.get('country'))
  const region = url.searchParams.get('region') || ''
  const subregion = url.searchParams.get('subregion') || ''
  const query = url.searchParams.get('q') || ''
  const limit = Number(url.searchParams.get('limit') || 20)
  const places = await searchGeoPlaces({
    countryCode: country,
    region,
    subregion,
    query,
    limit,
  })

  return NextResponse.json({
    country,
    places,
  })
}

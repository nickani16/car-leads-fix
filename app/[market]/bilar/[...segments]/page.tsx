import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GeoLandingSearchPage from '@/app/components/GeoLandingSearchPage'
import {
  buildGeoLandingMetadata,
  resolveGeoLandingRoute,
} from '@/lib/seo-geo-landings'

type PageParams = {
  market: string
  segments?: string[]
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { market, segments } = await params
  const landing = await resolveGeoLandingRoute(market, 'bilar', segments)
  return landing ? buildGeoLandingMetadata(landing) : {}
}

export default async function SwedishCarGeoLandingPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { market, segments } = await params
  const landing = await resolveGeoLandingRoute(market, 'bilar', segments)
  if (!landing) notFound()
  return <GeoLandingSearchPage landing={landing} />
}

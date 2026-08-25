import { notFound, redirect } from 'next/navigation'
import {
  buildGeoMarketplaceHref,
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
}) {
  const { market, segments } = await params
  const landing = await resolveGeoLandingRoute(market, 'bilar', segments)
  return landing ? { robots: { index: false, follow: true } } : {}
}

export default async function SwedishCarGeoLandingPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { market, segments } = await params
  const landing = await resolveGeoLandingRoute(market, 'bilar', segments)
  if (!landing) notFound()
  redirect(buildGeoMarketplaceHref(landing))
}

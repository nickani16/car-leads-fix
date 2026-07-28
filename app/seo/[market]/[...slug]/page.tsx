import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import {
  buildGeoMarketplaceHref,
  resolveGeoLandingRoute,
} from '@/lib/seo-geo-landings'
import { isSeoMarketCode, parseSeoRoute } from '@/lib/seo-routes'

type SeoPageProps = {
  params: Promise<{ market: string; slug: string[] }>
}

export async function generateMetadata({ params }: SeoPageProps) {
  const { market, slug } = await params
  await assertInternalSeoRequest()
  const destination = await resolveMarketplaceDestination(market, slug)
  if (!destination) notFound()
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `https://www.autorell.com${destination}` },
  }
}

export default async function SeoLandingPage({ params }: SeoPageProps) {
  const { market, slug } = await params
  await assertInternalSeoRequest()
  const destination = await resolveMarketplaceDestination(market, slug)
  if (!destination) notFound()
  redirect(destination)
}

async function resolveMarketplaceDestination(market: string, slug: string[]) {
  const [categorySlug, ...segments] = slug
  const geoLanding = await resolveGeoLandingRoute(market, categorySlug, segments)
  if (geoLanding) return buildGeoMarketplaceHref(geoLanding)

  if (!isSeoMarketCode(market)) return null
  const route = parseSeoRoute(market, slug)
  return route ? marketplaceHref(route) : null
}

async function assertInternalSeoRequest() {
  const requestHeaders = await headers()
  if (requestHeaders.get('x-autorell-internal-seo') !== '1') {
    notFound()
  }
}

function marketplaceHref(route: NonNullable<ReturnType<typeof parseSeoRoute>>) {
  const params = new URLSearchParams()
  params.set('categories', route.category)
  params.set('markets', route.market.toUpperCase())
  if (route.make) params.set('make', route.make)
  if (route.model) params.set('model', route.model)
  if (route.location) params.set('chips', route.location.name)
  const query = params.toString()
  return `/${route.market}/marketplace/${route.category}${query ? `?${query}` : ''}`
}

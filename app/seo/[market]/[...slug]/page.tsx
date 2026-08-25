import { headers } from 'next/headers'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import MarketplaceCategoryPage from '@/app/marketplace/MarketplaceCategoryPage'
import {
  buildGeoMarketplaceHref,
  buildSeoMarketplaceSearchParams,
  resolveGeoLandingRoute,
} from '@/lib/seo-geo-landings'
import { isSeoMarketCode, parseSeoRoute } from '@/lib/seo-routes'
import { publicUrlForPath } from '@/lib/public-seo'

type SeoPageProps = {
  params: Promise<{ market: string; slug: string[] }>
}

export async function generateMetadata({ params }: SeoPageProps) {
  const { market, slug } = await params
  await assertInternalSeoRequest()
  const [categorySlug, ...segments] = slug
  const landing = await resolveGeoLandingRoute(market, categorySlug, segments)
  if (landing) {
    const canonical = publicUrlForPath(landing.canonicalPath)
    return {
      title: { absolute: landing.title },
      description: landing.description,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        title: landing.title,
        description: landing.description,
        url: canonical,
        siteName: 'Autorell',
        type: 'website',
      },
    }
  }
  const destination = await resolveMarketplaceDestination(market, slug)
  if (!destination) notFound()
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: publicUrlForPath(destination) },
  }
}

export default async function SeoLandingPage({ params }: SeoPageProps) {
  const { market, slug } = await params
  await assertInternalSeoRequest()
  const [categorySlug, ...segments] = slug
  const landing = await resolveGeoLandingRoute(market, categorySlug, segments)
  if (landing) {
    const requestedPath = `/${market}/${slug.join('/')}`
    if (requestedPath !== landing.canonicalPath) permanentRedirect(landing.canonicalPath)
    const structuredData = buildStructuredData(landing)
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
        <MarketplaceCategoryPage
          params={Promise.resolve({ category: landing.category })}
          searchParams={Promise.resolve(buildSeoMarketplaceSearchParams(landing))}
          seoLanding={landing}
        />
      </>
    )
  }
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

function buildStructuredData(landing: NonNullable<Awaited<ReturnType<typeof resolveGeoLandingRoute>>>) {
  const canonical = publicUrlForPath(landing.canonicalPath)
  const siteHost = new URL(canonical).origin
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: landing.h1,
        description: landing.description,
        inLanguage: landing.locale,
        isPartOf: { '@id': `${siteHost}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumbs`,
        itemListElement: landing.breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: publicUrlForPath(item.href),
        })),
      },
    ],
  }
}

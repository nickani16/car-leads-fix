import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { buildSeoLandingJsonLd, getSeoLandingData, normalizeSeoPage, sanitizeJsonLd } from '@/lib/seo-landing-data'
import { isSeoMarketCode, parseSeoRoute } from '@/lib/seo-routes'

type SeoPageProps = {
  params: Promise<{ market: string; slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: SeoPageProps): Promise<Metadata> {
  const { market, slug } = await params
  const resolvedSearchParams = await searchParams
  await assertInternalSeoRequest()
  if (!isSeoMarketCode(market)) notFound()
  const route = parseSeoRoute(market, slug)
  if (!route) notFound()

  const page = normalizeSeoPage(firstSearchParam(resolvedSearchParams.page))
  const data = await getSeoLandingData(route, page)

  return {
    title: { absolute: data.title },
    description: data.description,
    alternates: {
      canonical: data.canonical,
      languages: data.alternateLanguages,
    },
    robots: data.robots,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.canonical,
      siteName: 'Autorell',
      type: 'website',
      images: data.listings[0]?.image ? [{ url: data.listings[0].image }] : undefined,
    },
  }
}

export default async function SeoLandingPage({ params, searchParams }: SeoPageProps) {
  const { market, slug } = await params
  const resolvedSearchParams = await searchParams
  await assertInternalSeoRequest()
  if (!isSeoMarketCode(market)) notFound()
  const route = parseSeoRoute(market, slug)
  if (!route) notFound()

  const page = normalizeSeoPage(firstSearchParam(resolvedSearchParams.page))
  const data = await getSeoLandingData(route, page)
  const jsonLd = buildSeoLandingJsonLd(data)
  const locale = route.market === 'se' ? 'sv' : route.market

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={route.market.toUpperCase()} />
      <div className="mx-auto max-w-[var(--autorell-page-max)] px-4 py-6 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm font-medium text-[#667085]">
          {data.breadcrumbs.map((item, index) => (
            <span key={item.href} className="inline-flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              <Link className="hover:text-[#0866ff]" href={item.href}>
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <section className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0866ff]">
            {data.count} aktiva annonser
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-6xl">
            {data.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-[#475467] sm:text-lg">
            {data.intro}
          </p>
          {!data.robots.index ? (
            <p className="mt-4 max-w-3xl rounded-[8px] border border-[#dfe6f2] bg-white px-4 py-3 text-sm font-medium text-[#667085]">
              Sidan fungerar för användare men markeras som noindex tills den har minst {data.minIndexableCount} relevanta aktiva annonser.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="seo-listings-title" className="py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="seo-listings-title" className="text-2xl font-semibold tracking-[-0.02em]">
                Senaste annonserna
              </h2>
              <p className="mt-1 text-sm font-medium text-[#667085]">
                Första sidan renderas direkt i HTML för sökmotorer och användare.
              </p>
            </div>
            <Link
              href={marketplaceHref(route)}
              className="inline-flex h-10 items-center rounded-[8px] bg-[#0866ff] px-4 text-sm font-semibold text-white"
            >
              Öppna filter
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.listings.map((listing) => (
              <Link
                key={listing.id}
                href={listing.href}
                className="group overflow-hidden rounded-[8px] border border-[#dfe6f2] bg-white shadow-sm transition hover:border-[#b8c7dc]"
              >
                <div className="relative aspect-[4/3] bg-[#edf3f9]">
                  {listing.image ? (
                    <Image
                      src={listing.image}
                      alt={`${listing.title} på Autorell`}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-[#667085]">
                      Autorell
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-semibold leading-6 group-hover:text-[#0866ff]">
                    {listing.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#667085]">
                    {[listing.modelYear, listing.mileageKm ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null, listing.city || listing.municipality].filter(Boolean).join(' | ')}
                  </p>
                  {listing.price ? <p className="mt-3 text-lg font-semibold">{listing.price}</p> : null}
                </div>
              </Link>
            ))}
          </div>

          {!data.listings.length ? (
            <div className="mt-5 rounded-[8px] border border-[#dfe6f2] bg-white p-6 text-sm font-medium text-[#667085]">
              Det finns inga aktiva annonser för den här permanenta sökningen just nu.
            </div>
          ) : null}

          {(data.pagination.previousHref || data.pagination.nextHref) ? (
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {data.pagination.previousHref ? (
                <Link
                  href={data.pagination.previousHref}
                  className="rounded-[8px] border border-[#dfe6f2] bg-white px-4 py-2 text-sm font-semibold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]"
                >
                  FÃ¶regÃ¥ende sida
                </Link>
              ) : null}
              <span className="text-sm font-medium text-[#667085]">
                Sida {data.pagination.currentPage} av {data.pagination.totalPages}
              </span>
              {data.pagination.nextHref ? (
                <Link
                  href={data.pagination.nextHref}
                  className="rounded-[8px] border border-[#dfe6f2] bg-white px-4 py-2 text-sm font-semibold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]"
                >
                  NÃ¤sta sida
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>

        <section aria-labelledby="seo-links-title" className="py-8">
          <h2 id="seo-links-title" className="text-2xl font-semibold tracking-[-0.02em]">
            Relaterade sökningar
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[8px] border border-[#dfe6f2] bg-white px-3 py-2 text-sm font-semibold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
      <PublicFooter locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
    </main>
  )
}

async function assertInternalSeoRequest() {
  const requestHeaders = await headers()
  if (requestHeaders.get('x-autorell-internal-seo') !== '1') {
    notFound()
  }
}

function marketplaceHref(route: NonNullable<ReturnType<typeof parseSeoRoute>>) {
  const params = new URLSearchParams()
  if (route.category !== 'vehicles') params.set('categories', route.category)
  if (route.make) params.set('make', route.make)
  if (route.model) params.set('model', route.model)
  if (route.location?.type === 'city') params.set('city', route.location.name)
  if (route.location?.type === 'municipality') params.set('municipality', route.location.name.replace(/\s+kommun$/i, ''))
  const query = params.toString()
  return `/${route.market}/marketplace${query ? `?${query}` : ''}`
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

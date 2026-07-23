import 'server-only'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Building2,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import { getMarketplaceCategory, marketplaceLanguage, type MarketplaceCategorySlug } from '@/lib/marketplace'
import { localizePublicHref, translatePublic, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { getRequestLocale } from '@/lib/request-locale'
import { createAdminClient } from '@/lib/supabase/admin'

type CompanyRouteParams = Promise<{ id: string; market?: string }>
type CompanySearchParams = Promise<{ [key: string]: string | string[] | undefined }>

type CompanyProfile = {
  user_id: string
  company_id: string | null
  account_type: string | null
  display_name: string | null
  email: string | null
  phone: string | null
  country_code: string | null
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  website_url: string | null
  logo_url: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  business_verification_status: string | null
  created_at: string | null
}

type CompanyContact = {
  id: string
  name: string | null
  registration_number: string | null
  vat_number: string | null
  country_code: string | null
  website_url: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  postal_code: string | null
  city: string | null
  region: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
}

type CompanySubscription = {
  plan_key: string | null
  status: string | null
  manually_activated: boolean | null
  free_period_ends_at: string | null
  active_listing_limit: number | null
  updated_at: string | null
}

type CompanyListing = {
  id: string
  category: MarketplaceCategorySlug
  title: string
  make: string | null
  model: string | null
  model_year: number | string | null
  mileage_km: number | string | null
  operating_hours: number | string | null
  fuel_type: string | null
  gearbox: string | null
  country_code: string | null
  city: string | null
  municipality: string | null
  price: number | string | null
  currency: string | null
  images: string[] | null
  seller_user_id: string | null
  published_at: string | null
  sort_refreshed_at: string | null
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const activeSubscriptionStatuses = new Set(['active', 'trialing'])
const paidBusinessPlans = new Set(['starter', 'growth', 'professional', 'enterprise'])

const baseCopy = {
  companyPage: 'Company page',
  verifiedCompany: 'Verified company',
  unverifiedCompany: 'Company',
  businessSeller: 'Business seller',
  listings: 'Listings',
  activeListings: 'Active listings',
  memberSince: 'Member since',
  contact: 'Contact',
  address: 'Address',
  website: 'Website',
  phone: 'Phone',
  email: 'Email',
  organization: 'Registration',
  map: 'Map',
  openMap: 'Open in Google Maps',
  allListings: 'All listings',
  searchPlaceholder: 'Search this companys listings',
  searchButton: 'Search',
  clearSearch: 'Clear',
  allCategories: 'All categories',
  noListings: 'No published listings match this search.',
  viewListing: 'View listing',
  reviews: 'reviews',
  noReviews: 'No reviews yet',
  profileIntro: 'Company details, contact information and published listings are gathered here so buyers can review the seller before making contact.',
}

export async function generateCompanyMetadata({
  params,
}: {
  params: CompanyRouteParams
}): Promise<Metadata> {
  const { id } = await params
  const locale = await getRequestLocale()
  const data = await getPublicCompanyPageData(id)
  if (!data) {
    return {
      title: 'Företag hittades inte | Autorell',
      robots: { index: false, follow: true },
    }
  }

  const title = `${data.company?.name || data.profile.company_name || data.profile.display_name || 'Företag'} | Autorell`
  const location = formatCompanyLocation(data.company, data.profile, locale)
  const description = [
    data.company?.name || data.profile.company_name,
    location,
    `${data.listings.length} ${translatePublic(locale, baseCopy.activeListings).toLowerCase()}`,
  ].filter(Boolean).join(' | ')
  const canonicalPath = localizePublicHref(locale, `/company/${data.profile.user_id}`)
  const canonical = `https://www.autorell.com${canonicalPath}`
  const image = data.profile.logo_url || data.listings[0]?.images?.[0] || undefined

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
  }
}

export default async function PublicCompanyPage({
  params,
  searchParams,
}: {
  params: CompanyRouteParams
  searchParams: CompanySearchParams
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const locale = await getRequestLocale()
  const copy = translatePublicObject(locale, baseCopy)
  const data = await getPublicCompanyPageData(id)
  if (!data) notFound()

  const q = getSearchValue(resolvedSearchParams, 'q')
  const selectedCategory = getSearchValue(resolvedSearchParams, 'category')
  const company = data.company
  const displayCurrency = displayCurrencyForMarket((company?.country_code || data.profile.country_code) || undefined)
  const companyName = company?.name || data.profile.company_name || data.profile.display_name || copy.businessSeller
  const address = formatCompanyAddress(company, data.profile)
  const location = formatCompanyLocation(company, data.profile, locale)
  const contactEmail = resolveCompanyContactEmail(data.profile, company)
  const contactPhone = resolveCompanyContactPhone(data.profile, company)
  const companyRegistration = uniqueValues(company?.registration_number, company?.vat_number, data.profile.registration_number, data.profile.vat_number)
  const categories = categoryCounts(data.listings, locale)
  const filteredListings = filterCompanyListings(data.listings, q, selectedCategory)
  const visibleListings = await Promise.all(
    filteredListings.map(async (listing) => ({
      listing,
      href: buildListingPath({
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        model_year: listing.model_year,
        city: listing.city,
        country_code: listing.country_code,
      }, locale),
      price: await formatMarketplacePriceDisplay({
        amount: Number(listing.price || 0),
        currency: listing.currency || 'EUR',
        locale,
        targetCurrency: displayCurrency,
      }),
    })),
  )
  const verificationLabel = isVerifiedCompany(data.profile)
    ? copy.verifiedCompany
    : copy.unverifiedCompany
  const mapHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null
  const websiteHref = normalizeWebsiteUrl(company?.website_url || data.profile.website_url)

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={data.profile.country_code || undefined} />

      <section className="border-b border-[#dfe6f2] bg-white">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">{copy.companyPage}</p>
            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              <CompanyLogo logoUrl={data.profile.logo_url} companyName={companyName} />
              <div className="min-w-0">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#101828] sm:text-5xl">
                  {companyName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#475467]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1.5 text-[#0866ff]">
                    <ShieldCheck className="h-4 w-4" />
                    {verificationLabel}
                  </span>
                  {location ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ef] bg-white px-3 py-1.5">
                      <MapPin className="h-4 w-4 text-[#0866ff]" />
                      {location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#475467]">{copy.profileIntro}</p>
          </div>

          <aside className="rounded-[16px] border border-[#d9e2ef] bg-[#fbfdff] p-5">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryStat label={copy.activeListings} value={data.listings.length.toLocaleString(countLocale(locale))} />
              <SummaryStat label={copy.memberSince} value={formatYear(data.profile.created_at)} />
            </dl>
          </aside>
        </div>
      </section>

      <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:py-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <h2 className="text-lg font-semibold tracking-[-0.025em]">{copy.contact}</h2>
            <div className="mt-4 grid gap-3 text-sm font-medium text-[#475467]">
              {address ? <ContactLine icon={MapPin} label={copy.address} value={address} href={mapHref} /> : null}
              {websiteHref ? <ContactLine icon={Globe2} label={copy.website} value={displayWebsite(company?.website_url || data.profile.website_url)} href={websiteHref} external /> : null}
              {contactPhone ? <ContactLine icon={Phone} label={copy.phone} value={contactPhone} href={`tel:${contactPhone.replace(/\s+/g, '')}`} /> : null}
              {contactEmail ? <ContactLine icon={Mail} label={copy.email} value={contactEmail} href={`mailto:${contactEmail}`} /> : null}
              {companyRegistration.length ? (
                <ContactLine
                  icon={Building2}
                  label={copy.organization}
                  value={companyRegistration.join(' | ')}
                />
              ) : null}
            </div>
            {data.ratingCount ? (
              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-1.5 text-sm font-semibold text-[#0866ff]">
                <Star className="h-4 w-4" fill="currentColor" />
                {data.ratingAverage?.toLocaleString(countLocale(locale), { maximumFractionDigits: 1 })} ({data.ratingCount} {copy.reviews})
              </p>
            ) : (
              <p className="mt-5 text-sm font-semibold text-[#667085]">{copy.noReviews}</p>
            )}
          </section>

          {address ? (
            <section className="mt-4 overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#edf1f6] px-5 py-4">
                <h2 className="text-lg font-semibold tracking-[-0.025em]">{copy.map}</h2>
                {mapHref ? (
                  <a href={mapHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#0866ff]">
                    {copy.openMap}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
              <a
                href={mapHref || undefined}
                target="_blank"
                rel="noreferrer"
                className="relative block h-[240px] overflow-hidden bg-[#e8eef6]"
              >
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,102,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(8,102,255,.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <span className="absolute left-0 right-0 top-1/2 h-px bg-[#c7d4e6]" />
                <span className="absolute bottom-0 top-0 left-1/2 w-px bg-[#c7d4e6]" />
                <span className="absolute inset-x-5 top-5 rounded-[14px] border border-[#d9e2ef] bg-white/95 p-4 shadow-sm">
                  <span className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#0866ff] text-white">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#101828]">{companyName}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#667085]">{address}</span>
                    </span>
                  </span>
                </span>
                <span className="absolute bottom-5 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full bg-[#0866ff] text-white shadow-[0_12px_28px_rgba(8,102,255,.28)]">
                  <MapPin className="h-5 w-5" />
                </span>
              </a>
            </section>
          ) : null}

          <section className="mt-4 rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <h2 className="text-lg font-semibold tracking-[-0.025em]">{copy.allCategories}</h2>
            <div className="mt-4 grid gap-2">
              <FilterLink href={companyFilterHref(locale, data.profile.user_id, q, '')} active={!selectedCategory} label={`${copy.allCategories} (${data.listings.length})`} />
              {categories.map((category) => (
                <FilterLink
                  key={category.slug}
                  href={companyFilterHref(locale, data.profile.user_id, q, category.slug)}
                  active={selectedCategory === category.slug}
                  label={`${category.label} (${category.count})`}
                />
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="border-b border-[#edf1f6] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.035em]">{copy.allListings}</h2>
                <p className="mt-1 text-sm font-medium text-[#667085]">
                  {visibleListings.length.toLocaleString(countLocale(locale))} / {data.listings.length.toLocaleString(countLocale(locale))}
                </p>
              </div>
              <form action={localizePublicHref(locale, `/company/${data.profile.user_id}`)} className="flex min-w-0 gap-2">
                {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
                <label className="relative min-w-0 flex-1 lg:w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                  <style>{`
                    .company-listing-search {
                      color: #101828 !important;
                    }
                    .company-listing-search::placeholder {
                      color: transparent !important;
                      opacity: 0 !important;
                    }
                    .company-listing-search + .company-listing-search-placeholder {
                      display: none;
                    }
                    .company-listing-search:placeholder-shown + .company-listing-search-placeholder {
                      display: block;
                    }
                  `}</style>
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder=" "
                    className="company-listing-search h-11 w-full rounded-[10px] border border-[#d9e2ef] bg-white pl-10 pr-3 text-sm font-medium outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                  />
                  <span className="company-listing-search-placeholder pointer-events-none absolute left-10 top-1/2 max-w-[calc(100%-3.5rem)] -translate-y-1/2 truncate text-sm font-medium text-[#98a2b3]">
                    {copy.searchPlaceholder}
                  </span>
                </label>
                <button type="submit" className="h-11 rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">
                  {copy.searchButton}
                </button>
                {q || selectedCategory ? (
                  <Link href={localizePublicHref(locale, `/company/${data.profile.user_id}`)} className="hidden h-11 items-center rounded-[10px] border border-[#d9e2ef] px-4 text-sm font-bold text-[#475467] sm:inline-flex">
                    {copy.clearSearch}
                  </Link>
                ) : null}
              </form>
            </div>
          </div>

          {visibleListings.length ? (
            <div className="divide-y divide-[#edf1f6]">
              {visibleListings.map(({ listing, href, price }) => (
                <Link key={listing.id} href={href} className="grid gap-4 p-4 transition hover:bg-[#fbfdff] sm:grid-cols-[190px_minmax(0,1fr)_auto] sm:p-5">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-[#eef3f8]">
                    {listing.images?.[0] ? (
                      <Image src={listing.images[0]} alt={listing.title} fill sizes="220px" quality={78} className="object-contain" />
                    ) : (
                      <span className="grid h-full place-items-center text-[#0866ff]">
                        <Building2 className="h-10 w-10" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold tracking-[-0.02em] text-[#101828]">{listing.title}</span>
                    <span className="mt-1 block text-sm font-medium text-[#667085]">
                      {[categoryLabel(listing.category, locale), listing.city, getEuCountryName(listing.country_code || '', locale)].filter(Boolean).join(' | ')}
                    </span>
                    <span className="mt-3 block text-sm font-medium text-[#475467]">
                      {[listing.model_year, listing.mileage_km ? `${Number(listing.mileage_km).toLocaleString(countLocale(locale))} km` : null, listing.operating_hours ? `${Number(listing.operating_hours).toLocaleString(countLocale(locale))} h` : null, listing.fuel_type, listing.gearbox].filter(Boolean).join(' | ')}
                    </span>
                  </span>
                  <span className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="text-lg font-semibold text-[#101828]">{price.label}</span>
                    <span className="inline-flex min-h-10 items-center rounded-[10px] border border-[#c9d7ec] px-3 text-sm font-bold text-[#0866ff]">
                      {copy.viewListing}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm font-semibold text-[#667085]">{copy.noListings}</div>
          )}
        </section>
      </div>

      <PublicFooter locale={locale} />
    </main>
  )
}

export async function getPublicCompanyPageData(id: string) {
  if (!uuidPattern.test(id)) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('user_id,company_id,account_type,display_name,email,phone,country_code,company_name,registration_number,vat_number,website_url,logo_url,address_line_1,address_line_2,city,region,postal_code,business_verification_status,created_at')
    .eq('user_id', id)
    .maybeSingle<CompanyProfile>()

  if (!profile || profile.account_type !== 'business') return null

  const companyUserIds = await getCompanyUserIds(profile)
  const [{ data: company }, { data: subscriptions }, { data: listings }, { data: reviews }] = await Promise.all([
    profile.company_id
      ? admin
          .from('marketplace_companies')
          .select('id,name,registration_number,vat_number,country_code,website_url,phone,address_line_1,address_line_2,postal_code,city,region,contact_name,contact_email,contact_phone')
          .eq('id', profile.company_id)
          .maybeSingle<CompanyContact>()
      : Promise.resolve({ data: null }),
    admin
      .from('business_subscriptions')
      .select('plan_key,status,manually_activated,free_period_ends_at,active_listing_limit,updated_at')
      .in('user_id', companyUserIds)
      .order('updated_at', { ascending: false }),
    admin
      .from('marketplace_listings')
      .select('id,category,title,make,model,model_year,mileage_km,operating_hours,fuel_type,gearbox,country_code,city,municipality,price,currency,images,seller_user_id,published_at,sort_refreshed_at')
      .in('seller_user_id', companyUserIds)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('sort_refreshed_at', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false })
      .limit(240),
    admin
      .from('marketplace_reviews')
      .select('rating')
      .in('reviewee_id', companyUserIds)
      .eq('status', 'visible'),
  ])

  const subscription = ((subscriptions || []) as CompanySubscription[]).find(isStarterOrHigherActiveSubscription)
  if (!subscription) return null

  const ratings = (reviews || [])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating))
  const ratingCount = ratings.length
  const ratingAverage = ratingCount
    ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratingCount) * 10) / 10
    : null

  return {
    profile,
    company: company || null,
    subscription,
    companyUserIds,
    listings: ((listings || []) as CompanyListing[]).map((listing) => ({
      ...listing,
      category: listing.category || 'cars',
    })),
    ratingAverage,
    ratingCount,
  }
}

async function getCompanyUserIds(profile: CompanyProfile) {
  if (!profile.company_id) return [profile.user_id]
  const { data } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id')
    .eq('company_id', profile.company_id)
    .eq('account_type', 'business')

  const ids = (data || []).map((row) => String(row.user_id || '')).filter(Boolean)
  return ids.length ? [...new Set(ids)] : [profile.user_id]
}

function isStarterOrHigherActiveSubscription(subscription: CompanySubscription) {
  const plan = String(subscription.plan_key || '').toLowerCase()
  const status = String(subscription.status || '').toLowerCase()
  const freePeriodActive = Boolean(subscription.free_period_ends_at && new Date(subscription.free_period_ends_at).getTime() > Date.now())
  return paidBusinessPlans.has(plan) && (activeSubscriptionStatuses.has(status) || subscription.manually_activated || freePeriodActive)
}

function filterCompanyListings(listings: CompanyListing[], q: string, category: string) {
  const normalizedQuery = q.trim().toLowerCase()
  return listings.filter((listing) => {
    if (category && listing.category !== category) return false
    if (!normalizedQuery) return true
    return [
      listing.title,
      listing.make,
      listing.model,
      listing.model_year,
      listing.city,
      listing.municipality,
      listing.fuel_type,
      listing.gearbox,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery)
  })
}

function categoryCounts(listings: CompanyListing[], locale: PublicLocale) {
  const counts = new Map<string, number>()
  for (const listing of listings) {
    counts.set(listing.category, (counts.get(listing.category) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count, label: categoryLabel(slug, locale) }))
    .sort((a, b) => a.label.localeCompare(b.label, countLocale(locale)))
}

function categoryLabel(slug: string, locale: PublicLocale) {
  const category = getMarketplaceCategory(slug)
  const language = marketplaceLanguage(locale)
  return locale === 'sv' || locale === 'de' || locale === 'en'
    ? category.labels[language]
    : translatePublic(locale, category.labels.en)
}

function CompanyLogo({ logoUrl, companyName }: { logoUrl: string | null; companyName: string }) {
  if (logoUrl) {
    return (
      <span className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white shadow-sm">
        <Image src={logoUrl} alt={companyName} fill sizes="96px" className="object-contain p-3" />
      </span>
    )
  }
  return (
    <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[16px] border border-[#d9e2ef] bg-[#eef5ff] text-3xl font-semibold text-[#0866ff]">
      {initials(companyName)}
    </span>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#667085]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#101828]">{value}</dd>
    </div>
  )
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: typeof MapPin
  label: string
  value: string
  href?: string | null
  external?: boolean
}) {
  const content = (
    <>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0866ff]" />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">{label}</span>
        <span className="mt-0.5 block break-words text-[#344054]">{value}</span>
      </span>
      {external ? <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-[#98a2b3]" /> : null}
    </>
  )

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="flex min-w-0 gap-3 rounded-[10px] border border-transparent p-2 transition hover:border-[#d9e2ef] hover:bg-[#fbfdff]">
        {content}
      </a>
    )
  }

  return <div className="flex min-w-0 gap-3 p-2">{content}</div>
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`flex min-h-10 items-center rounded-[10px] px-3 text-sm font-semibold transition ${active ? 'bg-[#0866ff] text-white' : 'bg-[#f8fafc] text-[#475467] hover:bg-[#eef5ff] hover:text-[#0866ff]'}`}>
      {label}
    </Link>
  )
}

function companyFilterHref(locale: PublicLocale, userId: string, q: string, category: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (q) params.set('q', q)
  const query = params.toString()
  return localizePublicHref(locale, `/company/${userId}${query ? `?${query}` : ''}`)
}

function getSearchValue(searchParams: Awaited<CompanySearchParams>, key: string) {
  const value = searchParams[key]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '').trim()
}

function isVerifiedCompany(profile: CompanyProfile) {
  return ['verified', 'vat_validated'].includes(String(profile.business_verification_status || ''))
}

function formatCompanyAddress(company: CompanyContact | null, profile: CompanyProfile) {
  return [
    company?.address_line_1 || profile.address_line_1,
    company?.address_line_2 || profile.address_line_2,
    [company?.postal_code || profile.postal_code, company?.city || profile.city].filter(Boolean).join(' '),
    company?.region || profile.region,
    company?.country_code || profile.country_code,
  ].filter(Boolean).join(', ')
}

function formatCompanyLocation(company: CompanyContact | null, profile: CompanyProfile, locale: PublicLocale) {
  const countryCode = company?.country_code || profile.country_code || ''
  return [company?.city || profile.city, getEuCountryName(countryCode, locale)].filter(Boolean).join(', ')
}

function resolveCompanyContactEmail(profile: CompanyProfile, company: CompanyContact | null) {
  const contactEmail = company?.contact_email?.trim()
  if (contactEmail && contactEmail.toLowerCase() !== String(profile.email || '').toLowerCase()) return contactEmail
  return infoEmailFromWebsite(company?.website_url || profile.website_url)
}

function resolveCompanyContactPhone(profile: CompanyProfile, company: CompanyContact | null) {
  const contactPhone = company?.contact_phone?.trim()
  const companyPhone = company?.phone?.trim()
  const sellerPhone = String(profile.phone || '').replace(/\s+/g, '')
  if (contactPhone && contactPhone.replace(/\s+/g, '') !== sellerPhone) return contactPhone
  if (companyPhone && companyPhone.replace(/\s+/g, '') !== sellerPhone) return companyPhone
  return null
}

function infoEmailFromWebsite(value: string | null) {
  const url = normalizeWebsiteUrl(value)
  if (!url) return null
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname ? `info@${hostname}` : null
  } catch {
    return null
  }
}

function uniqueValues(...values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const clean = String(value || '').trim()
    if (!clean) continue
    const key = clean.replace(/\s+/g, '').toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(clean)
  }
  return result
}

function normalizeWebsiteUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.toString()
  } catch {
    return null
  }
}

function displayWebsite(value: string | null) {
  if (!value) return ''
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || 'A') + (parts[1]?.[0] || '')
}

function formatYear(value: string | null) {
  if (!value) return '-'
  const year = new Date(value).getFullYear()
  return Number.isFinite(year) ? String(year) : '-'
}

function countLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de' || locale === 'at') return 'de-DE'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  return locale
}

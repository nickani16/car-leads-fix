import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Globe2,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
} from 'lucide-react'
import {
  categoryLandingCopy,
  getCategoryLanding,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import { getRequestLocale } from '@/lib/request-locale'
import SavedListingButton from './SavedListingButton'
import {
  normalizeMarketplaceCategory,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { activeMarketCountryCodes, getEuCountryName } from '@/lib/eu-countries'
import { defaultSearchCountryForLocale } from '@/lib/market-locale'
import { buildListingSpecChips, formatMileageAsMil } from '@/lib/listing-display'
import { buildListingPath } from '@/lib/listing-url'
import {
  getFeaturedMarketplaceCategoryListings,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import CategoryHeroSearch from './CategoryHeroSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import CountryFlag from './CountryFlag'
import ListingCardImageCarousel from './ListingCardImageCarousel'

type LandingTopListing = {
  id: string
  title: string
  meta: string
  countryCode: string
  price: string
  imageUrl: string | null
  imageUrls: string[]
  tag: string
  fuelType: string | null
  gearbox: string | null
  mileageKm: number | null
  modelYear: number | null
  isFeatured: boolean
  isTopPlacement: boolean
}

type TypeCard = {
  label: Record<'sv' | 'en' | 'de', string>
  query: string
  image: string
  aliases: readonly string[]
}

export async function generateCategoryLandingMetadata(
  slug: MarketplaceCategorySlug,
): Promise<Metadata> {
  const locale = await getRequestLocale()
  const config = getCategoryLanding(slug)
  const origin = 'https://www.autorell.com'
  const canonical = `${origin}${config.path}`
  const seo = getCategorySeoContent(slug, locale)
  const title = seo.title
  const description = seo.description

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
      images: [{ url: config.heroImage }],
    },
  }
}

export default async function CategoryLandingPage({
  slug,
}: {
  slug: MarketplaceCategorySlug
}) {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const displayCurrency = displayCurrencyForMarket(
    marketCode || defaultSearchCountryForLocale(locale),
  )
  const language = locale === 'de' ? 'de' : locale === 'sv' ? 'sv' : 'en'
  const requestedMarketCode = (marketCode || '').toUpperCase()
  const localCountryCode = activeMarketCountryCodes.has(requestedMarketCode)
    ? requestedMarketCode
    : defaultSearchCountryForLocale(locale)
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const copy = categoryLandingCopy(locale)
  const page = pageCopy(locale, slug, localized.label, localized.singular)
  const typeCards = getTypeCards(slug)
  const { topListings, typeCounts, totalListings } = await getLandingListings(
    slug,
    locale,
    typeCards,
    displayCurrency,
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceChannel={{ label: localized.label, slug }}
      />

      <section className="bg-white pt-0 sm:pt-6">
        <div className="relative mx-auto max-w-[var(--autorell-page-max)]">
          <div className="px-0 sm:px-8">
            <div className="relative min-h-[250px] overflow-hidden rounded-none bg-white sm:min-h-[330px] sm:rounded-[22px] lg:min-h-[290px]">
              <Image
                src={config.heroImage}
                alt={localized.label}
                fill
                priority
                sizes="100vw"
                className={`object-cover object-center ${slug === 'cars' ? 'brightness-[.98] saturate-[1.03] sm:brightness-[1.08]' : 'sm:scale-[1.03]'}`}
                style={{ objectPosition: config.heroPosition }}
              />
              <div className={`absolute inset-0 ${slug === 'cars' ? 'bg-[linear-gradient(90deg,rgba(3,10,26,.34)_0%,rgba(3,10,26,.2)_38%,rgba(3,10,26,.05)_100%)] sm:bg-[linear-gradient(90deg,rgba(3,10,26,.16)_0%,rgba(3,10,26,.075)_28%,rgba(3,10,26,.016)_56%,rgba(3,10,26,0)_100%)]' : 'bg-[linear-gradient(90deg,rgba(3,10,26,.12)_0%,rgba(3,10,26,.065)_31%,rgba(3,10,26,.015)_58%,rgba(3,10,26,0)_100%)] sm:bg-[linear-gradient(90deg,rgba(3,10,26,.08)_0%,rgba(3,10,26,.045)_34%,rgba(3,10,26,.01)_60%,rgba(3,10,26,0)_100%)]'}`} />

              <div className="relative mx-auto flex min-h-[250px] max-w-[390px] flex-col justify-center px-5 py-7 min-[430px]:max-w-[430px] sm:min-h-[330px] sm:max-w-[var(--autorell-page-max)] sm:px-8 sm:py-10 lg:min-h-[290px] lg:py-8">
                <h1 className="max-w-[350px] text-[28px] leading-[.99] tracking-[-0.035em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,.36)] sm:max-w-[720px] sm:text-[40px] sm:tracking-[-0.045em] lg:max-w-[790px] lg:text-[45px]">
                  {page.heroTitle}
                </h1>
                <p className="mt-4 max-w-[700px] text-[14px] font-[350] leading-snug text-white [text-shadow:0_3px_18px_rgba(0,0,0,.28)] sm:text-[16px] lg:text-[17px]">
                  {page.heroTypingPrefix}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-[34px] max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:-mt-[43px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
            <div className="sm:px-16 lg:px-28 xl:px-32">
              <CategoryHeroSearch
                locale={locale}
                slug={slug}
                defaultCountry={marketCode}
                labels={{
                  make: page.make,
                  makePlaceholder: page.allMakes,
                  model: page.model,
                  modelPlaceholder: page.allModels,
                  price: page.price,
                  anyPrice: page.anyPrice,
                  minPrice: page.minPrice,
                  maxPrice: page.maxPrice,
                  clear: page.clearFilter,
                  apply: page.applyFilter,
                  location: page.location,
                  allEurope: copy.allEurope,
                  search: page.searchCta,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto w-full px-4 min-[430px]:max-w-[430px] min-[430px]:px-5 sm:max-w-[var(--autorell-page-max)] sm:px-8">
          <SectionHeader title={page.topRatedTitle} cta={page.viewAll} href={localizePublicHref(locale, `/marketplace/${slug}`)} />
          {topListings.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {topListings.slice(0, 6).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <EmptyListings copy={page} slug={slug} locale={locale} />
          )}
          <div className="mt-8 flex justify-center">
            <Link
              href={localizePublicHref(locale, `/marketplace/${slug}`)}
              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#b8cffd] px-6 text-sm font-bold text-[#0866ff]"
            >
              {page.viewAll}
            </Link>
          </div>
        </div>
      </section>

      <section id="browse-by-type" className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
          <SectionHeader title={page.browseByType} cta={page.moreTypes} href={localizePublicHref(locale, `/marketplace/${slug}`)} />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {typeCards.map((type) => (
              <Link
                key={type.query}
                href={localizePublicHref(locale, `/marketplace/${slug}?filter=${encodeURIComponent(type.query)}`)}
                className="group relative min-h-[128px] overflow-hidden rounded-[10px] border border-[#dfe6f2] bg-white p-4 shadow-sm transition-colors hover:border-[#344054]"
              >
                <strong className="relative z-10 block text-sm font-bold text-[#101828]">
                  {locale === 'sv' || locale === 'de' || locale === 'en'
                    ? type.label[language]
                    : translatePublic(locale, type.label.en)}
                </strong>
                <span className="relative z-10 mt-1 block text-xs font-semibold text-[#667085]">
                  {typeCounts[type.query] || 0} {page.listings}
                </span>
                <Image
                  src={type.image}
                  alt=""
                  width={180}
                  height={120}
                  className="absolute bottom-0 right-0 h-[94px] w-[134px] object-contain"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
          <div className="relative overflow-hidden rounded-[18px] bg-[#061b42] text-white">
            <Image
              src={config.heroImage}
              alt=""
              fill
              sizes="1280px"
              className="object-cover opacity-45"
              style={{ objectPosition: config.heroPosition }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,27,66,.98)_0%,rgba(6,27,66,.82)_45%,rgba(6,27,66,.22)_100%)]" />
            <div className="relative px-6 py-10 sm:px-12">
              <h2 className="max-w-[520px] text-3xl leading-[1.04] tracking-[-0.045em] sm:text-[40px]">
                {page.sellTitle}
              </h2>
              <p className="mt-3 text-sm text-white/82">{page.sellText}</p>
              <Link
                href={localizePublicHref(locale, `/sell-vehicle?category=${slug}`)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-white px-5 text-sm font-bold text-[#0866ff]"
              >
                {page.sellCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto grid max-w-[390px] gap-4 px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[#dfe6f2] bg-white p-6 shadow-sm">
            <h2 className="text-2xl tracking-[-0.04em]">{page.whyTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#667085]">{page.whyText}</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {page.why.map((item, index) => {
                const Icon = [BadgeCheck, LockKeyhole, Globe2][index] || ShieldCheck
                return (
                  <div key={item.title}>
                    <Icon className="h-5 w-5 text-[#0866ff]" />
                    <strong className="mt-3 block text-sm">{item.title}</strong>
                    <p className="mt-2 text-xs leading-5 text-[#667085]">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#dfe6f2] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl tracking-[-0.04em]">{page.countryTitle}</h2>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  <CountryFlag code={localCountryCode ? localCountryCode.toLowerCase() : 'eu'} className="h-[18px] w-[27px]" />
                  {localCountryCode ? getEuCountryName(localCountryCode, locale) : copy.allEurope}
                </p>
              </div>
              <Link href="#market-selector" className="text-xs font-bold text-[#0866ff]">
                {page.changeCountry}
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <CountryMetric value={String(totalListings)} label={page.newToday} />
              <CountryMetric value="0" label={page.priceDrops} />
              <CountryMetric value="0" label={page.soldWeek} />
            </div>
            <Link
              href={localizePublicHref(locale, `/marketplace/${slug}`)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]"
            >
              {page.seeLocal}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white pb-12">
        <div className="mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
          <div className="grid gap-5 rounded-[18px] bg-[#061b42] p-6 text-white sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
            <Mail className="h-12 w-12 text-white/90" />
            <div>
              <h2 className="text-2xl leading-tight tracking-[-0.04em]">{page.newsletterTitle}</h2>
              <p className="mt-2 text-sm text-white/70">{page.newsletterText}</p>
            </div>
            <form className="grid gap-3 sm:min-w-[420px] sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                placeholder={page.emailPlaceholder}
                className="min-h-12 rounded-[10px] border border-white/20 bg-white px-4 text-sm text-[#101828] outline-none"
              />
              <button className="min-h-12 rounded-[10px] bg-[#0866ff] px-6 text-sm font-bold text-white">
                {page.subscribe}
              </button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

async function getLandingListings(
  slug: MarketplaceCategorySlug,
  locale: PublicLocale,
  typeCards: TypeCard[],
  displayCurrency: string,
) {
  const normalizedSlug = normalizeMarketplaceCategory(slug)
  const [featuredListings, regularListings] = await Promise.all([
    getFeaturedMarketplaceCategoryListings(normalizedSlug, 12),
    getPublishedMarketplaceCategoryListings(normalizedSlug, 120),
  ])
  const listings = [
    ...featuredListings,
    ...regularListings.filter((listing) =>
      !featuredListings.some((featured: { id: string }) => featured.id === listing.id),
    ),
  ]
  const typeCounts: Record<string, number> = Object.fromEntries(
    typeCards.map((card) => [card.query, 0]),
  )

  for (const listing of listings) {
    const matched = typeCards.find((card) => listingMatchesTypeCard(listing, card))
    if (matched) typeCounts[matched.query] += 1
  }

  const topListings: LandingTopListing[] = await Promise.all(
    listings.slice(0, 8).map(async (listing) => {
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      return {
        id: listing.id,
        title: listing.title,
        meta: [
          listing.model_year,
          listing.mileage_km ? formatMileageAsMil(Number(listing.mileage_km), locale) : null,
          listing.operating_hours ? `${Number(listing.operating_hours).toLocaleString('sv-SE')} h` : null,
          getEuCountryName(listing.country_code, locale),
        ]
          .filter(Boolean)
          .join(' | '),
        price: price.label,
        imageUrl: listing.images?.[0] || null,
        imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
        countryCode: listing.country_code,
        tag: listing.body_type || listing.condition || 'Featured',
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        mileageKm: listing.mileage_km,
        modelYear: listing.model_year,
        isFeatured: isActiveWindow(listing.featured_status, listing.featured_started_at, listing.featured_expires_at),
        isTopPlacement: isActiveWindow(listing.boost_status, listing.boost_started_at, listing.boost_expires_at),
      }
    }),
  )

  return { topListings, typeCounts, totalListings: listings.length }
}

function SectionHeader({
  title,
  cta,
  href,
}: {
  title: string
  cta: string
  href: string
}) {
  return (
    <div className="flex items-end justify-between gap-5">
      <h2 className="text-3xl leading-tight tracking-[-0.045em]">{title}</h2>
      <Link href={href} className="hidden items-center gap-2 text-sm font-bold text-[#0866ff] sm:inline-flex">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function ListingCard({
  listing,
  locale,
}: {
  listing: LandingTopListing
  locale: PublicLocale
}) {
  const specChips = buildListingSpecChips(
    {
      fuelType: listing.fuelType,
      gearbox: listing.gearbox,
      mileageKm: listing.mileageKm,
      modelYear: listing.modelYear,
    },
    locale,
  )

  return (
    <article className="group relative overflow-hidden rounded-[10px] border border-[#dfe6f2] bg-white shadow-sm transition-colors hover:border-[#344054]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#edf4ff]">
        {listing.imageUrls.length ? (
          <ListingCardImageCarousel
            images={listing.imageUrls}
            title={listing.title}
            href={buildListingPath({
              id: listing.id,
              title: listing.title,
              country_code: listing.countryCode,
            }, locale)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            previousLabel={locale === 'sv' ? 'Föregående bild' : translatePublic(locale, 'Previous photo')}
            nextLabel={locale === 'sv' ? 'Nästa bild' : translatePublic(locale, 'Next photo')}
          />
        ) : (
          <div className="grid h-full place-items-center text-[#0866ff]">
            <CarFront className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-[5px] bg-white/94 px-2 py-1 text-[10px] font-bold uppercase text-[#344054]">
          {listing.tag}
        </span>
        {listing.isFeatured ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#0866ff] px-2 py-1 text-[10px] font-bold uppercase text-white">
            {featuredListingLabel(locale)}
          </span>
        ) : listing.isTopPlacement ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#101828] px-2 py-1 text-[10px] font-bold uppercase text-white">
            {topListingLabel(locale)}
          </span>
        ) : null}
        <div className="absolute bottom-3 right-3 scale-[.78] origin-bottom-right">
          <SavedListingButton listingId={listing.id} />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <Link
          href={buildListingPath({
            id: listing.id,
            title: listing.title,
            country_code: listing.countryCode,
          }, locale)}
          className="block hover:text-[#0866ff]"
        >
          <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[18px] sm:min-h-[40px] sm:text-sm sm:leading-5">{listing.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-[#667085] sm:text-xs">{listing.meta}</p>
        {specChips.length ? (
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {specChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex min-h-7 items-center rounded-full bg-[#f3f5f8] px-2.5 text-[11px] font-bold text-[#344054]"
              >
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-sm font-bold tracking-[-0.03em] sm:mt-4 sm:text-base">{listing.price}</p>
      </div>
      <CountryFlag
        code={listing.countryCode || 'eu'}
        className="absolute bottom-3 right-3 h-7 w-7 rounded-full shadow-[0_8px_18px_rgba(16,24,40,.18)] ring-2 ring-white"
      />
    </article>
  )
}

function isActiveWindow(status?: string | null, startedAt?: string | null, expiresAt?: string | null) {
  const now = Date.now()
  return status === 'active' &&
    Boolean(startedAt) &&
    Boolean(expiresAt) &&
    new Date(String(startedAt)).getTime() <= now &&
    new Date(String(expiresAt)).getTime() > now
}

function featuredListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Utvald'
  if (locale === 'de') return 'Ausgewählt'
  if (locale === 'en') return 'Featured'
  return translatePublic(locale, 'Featured')
}

function topListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Topp'
  if (locale === 'de') return 'Top'
  if (locale === 'en') return 'Sponsored'
  return translatePublic(locale, 'Sponsored')
}

function EmptyListings({
  copy,
  slug,
  locale,
}: {
  copy: ReturnType<typeof pageCopy>
  slug: MarketplaceCategorySlug
  locale: PublicLocale
}) {
  return (
    <div className="mt-6 rounded-[18px] border border-[#dfe6f2] bg-[#f8fbff] p-8 text-center shadow-sm">
      <Search className="mx-auto h-8 w-8 text-[#0866ff]" />
      <h3 className="mt-4 text-2xl tracking-[-0.04em]">{copy.noListingsTitle}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">{copy.noListingsText}</p>
      <Link
        href={localizePublicHref(locale, `/sell-vehicle?category=${slug}`)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0866ff] px-6 text-sm font-bold text-white"
      >
        {copy.sellCta}
      </Link>
    </div>
  )
}

function CountryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong className="block text-2xl tracking-[-0.04em]">{value}</strong>
      <span className="mt-2 block text-xs leading-5 text-[#667085]">{label}</span>
    </div>
  )
}

function t3(sv: string, en: string, de: string) {
  return { sv, en, de }
}

function type(
  labelSv: string,
  labelEn: string,
  labelDe: string,
  query: string,
  image: string,
  aliases: readonly string[] = [],
): TypeCard {
  return {
    label: t3(labelSv, labelEn, labelDe),
    query,
    image,
    aliases: [query, labelSv, labelEn, labelDe, ...aliases],
  }
}

function normalizeTypeMatch(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function listingMatchesTypeCard(
  listing: Record<string, unknown>,
  card: TypeCard,
) {
  const searchable = normalizeTypeMatch(
    [
      listing.body_type,
      listing.title,
      listing.make,
      listing.model,
      ...(Array.isArray(listing.equipment) ? listing.equipment : []),
    ]
      .filter(Boolean)
      .join(' '),
  )
  return card.aliases.some((alias) => searchable.includes(normalizeTypeMatch(alias)))
}

function getTypeCards(slug: MarketplaceCategorySlug): TypeCard[] {
  const cards: Record<MarketplaceCategorySlug, TypeCard[]> = {
    cars: [
      type('Halvkombi', 'Hatchback', 'Kompaktwagen', 'hatchback', '/category-types/cars-hatchback.png', ['5-dörrar', '5 door']),
      type('Sedan', 'Sedan', 'Limousine', 'sedan', '/category-types/cars-sedan.png'),
      type('SUV', 'SUV', 'SUV', 'suv', '/category-types/cars-suv.png'),
      type('Kombi', 'Estate', 'Kombi', 'estate', '/category-types/cars-estate.png', ['wagon', 'touring']),
      type('Coupé', 'Coupe', 'Coupe', 'coupe', '/category-types/cars-coupe.png'),
      type('Sportbil', 'Sports car', 'Sportwagen', 'sports car', '/category-types/cars-sports-car.png', ['sport car', 'sport']),
      type('Elbil', 'Electric', 'Elektro', 'electric', '/category-types/cars-electric.png'),
      type('Pickup', 'Pickup', 'Pickup', 'pickup', '/category-types/cars-pickup.png'),
    ],
    vans: [
      type('Skåpbil', 'Panel van', 'Kastenwagen', 'panel', '/category-types/vans-panel.png'),
      type('Crew van', 'Crew van', 'Doppelkabine', 'crew', '/category-types/vans-crew.png'),
      type('Box van', 'Box van', 'Koffer', 'box', '/category-types/vans-box.png'),
      type('Kylbil', 'Refrigerated', 'Kühlfahrzeug', 'refrigerated', '/category-types/vans-refrigerated.png'),
      type('Minibuss', 'Minibus', 'Minibus', 'minibus', '/category-types/vans-minibus.png'),
      type('Pickup', 'Pickup', 'Pickup', 'pickup', '/category-types/vans-pickup.png'),
      type('Eltransport', 'Electric', 'Elektro', 'electric', '/category-types/vans-electric.png'),
      type('Camper', 'Camper', 'Camper', 'camper', '/category-types/vans-camper.png'),
    ],
    motorcycles: [
      type('Sport', 'Sport', 'Sport', 'sport', '/category-types/motorcycles-sport.png'),
      type('Touring', 'Touring', 'Touring', 'touring', '/category-types/motorcycles-touring.png'),
      type('Naked', 'Naked', 'Naked', 'naked', '/category-types/motorcycles-naked.png'),
      type('Cruiser', 'Cruiser', 'Cruiser', 'cruiser', '/category-types/motorcycles-cruiser.png'),
      type('Adventure', 'Adventure', 'Adventure', 'adventure', '/category-types/motorcycles-adventure.png'),
      type('Scooter', 'Scooter', 'Roller', 'scooter', '/category-types/motorcycles-scooter.png'),
      type('Custom', 'Custom', 'Custom', 'custom', '/category-types/motorcycles-custom.png'),
      type('Electric', 'Electric', 'Elektro', 'electric', '/category-types/motorcycles-electric.png'),
    ],
    motorhomes: [
      type('Camper van', 'Camper van', 'Camper Van', 'camper van', '/category-types/recreation-camper-van.png'),
      type('Halvintegrerad', 'Coachbuilt', 'Teilintegriert', 'coachbuilt', '/category-types/recreation-coachbuilt.png'),
      type('Helintegrerad', 'A-class', 'Integriert', 'a-class', '/category-types/recreation-a-class.png'),
      type('Alkov', 'Overcab', 'Alkoven', 'overcab', '/category-types/recreation-overcab.png'),
      type('Kompakt', 'Compact', 'Kompakt', 'compact', '/category-types/recreation-compact-caravan.png'),
      type('Familj', 'Family', 'Familie', 'family', '/category-types/recreation-family-caravan.png'),
      type('Twin axle', 'Twin axle', 'Tandemachse', 'twin axle', '/category-types/recreation-twin-axle.png'),
      type('Teardrop', 'Teardrop', 'Teardrop', 'teardrop', '/category-types/recreation-teardrop.png'),
    ],
    caravans: [
      type('Kompakt', 'Compact', 'Kompakt', 'compact', '/category-types/recreation-compact-caravan.png'),
      type('Familj', 'Family', 'Familie', 'family', '/category-types/recreation-family-caravan.png'),
      type('Twin axle', 'Twin axle', 'Tandemachse', 'twin axle', '/category-types/recreation-twin-axle.png'),
      type('Teardrop', 'Teardrop', 'Teardrop', 'teardrop', '/category-types/recreation-teardrop.png'),
      type('Camper van', 'Camper van', 'Camper Van', 'camper van', '/category-types/recreation-camper-van.png'),
      type('Halvintegrerad', 'Coachbuilt', 'Teilintegriert', 'coachbuilt', '/category-types/recreation-coachbuilt.png'),
      type('Helintegrerad', 'A-class', 'Integriert', 'a-class', '/category-types/recreation-a-class.png'),
      type('Alkov', 'Overcab', 'Alkoven', 'overcab', '/category-types/recreation-overcab.png'),
    ],
    trucks: [
      type('Dragbil', 'Tractor unit', 'Sattelzugmaschine', 'tractor unit', '/category-types/trucks-tractor-unit.png'),
      type('Skåp', 'Rigid box', 'Koffer', 'rigid box', '/category-types/trucks-rigid-box.png'),
      type('Tippbil', 'Tipper', 'Kipper', 'tipper', '/category-types/trucks-tipper.png'),
      type('Kylbil', 'Refrigerated', 'Kühlfahrzeug', 'refrigerated', '/category-types/trucks-refrigerated.png'),
      type('Biltransport', 'Car transporter', 'Autotransporter', 'transporter', '/category-types/trucks-transporter.png'),
      type('Tankbil', 'Tanker', 'Tankwagen', 'tanker', '/category-types/trucks-tanker.png'),
      type('Flak', 'Flatbed', 'Pritsche', 'flatbed', '/category-types/trucks-flatbed.png'),
      type('Tungtransport', 'Heavy haulage', 'Schwerlast', 'heavy haulage', '/category-types/trucks-heavy-haulage.png'),
    ],
    agriculture: [
      type('Traktorer', 'Tractors', 'Traktoren', 'tractor', '/category-types/agriculture-tractor.png'),
      type('Skördare', 'Combines', 'Mähdrescher', 'combine', '/category-types/agriculture-combine.png'),
      type('Teleskoplastare', 'Telehandlers', 'Teleskoplader', 'telehandler', '/category-types/agriculture-telehandler.png'),
      type('Balpressar', 'Balers', 'Ballenpressen', 'baler', '/category-types/agriculture-baler.png'),
      type('Plogar', 'Ploughs', 'Pflüge', 'plough', '/category-types/agriculture-plough.png'),
      type('Såmaskiner', 'Seed drills', 'Sämaschinen', 'seed drill', '/category-types/agriculture-seed-drill.png'),
      type('Sprutor', 'Sprayers', 'Spritzen', 'sprayer', '/category-types/agriculture-sprayer.png'),
      type('Frontlastare', 'Front loaders', 'Frontlader', 'front loader', '/category-types/agriculture-front-loader.png'),
    ],
    construction: [
      type('Grävmaskiner', 'Excavators', 'Bagger', 'excavator', '/category-types/construction-excavator.png'),
      type('Hjullastare', 'Wheel loaders', 'Radlader', 'wheel loader', '/category-types/construction-wheel-loader.png'),
      type('Minigrävare', 'Mini excavators', 'Minibagger', 'mini excavator', '/category-types/construction-mini-excavator.png'),
      type('Grävlastare', 'Backhoe loaders', 'Baggerlader', 'backhoe', '/category-types/construction-backhoe.png'),
      type('Bulldozers', 'Bulldozers', 'Planierraupen', 'bulldozer', '/category-types/construction-bulldozer.png'),
      type('Dumprar', 'Dump trucks', 'Dumper', 'dump truck', '/category-types/construction-dump-truck.png'),
      type('Kompaktlastare', 'Skid steers', 'Kompaktlader', 'skid steer', '/category-types/construction-skid-steer.png'),
      type('Kranar', 'Cranes', 'Krane', 'crane', '/category-types/construction-crane.png'),
    ],
    'electric-bikes': [
      type('City', 'City', 'City', 'city', '/category-types/electric-bikes-city.png'),
      type('Trekking', 'Trekking', 'Trekking', 'trekking', '/category-types/electric-bikes-trekking.png'),
      type('Mountain', 'Mountain', 'Mountain', 'mountain', '/category-types/electric-bikes-mountain.png'),
      type('Cargo', 'Cargo', 'Cargo', 'cargo', '/category-types/electric-bikes-cargo.png'),
      type('Folding', 'Folding', 'Faltbar', 'folding', '/category-types/electric-bikes-folding.png'),
      type('Commuter', 'Commuter', 'Pendler', 'commuter', '/category-types/electric-bikes-commuter.png'),
      type('Speed', 'Speed', 'Speed', 'speed', '/category-types/electric-bikes-speed.png'),
      type('Kids', 'Kids', 'Kinder', 'kids', '/category-types/electric-bikes-kids.png'),
    ],
    'e-scooters': [
      type('Commuter', 'Commuter', 'Pendler', 'commuter', '/category-types/e-scooters-commuter.png'),
      type('Long range', 'Long range', 'Hohe Reichweite', 'long range', '/category-types/e-scooters-long-range.png'),
      type('Folding', 'Folding', 'Faltbar', 'folding', '/category-types/e-scooters-folding.png'),
      type('Off-road', 'Off-road', 'Offroad', 'off-road', '/category-types/e-scooters-off-road.png'),
      type('Seated', 'Seated', 'Mit Sitz', 'seated', '/category-types/e-scooters-seated.png'),
      type('Lightweight', 'Lightweight', 'Leicht', 'lightweight', '/category-types/e-scooters-lightweight.png'),
      type('Cargo', 'Cargo', 'Cargo', 'cargo', '/category-types/e-scooters-cargo.png'),
      type('Performance', 'Performance', 'Performance', 'performance', '/category-types/e-scooters-performance.png'),
    ],
  }
  return cards[slug]
}

function pageCopy(locale: PublicLocale, slug: MarketplaceCategorySlug, label: string, singular: string) {
  const language = locale === 'de' ? 'de' : locale === 'sv' ? 'sv' : 'en'
  const heroContent = getCategoryHeroContent(slug, locale)
  const heroTitles: Record<MarketplaceCategorySlug, Record<'sv' | 'en' | 'de', string>> = {
    cars: t3('Köp bilar i hela Europa', 'Buy cars across Europe', 'Autos in ganz Europa kaufen'),
    vans: t3('Köp transportbilar i hela Europa', 'Buy vans across Europe', 'Transporter in ganz Europa kaufen'),
    motorcycles: t3('Köp motorcyklar i hela Europa', 'Buy motorcycles across Europe', 'Motorräder in ganz Europa kaufen'),
    motorhomes: t3('Köp husbilar i hela Europa', 'Buy motorhomes across Europe', 'Wohnmobile in ganz Europa kaufen'),
    caravans: t3('Köp husvagnar i hela Europa', 'Buy caravans across Europe', 'Wohnwagen in ganz Europa kaufen'),
    trucks: t3('Köp lastbilar i hela Europa', 'Buy trucks across Europe', 'Lkw in ganz Europa kaufen'),
    agriculture: t3('Köp lantbruksmaskiner i hela Europa', 'Buy agricultural machinery across Europe', 'Landmaschinen in ganz Europa kaufen'),
    construction: t3('Köp entreprenadmaskiner i hela Europa', 'Buy construction machinery across Europe', 'Baumaschinen in ganz Europa kaufen'),
    'electric-bikes': t3('Köp cyklar i hela Europa', 'Buy bikes across Europe', 'Fahrräder in ganz Europa kaufen'),
    'e-scooters': t3('Köp sparkcyklar i hela Europa', 'Buy scooters across Europe', 'Scooter in ganz Europa kaufen'),
  }
  const heroEyebrows: Record<MarketplaceCategorySlug, Record<'sv' | 'en' | 'de', string>> = {
    cars: t3('Europas bilmarknad', "Europe's car marketplace", 'Europas Automarkt'),
    vans: t3('Europas transportbilsmarknad', "Europe's van marketplace", 'Europas Transportermarkt'),
    motorcycles: t3('Europas motorcykelmarknad', "Europe's motorcycle marketplace", 'Europas Motorradmarkt'),
    motorhomes: t3('Europas husbilsmarknad', "Europe's motorhome marketplace", 'Europas Wohnmobilmarkt'),
    caravans: t3('Europas husvagnsmarknad', "Europe's caravan marketplace", 'Europas Wohnwagenmarkt'),
    trucks: t3('Europas lastbilsmarknad', "Europe's truck marketplace", 'Europas Lkw-Markt'),
    agriculture: t3('Europas lantbruksmarknad', "Europe's agricultural marketplace", 'Europas Landmaschinenmarkt'),
    construction: t3('Europas entreprenadmarknad', "Europe's construction machinery marketplace", 'Europas Baumaschinenmarkt'),
    'electric-bikes': t3('Europas cykelmarknad', "Europe's bike marketplace", 'Europas Fahrradmarkt'),
    'e-scooters': t3('Europas sparkcykelmarknad', "Europe's scooter marketplace", 'Europas Scooter-Markt'),
  }
  const searchCtas: Record<MarketplaceCategorySlug, Record<'sv' | 'en' | 'de', string>> = {
    cars: t3('Sök bil', 'Search cars', 'Autos suchen'),
    vans: t3('Sök transportbil', 'Search vans', 'Transporter suchen'),
    motorcycles: t3('Sök motorcykel', 'Search motorcycles', 'Motorräder suchen'),
    motorhomes: t3('Sök husbil', 'Search motorhomes', 'Wohnmobile suchen'),
    caravans: t3('Sök husvagn', 'Search caravans', 'Wohnwagen suchen'),
    trucks: t3('Sök lastbil', 'Search trucks', 'Lkw suchen'),
    agriculture: t3('Sök maskin', 'Search machinery', 'Maschinen suchen'),
    construction: t3('Sök maskin', 'Search machinery', 'Maschinen suchen'),
    'electric-bikes': t3('Sök cykel', 'Search bikes', 'Fahrräder suchen'),
    'e-scooters': t3('Sök sparkcykel', 'Search scooters', 'Scooter suchen'),
  }
  const base = {
    sv: {
      eyebrow: heroEyebrows[slug].sv,
      heroTypingPrefix: `Hitta rätt ${singular.toLowerCase()} bland`,
      assurances: ['Verifierade annonser', 'Tryggare betalningar', 'Skydd över hela Europa'],
      browseByType: 'Bläddra efter typ',
      category: 'Kategori',
      make: 'Märke',
      allMakes: 'Alla märken',
      model: 'Modell',
      allModels: 'Alla modeller',
      price: 'Pris',
      anyPrice: 'Alla priser',
      minPrice: 'Minpris',
      maxPrice: 'Maxpris',
      clearFilter: 'Rensa',
      applyFilter: 'Använd',
      location: 'Plats',
      searchCta: searchCtas[slug].sv,
      moreFilters: 'Fler filter',
      topRatedTitle: 'Topprankade annonser',
      viewAll: `Visa alla ${label.toLowerCase()}`,
      noListingsTitle: 'Inga publicerade annonser ännu.',
      noListingsText: 'När riktiga annonser publiceras visas de här automatiskt. Var först med att lägga upp ett fordon på Autorell.',
      listings: 'annonser',
      moreTypes: 'Fler typer',
      sellTitle: `Sälj din ${singular} till köpare över hela Europa`,
      sellText: 'Det är gratis att börja. Få mer synlighet och sälj snabbare.',
      sellCta: `Sälj din ${singular}`,
      whyTitle: 'Därför väljer säljare Autorell',
      whyText: `Vi gör det enklare att köpa och sälja ${label.toLowerCase()} över landsgränser.`,
      countryTitle: 'Populärt i ditt land',
      changeCountry: 'Ändra land',
      newToday: 'Annonser totalt',
      priceDrops: 'Prisändringar idag',
      soldWeek: 'Sålda denna vecka',
      seeLocal: `Se ${label.toLowerCase()} i Sverige`,
      newsletterTitle: `Få de senaste annonserna för ${label.toLowerCase()}`,
      newsletterText: 'Var först med att se nya annonser som matchar dina behov.',
      emailPlaceholder: 'Ange din e-postadress',
      subscribe: 'Prenumerera',
      trust: [
        { title: 'Brett urval', text: `Från vardag till specialistfordon.` },
        { title: 'Verifierade annonser', text: 'Annonser kontrolleras för kvalitet.' },
        { title: 'Tryggare köp', text: 'Tydlig information och skydd.' },
        { title: 'Support när du behöver', text: 'Vårt team finns med hela vägen.' },
      ],
      why: [
        { title: 'Verifierade säljare', text: 'Konton och annonser granskas.' },
        { title: 'Tryggare betalningar', text: 'Din betalning är bättre skyddad.' },
        { title: 'Skydd i Europa', text: 'Du är täckt i varje land.' },
      ],
    },
    en: {
      eyebrow: heroEyebrows[slug].en,
      heroTypingPrefix: `Find the right ${singular.toLowerCase()} among`,
      assurances: ['Verified listings', 'Secure payments', 'Protection across Europe'],
      browseByType: 'Browse by type',
      category: 'Category',
      make: 'Make',
      allMakes: 'All makes',
      model: 'Model',
      allModels: 'All models',
      price: 'Price',
      anyPrice: 'Any price',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      clearFilter: 'Clear',
      applyFilter: 'Apply',
      location: 'Location',
      searchCta: searchCtas[slug].en,
      moreFilters: 'More filters',
      topRatedTitle: 'Top rated listings',
      viewAll: `View all ${label.toLowerCase()}`,
      noListingsTitle: 'No published listings yet.',
      noListingsText: 'When real listings are published, they will appear here automatically. Be the first to list a vehicle on Autorell.',
      listings: 'listings',
      moreTypes: 'More types',
      sellTitle: `Sell your ${singular} to thousands of buyers across Europe`,
      sellText: 'It is free to start. Get more visibility and sell faster.',
      sellCta: `Sell your ${singular}`,
      whyTitle: 'Why thousands choose Autorell',
      whyText: `We make it easy to buy and sell ${label.toLowerCase()} across Europe.`,
      countryTitle: 'Popular in your country',
      changeCountry: 'Change country',
      newToday: 'Total listings',
      priceDrops: 'Price drops today',
      soldWeek: 'Sold this week',
      seeLocal: `See all ${label.toLowerCase()} locally`,
      newsletterTitle: `Get the latest ${label.toLowerCase()} listings`,
      newsletterText: 'Be the first to see new listings that match your needs.',
      emailPlaceholder: 'Enter your email address',
      subscribe: 'Subscribe',
      trust: [
        { title: 'Wide selection', text: 'From daily use to specialist vehicles.' },
        { title: 'Verified listings', text: 'Listings are checked for quality.' },
        { title: 'Buy with confidence', text: 'Clear data and safer payments.' },
        { title: 'Support when needed', text: 'Our team is here to help.' },
      ],
      why: [
        { title: 'Verified sellers', text: 'Accounts and listings are reviewed.' },
        { title: 'Secure payments', text: 'Your payments are protected.' },
        { title: 'Europe-wide protection', text: 'You are covered in every country.' },
      ],
    },
    de: {
      eyebrow: heroEyebrows[slug].de,
      heroTypingPrefix: `Das richtige ${singular.toLowerCase()} finden unter`,
      assurances: ['Verifizierte Anzeigen', 'Sichere Zahlungen', 'Schutz in Europa'],
      browseByType: 'Nach Typ suchen',
      category: 'Kategorie',
      make: 'Marke',
      allMakes: 'Alle Marken',
      model: 'Modell',
      allModels: 'Alle Modelle',
      price: 'Preis',
      anyPrice: 'Jeder Preis',
      minPrice: 'Mindestpreis',
      maxPrice: 'Höchstpreis',
      clearFilter: 'Zurücksetzen',
      applyFilter: 'Anwenden',
      location: 'Standort',
      searchCta: searchCtas[slug].de,
      moreFilters: 'Mehr Filter',
      topRatedTitle: 'Top bewertete Anzeigen',
      viewAll: `Alle ${label} ansehen`,
      noListingsTitle: 'Noch keine veröffentlichten Anzeigen.',
      noListingsText: 'Sobald echte Anzeigen veröffentlicht werden, erscheinen sie hier automatisch.',
      listings: 'Anzeigen',
      moreTypes: 'Mehr Typen',
      sellTitle: `${singular} an Käufer in ganz Europa verkaufen`,
      sellText: 'Der Einstieg ist kostenlos. Mehr Sichtbarkeit, schneller verkaufen.',
      sellCta: `${singular} verkaufen`,
      whyTitle: 'Warum Verkäufer Autorell wählen',
      whyText: `Wir machen Kaufen und Verkaufen von ${label} in Europa einfacher.`,
      countryTitle: 'Beliebt in Ihrem Land',
      changeCountry: 'Land ändern',
      newToday: 'Anzeigen gesamt',
      priceDrops: 'Preisänderungen heute',
      soldWeek: 'Verkauft diese Woche',
      seeLocal: `Lokale ${label} ansehen`,
      newsletterTitle: `Neue ${label}-Anzeigen erhalten`,
      newsletterText: 'Sehen Sie neue Anzeigen zuerst.',
      emailPlaceholder: 'E-Mail-Adresse eingeben',
      subscribe: 'Abonnieren',
      trust: [
        { title: 'Große Auswahl', text: 'Vom Alltag bis Spezialfahrzeug.' },
        { title: 'Verifizierte Anzeigen', text: 'Anzeigen werden geprüft.' },
        { title: 'Sicher kaufen', text: 'Klare Daten und Schutz.' },
        { title: 'Support bei Bedarf', text: 'Unser Team hilft weiter.' },
      ],
      why: [
        { title: 'Verifizierte Verkäufer', text: 'Konten und Anzeigen werden geprüft.' },
        { title: 'Sichere Zahlungen', text: 'Ihre Zahlung ist geschützt.' },
        { title: 'Schutz in Europa', text: 'Abdeckung in jedem Land.' },
      ],
    },
  }[language]

  void heroTitles

  return {
    ...base,
    heroTitle: heroContent.title,
    heroTypingPrefix: heroContent.body,
  }
}

function getCategoryHeroContent(
  slug: MarketplaceCategorySlug,
  locale: PublicLocale,
) {
  const language = locale === 'de' ? 'de' : locale === 'sv' ? 'sv' : 'en'
  const content: Record<MarketplaceCategorySlug, Record<'sv' | 'en' | 'de', { title: string; body: string }>> = {
    cars: {
      sv: { title: 'Hitta din nästa bil', body: 'Utforska nya och begagnade bilar från privatpersoner och företag.' },
      en: { title: 'Find your next car', body: 'Explore new and used cars from private and business sellers.' },
      de: { title: 'Finden Sie Ihr nächstes Auto', body: 'Entdecken Sie neue und gebrauchte Autos von privaten und gewerblichen Verkäufern.' },
    },
    vans: {
      sv: { title: 'Transportbilar för jobb och vardag', body: 'Hitta flexibla transportbilar för leverans, service och företag i hela Europa.' },
      en: { title: 'Vans for work and everyday use', body: 'Find practical vans for delivery, service and business across Europe.' },
      de: { title: 'Transporter für Arbeit und Alltag', body: 'Finden Sie praktische Transporter für Lieferung, Service und Gewerbe in Europa.' },
    },
    motorcycles: {
      sv: { title: 'Motorcyklar för varje körstil', body: 'Utforska motorcyklar för pendling, touring och fritid från privata och företag.' },
      en: { title: 'Motorcycles for every ride', body: 'Explore motorcycles for commuting, touring and leisure from private and business sellers.' },
      de: { title: 'Motorräder für jede Fahrt', body: 'Entdecken Sie Motorräder für Pendeln, Touren und Freizeit von privaten und Händlern.' },
    },
    motorhomes: {
      sv: { title: 'Husbilar för nästa resa', body: 'Jämför husbilar för semester, långresor och frihet på vägarna i Europa.' },
      en: { title: 'Motorhomes for your next trip', body: 'Compare motorhomes for holidays, long journeys and freedom on European roads.' },
      de: { title: 'Wohnmobile für die nächste Reise', body: 'Vergleichen Sie Wohnmobile für Urlaub, lange Reisen und Freiheit auf Europas Straßen.' },
    },
    caravans: {
      sv: { title: 'Husvagnar för säsong och äventyr', body: 'Hitta husvagnar för familj, camping och längre vistelser från säljare i Europa.' },
      en: { title: 'Caravans for seasons and escapes', body: 'Find caravans for families, camping and longer stays from sellers across Europe.' },
      de: { title: 'Wohnwagen für Saison und Abenteuer', body: 'Finden Sie Wohnwagen für Familie, Camping und längere Aufenthalte in Europa.' },
    },
    trucks: {
      sv: { title: 'Lastbilar för transport och logistik', body: 'Sök lastbilar för åkeri, distribution och tunga uppdrag från europeiska säljare.' },
      en: { title: 'Trucks for transport and logistics', body: 'Search trucks for haulage, distribution and heavy-duty work from European sellers.' },
      de: { title: 'Lkw für Transport und Logistik', body: 'Suchen Sie Lkw für Spedition, Verteilung und schwere Einsätze in Europa.' },
    },
    agriculture: {
      sv: { title: 'Maskiner för lantbruket', body: 'Utforska traktorer, redskap och lantbruksmaskiner för modern drift och produktion.' },
      en: { title: 'Machinery for modern farming', body: 'Explore tractors, implements and farm machinery for efficient agricultural work.' },
      de: { title: 'Maschinen für moderne Landwirtschaft', body: 'Entdecken Sie Traktoren, Geräte und Landmaschinen für effiziente Arbeit.' },
    },
    construction: {
      sv: { title: 'Entreprenadmaskiner för jobbet', body: 'Hitta grävmaskiner, lastare och maskiner för bygg, markarbete och infrastruktur.' },
      en: { title: 'Construction machines for the job', body: 'Find excavators, loaders and machines for building, earthmoving and infrastructure.' },
      de: { title: 'Baumaschinen für den Einsatz', body: 'Finden Sie Bagger, Lader und Maschinen für Bau, Erdarbeiten und Infrastruktur.' },
    },
    'electric-bikes': {
      sv: { title: 'Cyklar för stad och pendling', body: 'Jämför cyklar för vardag, last och längre turer från privata och företag.' },
      en: { title: 'Bikes for city and commuting', body: 'Compare bikes for everyday travel, cargo and longer rides from trusted sellers.' },
      de: { title: 'Fahrräder für Stadt und Pendeln', body: 'Vergleichen Sie Fahrräder für Alltag, Lasten und längere Fahrten.' },
    },
    'e-scooters': {
      sv: { title: 'Sparkcyklar för smidig vardag', body: 'Sök sparkcyklar för korta resor, pendling och enkel mobilitet i staden.' },
      en: { title: 'Scooters for easy mobility', body: 'Search scooters for short trips, commuting and simple city transport.' },
      de: { title: 'Scooter für flexible Mobilität', body: 'Suchen Sie Scooter für kurze Wege, Pendeln und einfache Stadtmobilität.' },
    },
  }

  return content[slug][language]
}

function getCategorySeoContent(
  slug: MarketplaceCategorySlug,
  locale: PublicLocale,
) {
  const language = locale === 'de' ? 'de' : locale === 'sv' ? 'sv' : 'en'
  const seo: Record<MarketplaceCategorySlug, Record<'sv' | 'en' | 'de', { title: string; description: string }>> = {
    cars: {
      sv: { title: 'Bilar till salu | Köp en begagnad eller ny bil | Autorell', description: 'Hitta bilar till salu, begagnade bilar och nya bilar från privatpersoner och företag i Europa.' },
      en: { title: 'Cars for sale | Buy a used or new car | Autorell', description: 'Find cars for sale, used cars and new cars from private and business sellers across Europe.' },
      de: { title: 'Autos kaufen | Gebrauchte und neue Autos | Autorell', description: 'Finden Sie Autos, Gebrauchtwagen und Neuwagen von privaten und gewerblichen Verkäufern in Europa.' },
    },
    vans: {
      sv: { title: 'Transportbilar till salu | Begagnade och nya transportbilar | Autorell', description: 'Sök transportbilar till salu från privatpersoner och företag. Jämför nya och begagnade transportbilar.' },
      en: { title: 'Vans for sale | Used and new vans | Autorell', description: 'Search vans for sale from private and business sellers. Compare used and new vans across Europe.' },
      de: { title: 'Transporter kaufen | Gebrauchte und neue Transporter | Autorell', description: 'Suchen Sie Transporter von privaten und gewerblichen Verkäufern. Vergleichen Sie neue und gebrauchte Transporter.' },
    },
    motorcycles: {
      sv: { title: 'Motorcyklar till salu | Köp begagnad eller ny MC | Autorell', description: 'Hitta motorcyklar till salu i Europa. Jämför begagnade och nya motorcyklar från privata och företag.' },
      en: { title: 'Motorcycles for sale | Used and new bikes | Autorell', description: 'Find motorcycles for sale in Europe. Compare used and new bikes from private and business sellers.' },
      de: { title: 'Motorräder kaufen | Gebrauchte und neue Motorräder | Autorell', description: 'Finden Sie Motorräder in Europa. Vergleichen Sie gebrauchte und neue Motorräder von privaten und Händlern.' },
    },
    motorhomes: {
      sv: { title: 'Husbilar till salu | Köp begagnad eller ny husbil | Autorell', description: 'Sök husbilar till salu i Europa. Jämför begagnade och nya husbilar från privatpersoner och företag.' },
      en: { title: 'Motorhomes for sale | Used and new motorhomes | Autorell', description: 'Search motorhomes for sale in Europe. Compare used and new motorhomes from private and business sellers.' },
      de: { title: 'Wohnmobile kaufen | Gebrauchte und neue Wohnmobile | Autorell', description: 'Suchen Sie Wohnmobile in Europa. Vergleichen Sie gebrauchte und neue Wohnmobile von privaten und Händlern.' },
    },
    caravans: {
      sv: { title: 'Husvagnar till salu | Köp begagnad eller ny husvagn | Autorell', description: 'Hitta husvagnar till salu i Europa. Jämför begagnade och nya husvagnar från privatpersoner och företag.' },
      en: { title: 'Caravans for sale | Used and new caravans | Autorell', description: 'Find caravans for sale in Europe. Compare used and new caravans from private and business sellers.' },
      de: { title: 'Wohnwagen kaufen | Gebrauchte und neue Wohnwagen | Autorell', description: 'Finden Sie Wohnwagen in Europa. Vergleichen Sie gebrauchte und neue Wohnwagen von privaten und Händlern.' },
    },
    trucks: {
      sv: { title: 'Lastbilar till salu | Köp begagnad eller ny lastbil | Autorell', description: 'Sök lastbilar till salu i Europa. Jämför begagnade och nya lastbilar för transport och logistik.' },
      en: { title: 'Trucks for sale | Used and new trucks | Autorell', description: 'Search trucks for sale in Europe. Compare used and new trucks for transport and logistics.' },
      de: { title: 'Lkw kaufen | Gebrauchte und neue Lkw | Autorell', description: 'Suchen Sie Lkw in Europa. Vergleichen Sie gebrauchte und neue Lkw für Transport und Logistik.' },
    },
    agriculture: {
      sv: { title: 'Lantbruksmaskiner till salu | Begagnat och nytt | Autorell', description: 'Hitta lantbruksmaskiner till salu i Europa. Jämför traktorer, redskap och maskiner från företag och privata.' },
      en: { title: 'Farm machinery for sale | Used and new machines | Autorell', description: 'Find farm machinery for sale in Europe. Compare tractors, implements and machines from trusted sellers.' },
      de: { title: 'Landmaschinen kaufen | Gebrauchte und neue Maschinen | Autorell', description: 'Finden Sie Landmaschinen in Europa. Vergleichen Sie Traktoren, Geräte und Maschinen von Verkäufern.' },
    },
    construction: {
      sv: { title: 'Entreprenadmaskiner till salu | Begagnat och nytt | Autorell', description: 'Sök entreprenadmaskiner till salu i Europa. Jämför grävmaskiner, lastare och maskiner för bygg.' },
      en: { title: 'Construction machinery for sale | Used and new | Autorell', description: 'Search construction machinery for sale in Europe. Compare excavators, loaders and machines for building.' },
      de: { title: 'Baumaschinen kaufen | Gebrauchte und neue Maschinen | Autorell', description: 'Suchen Sie Baumaschinen in Europa. Vergleichen Sie Bagger, Lader und Maschinen für Bau und Infrastruktur.' },
    },
    'electric-bikes': {
      sv: { title: 'Cyklar till salu | Köp begagnad eller ny cykel | Autorell', description: 'Hitta cyklar till salu i Europa. Jämför begagnade och nya cyklar för stad, pendling och vardag.' },
      en: { title: 'Bikes for sale | Used and new bikes | Autorell', description: 'Find bikes for sale in Europe. Compare used and new bikes for city, commuting and everyday travel.' },
      de: { title: 'Fahrräder kaufen | Gebrauchte und neue Fahrräder | Autorell', description: 'Finden Sie Fahrräder in Europa. Vergleichen Sie gebrauchte und neue Fahrräder für Stadt und Alltag.' },
    },
    'e-scooters': {
      sv: { title: 'Sparkcyklar till salu | Köp begagnad eller ny sparkcykel | Autorell', description: 'Sök sparkcyklar till salu i Europa. Jämför begagnade och nya sparkcyklar för pendling och korta resor.' },
      en: { title: 'Scooters for sale | Used and new scooters | Autorell', description: 'Search scooters for sale in Europe. Compare used and new scooters for commuting and short trips.' },
      de: { title: 'Scooter kaufen | Gebrauchte und neue Scooter | Autorell', description: 'Suchen Sie Scooter in Europa. Vergleichen Sie gebrauchte und neue Scooter für Pendeln und kurze Wege.' },
    },
  }

  return seo[slug][language]
}


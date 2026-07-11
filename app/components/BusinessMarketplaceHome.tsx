import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HomeHeroVehicleSearch from './HomeHeroVehicleSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceHomeListings,
} from '@/lib/marketplace-public-data'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { countryForLocale } from '@/lib/market-locale'
import { formatMileageAsMil } from '@/lib/listing-display'

const homeContentContainerClass =
  'mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[1010px] sm:px-8 xl:max-w-[1060px]'

const homeCopy = {
  sv: {
    heroAlt: 'Europeisk fordonsmarknad för privatpersoner och företag',
    vehicleNewsTitle: 'Fordonsnyheter',
    allNews: 'Alla nyheter',
    newsCategory: 'Fordonsmarknad',
    newsReadTime: '2 min läsning',
  },
  en: {
    heroAlt: 'European vehicle marketplace for private and business sellers',
    vehicleNewsTitle: 'Vehicle news',
    allNews: 'All news',
    newsCategory: 'Vehicle market',
    newsReadTime: '2 min read',
  },
  de: {
    heroAlt: 'Europäischer Fahrzeugmarktplatz für Privatpersonen und Unternehmen',
    vehicleNewsTitle: 'Fahrzeugnews',
    allNews: 'Alle News',
    newsCategory: 'Fahrzeugmarkt',
    newsReadTime: '2 Min. Lesezeit',
  },
} as const

type HomeListingCardItem = {
  id: string
  title: string
  href: string
  imageUrl: string | null
  imageUrls: string[]
  priceLabel: string
  meta: string
  countryCode: string
  sellerTrust: 'verified' | 'unverified'
}

type HomeListingSectionData = {
  title: string
  emptyText: string
  items: HomeListingCardItem[]
}

export default async function BusinessMarketplaceHome({
  locale = 'sv',
  marketCode,
}: {
  locale?: PublicLocale
  marketCode?: string
}) {
  const t =
    locale === 'sv'
      ? homeCopy.sv
      : locale === 'de'
        ? homeCopy.de
        : locale === 'en'
          ? homeCopy.en
          : translatePublicObject(locale, homeCopy.en)
  const localMarketCode =
    marketCode || countryForLocale(locale)
  const localMarketLabel =
    localMarketCode === 'EU'
      ? 'Europe'
      : getEuCountryName(localMarketCode, locale)
  const displayCurrency = displayCurrencyForMarket(localMarketCode)
  const newsCards = getVehicleNewsCards(locale)
  const [localTopListings, localLatestListings, europeTopListings, europeLatestListings] =
    await Promise.all([
      getPublishedMarketplaceHomeListings(localMarketCode, 'top', 8),
      getPublishedMarketplaceHomeListings(localMarketCode, 'latest', 8),
      getPublishedMarketplaceHomeListings('EU', 'top', 8),
      getPublishedMarketplaceHomeListings('EU', 'latest', 8),
    ])
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    [...localTopListings, ...localLatestListings, ...europeTopListings, ...europeLatestListings]
      .map((listing) => listing.seller_user_id)
      .filter(Boolean),
  )
  const toHomeCard = (listing: HomeListingSource) =>
    mapHomeListingCard(listing, locale, displayCurrency, sellerProfiles.get(listing.seller_user_id || '')?.trust || 'unverified')
  const listingSections = [
    {
      title: homeListingSectionTitle(locale, 'top', localMarketLabel),
      emptyText: homeEmptyListingText(locale, 'country'),
      items: await Promise.all(localTopListings.map(toHomeCard)),
    },
    {
      title: homeListingSectionTitle(locale, 'latest', localMarketLabel),
      emptyText: homeEmptyListingText(locale, 'country'),
      items: await Promise.all(localLatestListings.map(toHomeCard)),
    },
    {
      title: homeListingSectionTitle(locale, 'top', homeEuropeLabel(locale)),
      emptyText: homeEmptyListingText(locale, 'europe'),
      items: await Promise.all(europeTopListings.map(toHomeCard)),
    },
    {
      title: homeListingSectionTitle(locale, 'latest', homeEuropeLabel(locale)),
      emptyText: homeEmptyListingText(locale, 'europe'),
      items: await Promise.all(europeLatestListings.map(toHomeCard)),
    },
  ]

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="-mt-[2px] bg-white pt-0">
        <div className="relative min-h-[665px] overflow-visible bg-[#d9e5f1] sm:min-h-[610px] lg:min-h-[620px]">
          <Image
            src="/autorell-home-hero-clean.avif"
            alt={t.heroAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[54%] w-[34%] bg-[radial-gradient(ellipse_at_8%_18%,rgba(255,237,198,0.16)_0%,rgba(255,244,224,0.08)_38%,rgba(255,255,255,0)_72%)]"
          />
          <div className="relative z-10 flex min-h-[665px] w-[100dvw] max-w-none items-start px-4 pb-8 pt-6 sm:mx-auto sm:min-h-[610px] sm:w-full sm:max-w-[var(--autorell-page-max)] sm:px-8 lg:min-h-[620px] lg:max-w-[1888px] lg:items-center lg:px-6 lg:py-10 2xl:px-8">
            <HomeHeroVehicleSearch locale={locale} />
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className={homeContentContainerClass}>
          <div className="flex items-end justify-between gap-5">
            <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] sm:text-[34px]">
              {t.vehicleNewsTitle}
            </h2>
            <Link
              href={localizePublicHref(locale, '/fordonsnyheter')}
              className="hidden items-center gap-2 text-sm font-semibold text-[#0866ff] sm:inline-flex"
            >
              {t.allNews}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {newsCards.map((item) => (
              <VehicleNewsCard
                key={item.title}
                item={item}
                category={t.newsCategory}
                readTime={t.newsReadTime}
                locale={locale}
              />
            ))}
          </div>

          <div className="mt-12 space-y-10 sm:mt-16">
            {listingSections.map((section) => (
              <HomeListingSection key={section.title} section={section} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function VehicleNewsCard({
  item,
  category,
  readTime,
  locale,
}: {
  item: { title: string; href: string }
  category: string
  readTime: string
  locale: PublicLocale
}) {
  return (
    <Link href={item.href} className="group w-full flex-none snap-start sm:w-auto">
      <NoPhotoFrame className="aspect-[16/10] rounded-[8px]" locale={locale} />
      <div className="mt-2 text-[11px] font-medium text-[#667085]">
        {category} | {readTime}
      </div>
      <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#101828] transition group-hover:text-[#0866ff]">
        {item.title}
      </h3>
    </Link>
  )
}

function NoPhotoFrame({
  className = '',
  compact = false,
  locale = 'en',
}: {
  className?: string
  compact?: boolean
  locale?: PublicLocale
}) {
  const label = locale === 'de'
    ? 'Kein Foto verfügbar'
    : locale === 'sv'
      ? 'Ingen bild tillgänglig'
      : translatePublic(locale, 'No photo available')
  const [first, ...rest] = label.split(' ')
  return (
    <div
      className={`grid place-items-center border border-[#e3e8f0] bg-[#f6f7f9] text-center text-[#9b9ca0] ${className}`}
      aria-label={label}
    >
      <span className={`${compact ? 'text-[15px]' : 'text-[22px]'} font-light uppercase leading-[1.35] tracking-[0.04em]`}>
        {first || label}
        <br />
        {rest.join(' ')}
      </span>
    </div>
  )
}

function HomeListingSection({
  section,
  locale,
}: {
  section: HomeListingSectionData
  locale: PublicLocale
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-5">
        <h2 className="text-[24px] font-medium leading-tight tracking-[-0.035em] text-[#101828] sm:text-[30px]">
          {section.title}
        </h2>
        <Link
          href={localizePublicHref(locale, '/marketplace')}
          className="hidden items-center gap-2 text-sm font-semibold text-[#0866ff] sm:inline-flex"
        >
          {homeViewListingsLabel(locale)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {section.items.length ? (
        <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <HomeListingCard
              key={`${section.title}-${item.id}`}
              item={item}
              index={index + 1}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[12px] border border-[#d8e0ec] bg-[#f8fbff] px-5 py-7 text-sm font-medium text-[#667085]">
          {section.emptyText}
        </div>
      )}
    </section>
  )
}

function HomeListingCard({
  item,
  index,
  locale,
}: {
  item: HomeListingCardItem
  index: number
  locale: PublicLocale
}) {
  return (
    <article className="group relative w-[82vw] max-w-[320px] flex-none snap-start overflow-hidden rounded-[12px] border border-[#d8e0ec] bg-white shadow-sm sm:w-auto sm:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f8]">
        {item.imageUrls.length ? (
          <ListingCardImageCarousel
            images={item.imageUrls}
            title={item.title}
            href={item.href}
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 25vw"
            previousLabel={locale === 'sv' ? 'Föregående bild' : translatePublic(locale, 'Previous photo')}
            nextLabel={locale === 'sv' ? 'Nästa bild' : translatePublic(locale, 'Next photo')}
          />
        ) : (
          <NoPhotoFrame className="h-full w-full border-0" compact locale={locale} />
        )}
        <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#101828]/75 text-xs font-semibold text-white">
          {index}
        </span>
      </div>
      <div className="p-3">
        <Link href={item.href} className="block">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-[#101828] transition hover:text-[#0866ff]">
            {item.title}
          </h3>
        </Link>
        <p className="mt-2 text-[14px] font-semibold text-[#101828]">{item.priceLabel}</p>
        <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[#667085]">{item.meta}</p>
      </div>
    </article>
  )
}

function getVehicleNewsCards(locale: PublicLocale) {
  const href = localizePublicHref(locale, '/fordonsnyheter')
  if (locale === 'de') {
    return [
      { title: 'So finden Käufer das richtige Fahrzeug über Ländergrenzen hinweg', href },
      { title: 'Checkliste für sichere Fahrzeuggeschäfte in Europa', href },
      { title: 'Was Preis, Standort und Historie in einer Anzeige bedeuten', href },
    ]
  }
  if (locale === 'en') {
    return [
      { title: 'How buyers compare vehicles across European markets', href },
      { title: 'A practical checklist for safer vehicle deals', href },
      { title: 'What price, location and vehicle history reveal in a listing', href },
    ]
  }
  if (locale !== 'sv') {
    return [
      { title: translatePublic(locale, 'How buyers compare vehicles across European markets'), href },
      { title: translatePublic(locale, 'A practical checklist for safer vehicle deals'), href },
      { title: translatePublic(locale, 'What price, location and vehicle history reveal in a listing'), href },
    ]
  }
  return [
    { title: 'Så jämför köpare fordon mellan europeiska marknader', href },
    { title: 'Checklista för en tryggare fordonsaffär online', href },
    { title: 'Det här betyder pris, plats och historik i en annons', href },
  ]
}

function homeEuropeLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Europa'
  if (locale === 'de') return 'Europa'
  if (locale === 'en') return 'Europe'
  return translatePublic(locale, 'Europe')
}

function homeListingSectionTitle(
  locale: PublicLocale,
  kind: 'top' | 'latest',
  marketLabel: string,
) {
  if (kind === 'latest') {
    if (locale === 'sv') return `Senaste annonser i ${marketLabel}`
    if (locale === 'de') return `Neueste Anzeigen in ${marketLabel}`
    if (locale === 'en') return `Latest listings in ${marketLabel}`
    return `${translatePublic(locale, 'Latest listings in')} ${marketLabel}`
  }

  if (locale === 'sv') return `Topplistan i ${marketLabel}`
  if (locale === 'de') return `Top-Anzeigen in ${marketLabel}`
  if (locale === 'en') return `Top listings in ${marketLabel}`
  return `${translatePublic(locale, 'Top listings in')} ${marketLabel}`
}

function homeEmptyListingText(locale: PublicLocale, scope: 'country' | 'europe') {
  const english =
    scope === 'country'
      ? 'Listings will appear here when vehicles are published in this market.'
      : 'European listings will appear here when matching vehicles are published.'
  if (locale === 'sv') {
    return scope === 'country'
      ? 'Annonser visas här när fordon publiceras på den här marknaden.'
      : 'Europeiska annonser visas här när matchande fordon publiceras.'
  }
  if (locale === 'de') {
    return scope === 'country'
      ? 'Anzeigen erscheinen hier, wenn Fahrzeuge in diesem Markt veröffentlicht werden.'
      : 'Europäische Anzeigen erscheinen hier, wenn passende Fahrzeuge veröffentlicht werden.'
  }
  if (locale === 'en') return english
  return translatePublic(locale, english)
}

function homeViewListingsLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Visa annonser'
  if (locale === 'de') return 'Anzeigen ansehen'
  if (locale === 'en') return 'View listings'
  return translatePublic(locale, 'View listings')
}

type HomeListingSource = {
  id: string
  title: string
  make: string | null
  model: string | null
  model_year: number | string | null
  mileage_km: number | string | null
  city: string | null
  country_code: string
  price: number | string | null
  currency: string | null
  images?: string[] | null
  seller_user_id?: string | null
}

async function mapHomeListingCard(
  listing: HomeListingSource,
  locale: PublicLocale,
  displayCurrency: string,
  sellerTrust: 'verified' | 'unverified',
): Promise<HomeListingCardItem> {
  const countryName = getEuCountryName(listing.country_code, locale)
  const location = [listing.city, countryName]
    .filter(Boolean)
    .join(', ')
  const price = Number(listing.price)
  const mileage = Number(listing.mileage_km)
  const vehicleMeta = [
    listing.model_year ? String(listing.model_year) : null,
    Number.isFinite(mileage) ? formatMileageAsMil(mileage, locale) : null,
    location || countryName,
  ]
    .filter(Boolean)
    .join(' | ')

  return {
    id: listing.id,
    title: listing.title,
    href: localizePublicHref(locale, buildListingPath(listing)),
    imageUrl: listing.images?.[0] || null,
    imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
    priceLabel: Number.isFinite(price)
      ? (await formatMarketplacePriceDisplay({
          amount: price,
          currency: listing.currency || 'EUR',
          locale,
          targetCurrency: displayCurrency,
        })).label
      : translatePublic(locale, 'Price on request'),
    meta: vehicleMeta,
    countryCode: listing.country_code,
    sellerTrust,
  }
}


import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HomeHeroVehicleSearch from './HomeHeroVehicleSearch'
import HomeVehicleNewsScroller from './HomeVehicleNewsScroller'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceListingCount,
  getPublishedMarketplaceHomeListings,
} from '@/lib/marketplace-public-data'
import { getVehicleNews, type PublicNewsArticle } from '@/lib/content/vehicle-news'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { countryForLocale } from '@/lib/market-locale'
import { formatMileageAsMil } from '@/lib/listing-display'

const homeContentContainerClass =
  'mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8'

const homeCopy = {
  sv: {
    heroAlt: 'Europeisk fordonsmarknad för privatpersoner och företag',
    vehicleNewsTitle: 'Fordonsnyheter',
    allNews: 'Alla nyheter',
    newsScrollLabel: 'Bläddra bland fordonsnyheter',
    newsCategory: 'Fordonsmarknad',
    newsReadTime: '2 min läsning',
    sellerCtaTitle: 'Få ditt fordon att synas på marknader med över 360 miljoner människor',
    privateTitle: 'Sälj som privatperson',
    privateText:
      'Kom igång kostnadsfritt och skapa din fordonsannons på några minuter. Betala bara när du vill annonsera längre eller ge annonsen extra synlighet.',
    privateCta: 'Skapa gratis annons',
    businessTitle: 'Sälj som företag',
    businessText:
      'Samla annonser, fordon och team på en och samma plattform. Skapa annonser manuellt direkt i Autorell eller importera hela fordonslagret smidigt via CSV. Hantera stora annonsvolymer och få full kontroll över ert lager.',
    businessCta: 'Kom igång som företag',
  },
  en: {
    heroAlt: 'European vehicle marketplace for private and business sellers',
    vehicleNewsTitle: 'Vehicle news',
    allNews: 'All news',
    newsScrollLabel: 'Scroll vehicle news',
    newsCategory: 'Vehicle market',
    newsReadTime: '2 min read',
    sellerCtaTitle: 'Get your vehicle seen in markets with over 360 million people',
    privateTitle: 'Sell as a private seller',
    privateText:
      'Start for free and create your vehicle listing in a few minutes. Pay only when you want to advertise for longer or give the listing extra visibility.',
    privateCta: 'Create free listing',
    businessTitle: 'Sell as a business',
    businessText:
      'Keep listings, vehicles and team workflows in one platform. Create listings manually in Autorell or import your full inventory smoothly via CSV. Manage large listing volumes and keep full control of your stock.',
    businessCta: 'Get started as a business',
  },
  de: {
    heroAlt: 'Europäischer Fahrzeugmarktplatz für Privatpersonen und Unternehmen',
    vehicleNewsTitle: 'Fahrzeugnews',
    allNews: 'Alle News',
    newsScrollLabel: 'Fahrzeugnews durchblättern',
    newsCategory: 'Fahrzeugmarkt',
    newsReadTime: '2 Min. Lesezeit',
    sellerCtaTitle: 'Machen Sie Ihr Fahrzeug in Märkten mit über 360 Millionen Menschen sichtbar',
    privateTitle: 'Als Privatperson verkaufen',
    privateText:
      'Starten Sie kostenlos und erstellen Sie Ihre Fahrzeuganzeige in wenigen Minuten. Zahlen Sie nur, wenn Sie länger inserieren oder Ihrer Anzeige zusätzliche Sichtbarkeit geben möchten.',
    privateCta: 'Kostenlose Anzeige erstellen',
    businessTitle: 'Als Unternehmen verkaufen',
    businessText:
      'Bündeln Sie Anzeigen, Fahrzeuge und Teamabläufe auf einer Plattform. Erstellen Sie Anzeigen manuell direkt in Autorell oder importieren Sie Ihren gesamten Fahrzeugbestand bequem per CSV. Verwalten Sie große Anzeigenvolumen und behalten Sie die volle Kontrolle über Ihren Bestand.',
    businessCta: 'Als Unternehmen starten',
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
  isFeatured: boolean
  isTopPlacement: boolean
}

type HomeListingSectionData = {
  id: string
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
  const [
    localTopListings,
    localLatestListings,
    europeTopListings,
    europeLatestListings,
    localListingCount,
    europeListingCount,
    vehicleNews,
  ] =
    await Promise.all([
      getPublishedMarketplaceHomeListings(localMarketCode, 'top', 8),
      getPublishedMarketplaceHomeListings(localMarketCode, 'latest', 8),
      getPublishedMarketplaceHomeListings('EU', 'top', 8),
      getPublishedMarketplaceHomeListings('EU', 'latest', 8),
      getPublishedMarketplaceListingCount(localMarketCode),
      getPublishedMarketplaceListingCount('EU'),
      getVehicleNews((localMarketCode || 'SE').toLowerCase(), 1, 3),
    ])
  const newsCards = vehicleNews.articles.slice(0, 3)
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    [...localTopListings, ...localLatestListings, ...europeTopListings, ...europeLatestListings]
      .map((listing) => listing.seller_user_id)
      .filter((id): id is string => typeof id === 'string' && Boolean(id)),
  )
  const toHomeCard = (listing: HomeListingSource) =>
    mapHomeListingCard(listing, locale, displayCurrency, sellerProfiles.get(listing.seller_user_id || '')?.trust || 'unverified')
  const localListingSections: HomeListingSectionData[] = [
    {
      id: 'local-top',
      title: homeListingSectionTitle(locale, 'top', localMarketLabel),
      emptyText: homeEmptyListingText(locale, 'country'),
      items: await Promise.all(localTopListings.map(toHomeCard)),
    },
    {
      id: 'local-latest',
      title: homeListingSectionTitle(locale, 'latest', localMarketLabel),
      emptyText: homeEmptyListingText(locale, 'country'),
      items: await Promise.all(localLatestListings.map(toHomeCard)),
    },
  ]
  const europeListingSections: HomeListingSectionData[] = [
    {
      id: 'europe-top',
      title: homeListingSectionTitle(locale, 'top', homeEuropeLabel(locale)),
      emptyText: homeEmptyListingText(locale, 'europe'),
      items: await Promise.all(europeTopListings.map(toHomeCard)),
    },
    {
      id: 'europe-latest',
      title: homeListingSectionTitle(locale, 'latest', homeEuropeLabel(locale)),
      emptyText: homeEmptyListingText(locale, 'europe'),
      items: await Promise.all(europeLatestListings.map(toHomeCard)),
    },
  ]
  const listingSections =
    localMarketCode === 'EU'
      ? localListingSections
      : [...localListingSections, ...europeListingSections]

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="-mt-[2px] bg-white pt-0">
        <div className="relative min-h-[665px] overflow-visible bg-[#d9e5f1] sm:min-h-[610px] lg:min-h-[620px]">
          <Image
            src="/autorell-home-hero-street-cars.jpg"
            alt={t.heroAlt}
            fill
            priority
            className="object-cover object-[center_58%]"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[54%] w-[34%] bg-[radial-gradient(ellipse_at_8%_18%,rgba(255,237,198,0.16)_0%,rgba(255,244,224,0.08)_38%,rgba(255,255,255,0)_72%)]"
          />
          <div className="relative z-10 flex min-h-[665px] w-[100dvw] max-w-none items-start px-4 pb-8 pt-6 sm:mx-auto sm:min-h-[610px] sm:w-full sm:max-w-[var(--autorell-page-max)] sm:px-8 lg:min-h-[620px] lg:items-center lg:px-6 lg:py-10 2xl:px-8">
            <HomeHeroVehicleSearch
              locale={locale}
              localListingCount={localListingCount}
              europeListingCount={europeListingCount}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#fbfcfe] py-9 sm:py-16">
        <div className={homeContentContainerClass}>
          <HomeVehicleNewsScroller
            title={t.vehicleNewsTitle}
            allNewsHref={localizePublicHref(locale, '/vehicle-news')}
            allNewsLabel={t.allNews}
            scrollLabel={t.newsScrollLabel}
          >
            {newsCards.map((item) => (
              <VehicleNewsCard
                key={item.id}
                item={item}
                category={t.newsCategory}
                readTime={t.newsReadTime}
                locale={locale}
              />
            ))}
          </HomeVehicleNewsScroller>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className={homeContentContainerClass}>
          <div className="space-y-10">
            {listingSections.map((section) => (
              <HomeListingSection key={section.id} section={section} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <HomeSellerAudienceSection copy={t} locale={locale} />

      <PublicFooter locale={locale} />
    </main>
  )
}

function HomeSellerAudienceSection({
  copy,
  locale,
}: {
  copy: Record<keyof typeof homeCopy.en, string>
  locale: PublicLocale
}) {
  return (
    <section className="border-t border-[#e5eaf2] bg-white py-14 sm:py-20">
      <div className={homeContentContainerClass}>
        <div className="mx-auto max-w-[1050px]">
          <h2 className="max-w-[780px] text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#101828] sm:text-[46px]">
            {copy.sellerCtaTitle}
          </h2>

          <div className="mt-10 grid gap-10 sm:mt-14 md:grid-cols-2 md:gap-20">
            <div>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#101828] sm:text-[26px]">
                {copy.privateTitle}
              </h3>
              <p className="mt-4 max-w-[480px] text-[16px] leading-7 text-[#344054]">
                {copy.privateText}
              </p>
              <Link
                href={localizePublicHref(locale, '/account/listings/new')}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#101828] px-5 text-sm font-semibold text-white transition hover:bg-[#1d2939]"
              >
                {copy.privateCta}
              </Link>
            </div>

            <div>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#101828] sm:text-[26px]">
                {copy.businessTitle}
              </h3>
              <p className="mt-4 max-w-[520px] text-[16px] leading-7 text-[#344054]">
                {copy.businessText}
              </p>
              <Link
                href={localizePublicHref(locale, '/register?onboarding=1&account=business')}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#101828] px-5 text-sm font-semibold text-white transition hover:bg-[#1d2939]"
              >
                {copy.businessCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VehicleNewsCard({
  item,
  category,
  readTime,
  locale,
}: {
  item: PublicNewsArticle
  category: string
  readTime: string
  locale: PublicLocale
}) {
  const href = localizePublicHref(locale, `/vehicle-news/${item.slug}`)
  return (
    <Link
      href={href}
      className="group w-full flex-none snap-start overflow-hidden rounded-[10px] border border-[#d8e0ec] bg-white shadow-sm sm:w-auto sm:rounded-[12px]"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[10px] bg-[#eef3f8] sm:aspect-[16/10] sm:rounded-none">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 640px) 86vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <NoPhotoFrame className="h-full w-full border-0" compact locale={locale} />
        )}
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="text-[11px] font-medium text-[#667085]">
          {item.category?.label || category} | {item.readingTime ? `${item.readingTime} min` : readTime}
        </div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-[1.35] text-[#101828] transition group-hover:text-[#0866ff] sm:text-[16px] sm:leading-[1.35]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#667085]">{item.excerpt}</p>
        <span className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0866ff] sm:mt-4">
          {readMoreLabel(locale)}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

function readMoreLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Läs mer'
  if (locale === 'de') return 'Mehr lesen'
  if (locale === 'en') return 'Read more'
  return translatePublic(locale, 'Read more')
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
        {item.isFeatured ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#0866ff] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {featuredListingLabel(locale)}
          </span>
        ) : item.isTopPlacement ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#101828] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {topListingLabel(locale)}
          </span>
        ) : null}
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
  const href = localizePublicHref(locale, '/vehicle-news')
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

function featuredListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Utvald'
  if (locale === 'de') return 'Ausgewählt'
  if (locale === 'en') return 'Featured'
  return translatePublic(locale, 'Featured')
}

function topListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Toppannons'
  if (locale === 'de') return 'Top-Anzeige'
  if (locale === 'en') return 'Sponsored'
  return translatePublic(locale, 'Sponsored')
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
  featured_status?: string | null
  featured_started_at?: string | null
  featured_expires_at?: string | null
  boost_status?: string | null
  boost_started_at?: string | null
  boost_expires_at?: string | null
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
    href: buildListingPath(listing, locale),
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
    isFeatured: isActiveWindow(listing.featured_status, listing.featured_started_at, listing.featured_expires_at),
    isTopPlacement: isActiveWindow(listing.boost_status, listing.boost_started_at, listing.boost_expires_at),
  }
}

function isActiveWindow(status?: string | null, startedAt?: string | null, expiresAt?: string | null) {
  const now = Date.now()
  return status === 'active' &&
    Boolean(startedAt) &&
    Boolean(expiresAt) &&
    new Date(String(startedAt)).getTime() <= now &&
    new Date(String(expiresAt)).getTime() > now
}


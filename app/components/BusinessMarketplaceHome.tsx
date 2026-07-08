import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HomeHeroVehicleSearch from './HomeHeroVehicleSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import {
  categorySearchPath,
  marketplaceCategories,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { getEuCountryName } from '@/lib/eu-countries'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const homeContentContainerClass =
  'mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[1010px] sm:px-8 xl:max-w-[1060px]'

const homeCopy = {
  sv: {
    heroAlt: 'Europeisk fordonsmarknad för privatpersoner och företag',
    vehicleNewsTitle: 'Fordonsnyheter',
    allNews: 'Alla nyheter',
    topListsTitle: 'Topplistor',
    allTopLists: 'Alla topplistor',
    newsCategory: 'Fordonsmarknad',
    newsReadTime: '2 min läsning',
  },
  en: {
    heroAlt: 'European vehicle marketplace for private and business sellers',
    vehicleNewsTitle: 'Vehicle news',
    allNews: 'All news',
    topListsTitle: 'Top lists',
    allTopLists: 'All top lists',
    newsCategory: 'Vehicle market',
    newsReadTime: '2 min read',
  },
  de: {
    heroAlt: 'Europäischer Fahrzeugmarktplatz für Privatpersonen und Unternehmen',
    vehicleNewsTitle: 'Fahrzeugnews',
    allNews: 'Alle News',
    topListsTitle: 'Toplisten',
    allTopLists: 'Alle Toplisten',
    newsCategory: 'Fahrzeugmarkt',
    newsReadTime: '2 Min. Lesezeit',
  },
} as const

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
    marketCode || (locale === 'sv' ? 'SE' : locale === 'de' ? 'DE' : 'EU')
  const localMarketLabel =
    localMarketCode === 'EU'
      ? 'Europe'
      : getEuCountryName(localMarketCode, locale)
  const newsCards = getVehicleNewsCards(locale)
  const topListSections = getTopListSections(locale, localMarketLabel)

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="-mt-[2px] bg-white pt-0">
        <div className="relative min-h-[665px] overflow-hidden bg-[#d9e5f1] sm:min-h-[610px] lg:min-h-[620px]">
          <Image
            src="/autorell-home-hero-city-parking.jpg"
            alt={t.heroAlt}
            fill
            priority
            className="object-cover object-center saturate-[.82] contrast-[.90] brightness-[1.04] sepia-[.22]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_2%,rgba(255,248,235,.34),rgba(255,248,235,0)_40%),linear-gradient(180deg,rgba(255,250,240,.24)_0%,rgba(234,198,135,.22)_48%,rgba(255,255,255,.25)_100%),linear-gradient(90deg,rgba(94,66,38,.12)_0%,rgba(255,238,207,.10)_50%,rgba(94,66,38,.12)_100%)] shadow-[inset_0_22px_80px_rgba(86,61,36,.08)] lg:bg-[radial-gradient(circle_at_52%_8%,rgba(255,248,235,.30),rgba(255,248,235,0)_38%),linear-gradient(90deg,rgba(94,66,38,.14)_0%,rgba(255,236,203,.14)_50%,rgba(94,66,38,.12)_100%)]" />
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
              href={localizePublicHref(locale, '/buying-guide')}
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
              />
            ))}
          </div>

          <div className="mt-12 flex items-end justify-between gap-5 sm:mt-16">
            <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] sm:text-[34px]">
              {t.topListsTitle}
            </h2>
            <Link
              href={localizePublicHref(locale, '/marketplace')}
              className="hidden items-center gap-2 text-sm font-semibold text-[#0866ff] sm:inline-flex"
            >
              {t.allTopLists}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 space-y-8">
            {topListSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-[#101828]">
                  {section.title}
                </h3>
                <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
                  {section.items.map((item, index) => (
                    <TopListCard
                      key={`${section.title}-${item.title}`}
                      item={item}
                      index={index + 1}
                    />
                  ))}
                </div>
              </div>
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
}: {
  item: { title: string; href: string }
  category: string
  readTime: string
}) {
  return (
    <Link href={item.href} className="group w-full flex-none snap-start sm:w-auto">
      <NoPhotoFrame className="aspect-[16/10] rounded-[8px]" />
      <div className="mt-2 text-[11px] font-medium text-[#667085]">
        {category} · {readTime}
      </div>
      <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#101828] transition group-hover:text-[#0866ff]">
        {item.title}
      </h3>
    </Link>
  )
}

function TopListCard({
  item,
  index,
}: {
  item: { title: string; meta: string; href: string }
  index: number
}) {
  return (
    <Link
      href={item.href}
      className="group relative w-[152px] flex-none snap-start overflow-hidden rounded-[8px] border border-[#d8e0ec] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(16,24,40,.12)] sm:w-auto"
    >
      <NoPhotoFrame className="aspect-[5/3]" compact />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/70 via-[#101828]/10 to-transparent" />
      <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#101828]/70 text-xs font-semibold text-white">
        {index}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-2 text-white">
        <h4 className="line-clamp-2 text-[12px] font-semibold leading-4">
          {item.title}
        </h4>
        <p className="mt-1 text-[11px] font-medium text-white/90">{item.meta}</p>
      </div>
    </Link>
  )
}

function NoPhotoFrame({
  className = '',
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={`grid place-items-center border border-[#e3e8f0] bg-[#f6f7f9] text-center text-[#9b9ca0] ${className}`}
      aria-label="No photo available"
    >
      <span className={`${compact ? 'text-[15px]' : 'text-[22px]'} font-light uppercase leading-[1.35] tracking-[0.04em]`}>
        No photo
        <br />
        available
      </span>
    </div>
  )
}

function getVehicleNewsCards(locale: PublicLocale) {
  const href = localizePublicHref(locale, '/buying-guide')
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
  return [
    { title: 'Så jämför köpare fordon mellan europeiska marknader', href },
    { title: 'Checklista för en tryggare fordonsaffär online', href },
    { title: 'Det här betyder pris, plats och historik i en annons', href },
  ]
}

function getTopListSections(locale: PublicLocale, marketLabel: string) {
  const categoryLabel = (slug: MarketplaceCategorySlug) => {
    const category = marketplaceCategories.find((item) => item.slug === slug)
    if (!category) return slug
    if (locale === 'de') return category.labels.de
    if (locale === 'en') return category.labels.en
    return category.labels.sv
  }
  const href = (slug: MarketplaceCategorySlug) =>
    localizePublicHref(locale, categorySearchPath(slug))
  const latestTitle =
    locale === 'de'
      ? `Neueste Anzeigen in ${marketLabel}`
      : locale === 'en'
        ? `Latest listings in ${marketLabel}`
        : `Senaste annonserna i ${marketLabel}`
  const watchedTitle =
    locale === 'de'
      ? `Top-Anzeigen in ${marketLabel}`
      : locale === 'en'
        ? `Top listings in ${marketLabel}`
        : `Topplista i ${marketLabel}`
  const meta =
    locale === 'de' ? 'Premiumplatz' : locale === 'en' ? 'Premium spot' : 'Premiumplats'

  return [
    {
      title: latestTitle,
      items: (['cars', 'vans', 'motorcycles', 'motorhomes', 'trucks'] as MarketplaceCategorySlug[]).map((slug) => ({
        title: categoryLabel(slug),
        meta,
        href: href(slug),
      })),
    },
    {
      title: watchedTitle,
      items: (['construction', 'agriculture', 'caravans', 'electric-bikes', 'e-scooters'] as MarketplaceCategorySlug[]).map((slug) => ({
        title: categoryLabel(slug),
        meta,
        href: href(slug),
      })),
    },
  ]
}

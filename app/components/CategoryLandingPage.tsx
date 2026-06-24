import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  ChevronDown,
  CircleHelp,
  Compass,
  Gauge,
  Globe2,
  Layers3,
  MessagesSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react'
import {
  categoryLandingCopy,
  getCategoryLanding,
  localizedCategorySearchLabel,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import { getRequestLocale } from '@/lib/request-locale'
import {
  formatMarketplacePrice,
  marketplacePublicSelect,
  normalizeMarketplaceCategory,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import type { PublicLocale } from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import { createAdminClient } from '@/lib/supabase/admin'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

export async function generateCategoryLandingMetadata(
  slug: MarketplaceCategorySlug,
): Promise<Metadata> {
  const [locale, requestHeaders] = await Promise.all([
    getRequestLocale(),
    headers(),
  ])
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const hostname = (
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  ).toLowerCase()
  const origin = hostname.includes('autorell.de')
    ? 'https://www.autorell.de'
    : hostname.includes('autorell.com')
      ? 'https://www.autorell.com'
      : 'https://www.autorell.se'
  const canonical = `${origin}${config.path}`
  const title = `${localized.label} | Autorell`

  return {
    title: { absolute: title },
    description: localized.intro,
    alternates: { canonical },
    openGraph: {
      title,
      description: localized.intro,
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
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const copy = categoryLandingCopy(locale)
  const searchLabel = localizedCategorySearchLabel(locale, localized.label)
  const belowSearch = categoryBelowSearchContent(slug, locale, localized.label)
  const { data: featuredListings } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('status', 'published')
    .eq('category', normalizeMarketplaceCategory(slug))
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(8)
  const topListings: LandingTopListing[] = (featuredListings || []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    meta: [
      listing.model_year,
      listing.mileage_km ? `${Number(listing.mileage_km).toLocaleString('sv-SE')} km` : null,
      listing.operating_hours ? `${Number(listing.operating_hours).toLocaleString('sv-SE')} h` : null,
      listing.country_code,
    ]
      .filter(Boolean)
      .join(' · '),
    price: formatMarketplacePrice(Number(listing.price), listing.currency, locale),
    imageUrl: listing.images?.[0] || null,
    packageId: listing.package_id || 'free_7d',
    priority: Number(listing.priority || 0),
  }))
  const countries = euCountries
    .map(([code]) => code)
    .map((code) => ({
      code: code.toUpperCase(),
      label: getEuCountryName(code, locale),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketplaceChannel={{ label: localized.label, slug }}
      />

      <section className="relative pb-10 pt-0 sm:pb-14 lg:pb-12 lg:pt-6">
        <div className="market-blob pointer-events-none absolute -left-24 top-8 hidden h-64 w-64 bg-[#0866ff]/10 sm:block" aria-hidden="true" />
        <div className="market-blob pointer-events-none absolute -right-28 bottom-0 hidden h-72 w-72 bg-[#e8f4ef] lg:block" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1600px] px-0 lg:px-7">
          <div className="relative h-[270px] overflow-hidden shadow-[0_10px_28px_rgba(16,24,40,.08)] sm:h-[330px] lg:h-[310px] lg:rounded-[28px] xl:h-[330px]">
            <Image
              src={config.heroImage}
              alt={localized.label}
              fill
              priority
              sizes="(min-width: 1600px) 1544px, 100vw"
              className="object-cover"
              style={{ objectPosition: config.heroPosition }}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_42px_rgba(16,24,40,.14)]" />
            <div className="absolute inset-0 flex items-center justify-center px-6 pb-10 text-center sm:pb-6 lg:inset-auto lg:left-14 lg:top-20 lg:block lg:max-w-[610px] lg:px-0 lg:pb-0 lg:text-left">
              <div>
              <h1 className="text-[32px] leading-[.98] tracking-[-0.04em] text-[#101828] drop-shadow-[0_2px_14px_rgba(255,255,255,.9)] [overflow-wrap:anywhere] sm:text-[48px] lg:text-[52px] xl:text-[56px]">
                {localized.label}
              </h1>
              <p className="mx-auto mt-3 max-w-[540px] text-sm font-medium leading-6 text-[#344054] drop-shadow-[0_2px_12px_rgba(255,255,255,.85)] sm:mt-4 sm:text-base sm:leading-7 lg:mx-0">
                {localized.intro}
              </p>
              </div>
            </div>
          </div>

          <form
            action={`/marketplace/${slug}`}
            method="get"
            className="relative z-10 mx-4 -mt-9 grid min-w-0 gap-2 rounded-[24px] border border-[#e1e7f0] bg-white p-3 shadow-[0_18px_42px_rgba(16,24,40,.10)] sm:mx-8 sm:-mt-9 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:mx-auto lg:-mt-9 lg:max-w-[1180px] lg:grid-cols-[1fr_1fr_1.2fr_auto_auto] lg:items-center lg:gap-0 lg:rounded-[24px] lg:px-4 lg:py-3"
          >
            <SearchField label={copy.allEurope} icon={Globe2}>
              <select name="country" defaultValue="" aria-label={copy.allEurope} className="h-10 w-full appearance-none bg-transparent pr-8 text-[15px] font-medium outline-none">
                <option value="">{copy.allEurope}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-[#475467]" />
            </SearchField>

            <SearchField label={copy.allMakes} icon={Layers3}>
              <input name="make" placeholder={copy.allMakes} aria-label={copy.allMakes} className="h-10 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <SearchField label={localized.searchHint} icon={Search}>
              <input name="q" placeholder={localized.searchHint} className="h-10 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <Link
              href={`/marketplace/${slug}#marketplace-results`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-[#d8e4f6] bg-[#f8fbff] px-3 text-sm font-semibold text-[#0866ff] sm:col-span-2 lg:col-span-1 lg:mx-3 lg:border-0 lg:bg-transparent lg:underline lg:decoration-2 lg:underline-offset-8"
            >
              <SlidersHorizontal className="h-4 w-4 lg:hidden" />
              {locale === 'sv' ? 'Fler val' : locale === 'de' ? 'Mehr Optionen' : 'More options'}
            </Link>

            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.22)] transition hover:bg-[#075bd8] lg:rounded-[20px]">
              <Search className="h-5 w-5" />
              {searchLabel}
            </button>
          </form>
        </div>
      </section>

      <CategoryBelowSearchSection
        slug={slug}
        content={belowSearch}
        topListings={topListings}
      />

      <section id="guides" className="relative scroll-mt-28 overflow-hidden border-y border-[#e5e7eb] bg-[#f8f8f6] py-14 sm:py-20">
        <div className="market-blob pointer-events-none absolute -right-24 top-10 h-72 w-72 bg-[#0866ff]/8" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="grid gap-6 border-b border-[#d7e0eb] pb-9 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">{copy.guideEyebrow}</p>
              <h2 className="mt-4 max-w-2xl text-[36px] leading-[1.03] tracking-[-0.05em] sm:text-[48px]">{copy.guideTitle}</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#667085] lg:justify-self-end">{copy.guideText}</p>
          </div>

          <div className="mt-8 divide-y divide-[#dbe3ed] rounded-[26px] border border-[#dbe3ed] bg-white px-5 shadow-[0_18px_50px_rgba(16,24,40,.06)] sm:px-8">
            {localized.guideTopics.map((topic, index) => {
              const Icon = guideIcon(slug, index)
              return (
                <Link
                  key={topic}
                  href={`/marketplace/${slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-7 sm:py-8"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#edf4ff] text-[#0866ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0866ff]">Guide 0{index + 1}</span>
                    <strong className="mt-1 block text-lg tracking-[-0.03em] sm:text-xl">{topic}</strong>
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#0866ff] transition group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#d7dde8] bg-[linear-gradient(125deg,#ffffff_0%,#f8fbff_52%,#f4f8f5_100%)]">
            <div className="market-blob pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 bg-white/70" aria-hidden="true" />
            <div className="relative grid lg:grid-cols-[1.02fr_.98fr]">
              <div className="p-7 sm:p-11 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                  {copy.sellPrefix} {localized.singular}
                </p>
                <h2 className="mt-4 max-w-xl text-[38px] leading-[1.02] tracking-[-0.055em] sm:text-[50px]">
                  {copy.sellPrefix} {localized.singular} {copy.sellSuffix}
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-[#5d6b7d]">{copy.sellText}</p>
                <Link href={`/salj-fordon?category=${slug}`} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-bold text-white">
                  {copy.sellCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-t border-[#d7dde8] bg-white/72 p-7 backdrop-blur-sm sm:p-10 lg:border-l lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">{copy.faqEyebrow}</p>
                <h3 className="mt-3 text-3xl leading-[1.05] tracking-[-0.045em]">{copy.faqTitle}</h3>
                <div className="mt-7 divide-y divide-[#dbe3ed] border-y border-[#dbe3ed]">
                  {[
                    [copy.faqSearchQuestion, copy.faqSearchAnswer],
                    [copy.faqSellQuestion, copy.faqSellAnswer],
                  ].map(([question, answer]) => (
                    <details key={question} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                        {question}
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#0866ff] shadow-sm transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="max-w-xl pt-4 text-sm leading-7 text-[#667085]">{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function SearchField({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Search
  children: React.ReactNode
}) {
  return (
    <label className="relative flex min-w-0 items-center gap-3 rounded-[18px] border border-[#dce4ee] bg-white px-3 py-2 transition focus-within:border-[#9bbdf0] focus-within:ring-4 focus-within:ring-[#0866ff]/8 lg:rounded-none lg:border-0 lg:border-r lg:border-[#e3e8f0] lg:px-5 lg:py-0 lg:focus-within:ring-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-[#f2f6ff] text-[#0866ff] lg:hidden">
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#101828] lg:text-[11px] lg:tracking-normal">{label}</span>
        <span className="relative block">{children}</span>
      </span>
    </label>
  )
}

type BelowSearchContent = {
  discoverTitle: string
  topRatedTitle: string
  popularTitle: string
  viewAll: string
  upgradeTitle: string
  upgradeText: string
  upgradeCta: string
  discover: Array<{
    title: string
    text: string
    href: string
  }>
  popular: string[]
}

type LandingTopListing = {
  id: string
  title: string
  meta: string
  price: string
  imageUrl: string | null
  packageId: string
  priority: number
}

function CategoryBelowSearchSection({
  slug,
  content,
  topListings,
}: {
  slug: MarketplaceCategorySlug
  content: BelowSearchContent
  topListings: LandingTopListing[]
}) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <h2 className="text-center text-xl font-semibold tracking-[-0.03em] text-[#101828]">
          {content.discoverTitle}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {content.discover.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[24px] border border-[#dfe5ee] bg-[linear-gradient(145deg,#ffffff,#f8fbff)] p-5 shadow-[0_12px_30px_rgba(16,24,40,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(16,24,40,.1)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#edf4ff] text-[#0866ff]">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold leading-5 tracking-[-0.03em] text-[#101828]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{item.text}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">
              {content.topRatedTitle}
            </h2>
            <Link href={`/marketplace/${slug}`} className="hidden text-sm font-bold text-[#0866ff] underline underline-offset-4 sm:inline-flex">
              {content.viewAll}
            </Link>
          </div>
          {topListings.length ? (
          <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3">
            {topListings.map((item, index) => (
              <Link
                key={item.id}
                href={`/marketplace/${slug}`}
                className="min-w-[230px] snap-start overflow-hidden rounded-[24px] border border-[#dfe5ee] bg-white shadow-[0_10px_28px_rgba(16,24,40,.06)] sm:min-w-[260px]"
              >
                <div className="relative aspect-[16/10] bg-[#f4f7fb] shadow-[inset_0_0_22px_rgba(16,24,40,.08)]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[#0866ff]">
                      <BadgeCheck className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/94 px-3 py-1 text-[10px] font-bold text-[#101828] shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#0866ff]" />
                    {item.priority > 0 || item.packageId.includes('premium') ? 'Premium' : index + 1}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold leading-5 text-[#101828]">{item.title}</h3>
                  <p className="mt-2 text-xs font-medium text-[#667085]">{item.meta}</p>
                  <p className="mt-4 text-lg font-bold tracking-[-0.03em] text-[#101828]">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="mt-5 rounded-[28px] border border-[#dfe5ee] bg-[linear-gradient(145deg,#ffffff,#f7fbff)] p-6 shadow-[0_12px_32px_rgba(16,24,40,.06)] sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <h3 className="text-lg font-bold tracking-[-0.03em] text-[#101828]">{content.upgradeTitle}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{content.upgradeText}</p>
              </div>
              <Link href={`/salj-fordon?category=${slug}&package=featured`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.22)] sm:mt-0">
                {content.upgradeCta}
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-center text-xl font-semibold tracking-[-0.03em] text-[#101828]">
            {content.popularTitle}
          </h2>
          <div className="mx-auto mt-6 grid max-w-[920px] grid-cols-2 gap-3 sm:grid-cols-4">
            {content.popular.map((item) => (
              <Link
                key={item}
                href={`/marketplace/${slug}?q=${encodeURIComponent(item)}`}
                className="grid min-h-20 place-items-center rounded-[22px] border border-[#dfe5ee] bg-[#f8fafc] px-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-[#344054] transition hover:border-[#9bbdf0] hover:bg-white hover:text-[#0866ff]"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function categoryBelowSearchContent(
  slug: MarketplaceCategorySlug,
  locale: PublicLocale,
  label: string,
): BelowSearchContent {
  const isDe = locale === 'de'
  const isEn = locale !== 'sv' && locale !== 'de'
  const discoverTitle = isDe
    ? `Mehr rund um ${label}`
    : isEn
      ? `Discover more for ${label.toLowerCase()}`
      : `Upptäck mer för ${label.toLowerCase()}`
  const topRatedTitle = isDe ? 'Top bewertete Anzeigen' : isEn ? 'Top rated listings' : 'Topprankade annonser'
  const popularTitle = isDe ? 'Beliebte Suchen' : isEn ? 'Popular searches' : 'Populära sökningar'
  const viewAll = isDe ? 'Alle anzeigen' : isEn ? 'View all' : 'Visa alla'
  const upgradeTitle = isDe
    ? 'Top-Platz fÃ¼r Ihre Anzeige buchen'
    : isEn
      ? 'Book higher listing visibility'
      : 'Boka hÃ¶gre synlighet fÃ¶r din annons'
  const upgradeText = isDe
    ? 'Top bewertete PlÃ¤tze werden aus echten Marketplace-Anzeigen mit hÃ¶herer PrioritÃ¤t gefÃ¼llt. Det nya paketet lyfter riktiga annonser, inte statiska exempel.'
    : isEn
      ? 'Top rated positions are filled from real marketplace listings with higher priority. The new package promotes real customer and business listings, not static examples.'
      : 'Topprankade platser fylls frÃ¥n riktiga marketplace-annonser med hÃ¶gre prioritet. Det nya paketet lyfter kunders och fÃ¶retags annonser, inte statiska exempel.'
  const upgradeCta = isDe ? 'Anzeige hervorheben' : isEn ? 'Promote listing' : 'Lyft annons'
  const shared = categorySpecificContent(slug)

  return {
    discoverTitle,
    topRatedTitle,
    popularTitle,
    viewAll,
    upgradeTitle,
    upgradeText,
    upgradeCta,
    discover: shared.discover.map((item) => ({
      title: translateThree(item.title, locale),
      text: translateThree(item.text, locale),
      href: item.href,
    })),
    popular: shared.popular,
  }
}

function translateThree(text: Record<'sv' | 'en' | 'de', string>, locale: PublicLocale) {
  return locale === 'de' ? text.de : locale === 'sv' ? text.sv : text.en
}

function categorySpecificContent(slug: MarketplaceCategorySlug) {
  const content = {
    cars: {
      discover: [
        card('Jämför bilar över hela EU', 'Compare cars across the EU', 'Autos in der EU vergleichen', 'Filtrera på land, skick och drivlina innan du kontaktar säljaren.', 'Filter by country, condition and drivetrain before contacting the seller.', 'Nach Land, Zustand und Antrieb filtern, bevor Sie den Verkäufer kontaktieren.', '/marketplace/cars', '/category-cars-hero.jpg'),
        card('Sälj din bil tryggt', 'Sell your car safely', 'Auto sicher verkaufen', 'Skapa annons, samla leads och hantera intresse direkt i Autorell.', 'Create a listing, collect leads and manage interest in Autorell.', 'Anzeige erstellen, Leads sammeln und Anfragen in Autorell verwalten.', '/salj-fordon?category=cars', '/category-vans-hero.jpg'),
        card('El, hybrid eller bensin', 'Electric, hybrid or petrol', 'Elektro, Hybrid oder Benzin', 'Hitta rätt drivlina för vardag, långresa och budget.', 'Find the right drivetrain for daily use, longer trips and budget.', 'Den passenden Antrieb für Alltag, Reise und Budget finden.', '/marketplace/cars?filter=El', '/category-cars-hero.jpg'),
      ],
      topRated: top(['Volkswagen Golf eHybrid', '10 200 mil · Sverige', '179 000 kr'], ['BMW 320d Touring', '8 400 mil · Tyskland', '21 900 €'], ['Volvo XC60 Recharge', '5 900 mil · Nederländerna', '389 000 kr'], ['Tesla Model 3 Long Range', '6 800 mil · Danmark', '31 500 €']),
      popular: ['Volvo', 'BMW', 'Audi', 'Tesla'],
    },
    vans: {
      discover: [
        card('Rätt skåp för jobbet', 'The right van for the job', 'Der richtige Transporter', 'Jämför lastutrymme, höjd och dragvikt för verksamheten.', 'Compare load space, height and towing weight for your business.', 'Laderaum, Höhe und Anhängelast für Ihr Geschäft vergleichen.', '/marketplace/vans', '/category-vans-hero.jpg'),
        card('Företagsklar transportbil', 'Business-ready vans', 'Bereit fürs Unternehmen', 'Hitta fordon med moms, historik och exportvänliga uppgifter.', 'Find vehicles with VAT, history and export-ready details.', 'Fahrzeuge mit MwSt., Historie und exportfähigen Daten finden.', '/marketplace/vans?filter=Moms', '/category-trucks-hero.jpg'),
        card('Eltransport i vardagen', 'Electric vans in daily use', 'Elektrotransporter im Alltag', 'Se räckvidd, laddning och total kostnad innan du väljer.', 'Review range, charging and total cost before choosing.', 'Reichweite, Laden und Gesamtkosten vor der Wahl prüfen.', '/marketplace/vans?filter=El', '/category-vans-hero.jpg'),
      ],
      topRated: top(['Mercedes-Benz Sprinter', '12 000 mil · Polen', '24 900 €'], ['Volkswagen Transporter', '9 500 mil · Sverige', '289 000 kr'], ['Ford Transit Custom', '7 800 mil · Tyskland', '22 400 €'], ['Renault Master L3H2', '11 400 mil · Frankrike', '18 900 €']),
      popular: ['Sprinter', 'Transit', 'Transporter', 'Master'],
    },
    motorcycles: {
      discover: [
        card('Touring eller pendling', 'Touring or commuting', 'Touring oder Pendeln', 'Välj MC efter sittställning, effekt och körmiljö.', 'Choose by riding position, power and use case.', 'Nach Sitzposition, Leistung und Einsatz wählen.', '/marketplace/motorcycles', '/category-motorcycles-hero.jpg'),
        card('Kontrollera begagnad MC', 'Check a used motorcycle', 'Gebrauchtes Motorrad prüfen', 'Fokusera på service, däck, bromsar och tidigare ägare.', 'Focus on service, tyres, brakes and ownership history.', 'Service, Reifen, Bremsen und Vorbesitzer prüfen.', '/marketplace/motorcycles?filter=Begagnad', '/category-motorcycles-hero.jpg'),
        card('Sälj inför säsongen', 'Sell before the season', 'Vor der Saison verkaufen', 'Lägg upp bilder och fakta som gör din motorcykel lätt att jämföra.', 'Publish photos and facts that make your bike easy to compare.', 'Bilder und Daten veröffentlichen, die den Vergleich erleichtern.', '/salj-fordon?category=motorcycles', '/category-cars-hero.jpg'),
      ],
      topRated: top(['BMW R 1250 GS', '3 200 mil · Tyskland', '16 900 €'], ['Yamaha MT-07', '1 800 mil · Sverige', '69 000 kr'], ['Honda Africa Twin', '2 900 mil · Italien', '12 800 €'], ['Kawasaki Z900', '2 100 mil · Polen', '8 900 €']),
      popular: ['BMW GS', 'Yamaha MT', 'Honda', 'Kawasaki'],
    },
    motorhomes: {
      discover: [
        card('Planlösning som passar', 'Layouts that fit', 'Passender Grundriss', 'Jämför sovplatser, längd och förvaring inför nästa resa.', 'Compare berths, length and storage before your next trip.', 'Schlafplätze, Länge und Stauraum vergleichen.', '/marketplace/motorhomes', '/category-motorhomes-hero.jpg'),
        card('Importera tryggare', 'Buy across borders safely', 'Sicher grenzübergreifend kaufen', 'Se land, utrustning och dokument innan du bokar visning.', 'Review country, equipment and documents before booking a viewing.', 'Land, Ausstattung und Unterlagen vor Besichtigung prüfen.', '/marketplace/motorhomes?country=', '/category-caravans-hero.jpg'),
        card('Sälj din husbil', 'Sell your motorhome', 'Wohnmobil verkaufen', 'Visa planlösning, service och skick tydligt för seriösa köpare.', 'Show layout, service and condition clearly for serious buyers.', 'Grundriss, Service und Zustand klar darstellen.', '/salj-fordon?category=motorhomes', '/category-motorhomes-hero.jpg'),
      ],
      topRated: top(['Hymer B-Class', '6 700 mil · Tyskland', '74 900 €'], ['Knaus Sky TI', '4 800 mil · Sverige', '699 000 kr'], ['Adria Matrix Plus', '5 200 mil · Nederländerna', '62 500 €'], ['Dethleffs Trend', '7 100 mil · Danmark', '58 900 €']),
      popular: ['Hymer', 'Knaus', 'Adria', 'Dethleffs'],
    },
    caravans: {
      discover: [
        card('Husvagn för familjen', 'Caravans for families', 'Wohnwagen für Familien', 'Jämför sovplatser, totalvikt och smart förvaring.', 'Compare berths, total weight and practical storage.', 'Schlafplätze, Gesamtgewicht und Stauraum vergleichen.', '/marketplace/caravans', '/category-caravans-hero.jpg'),
        card('Dragvikt utan krångel', 'Towing without guesswork', 'Anhängen ohne Rätsel', 'Hitta modeller som passar bilen och körkortet.', 'Find models that fit your car and driving licence.', 'Modelle passend zu Auto und Führerschein finden.', '/marketplace/caravans?filter=Dragvikt', '/category-vans-hero.jpg'),
        card('Säsongsklar annons', 'A listing ready for the season', 'Saisonfertige Anzeige', 'Lyft fram fukttest, utrustning och planlösning.', 'Highlight damp checks, equipment and layout.', 'Dichtigkeitsprüfung, Ausstattung und Grundriss zeigen.', '/salj-fordon?category=caravans', '/category-caravans-hero.jpg'),
      ],
      topRated: top(['Hobby Excellent', '2021 · Sverige', '279 000 kr'], ['Kabe Royal', '2020 · Sverige', '449 000 kr'], ['Adria Alpina', '2019 · Tyskland', '31 900 €'], ['Fendt Bianco', '2022 · Nederländerna', '28 500 €']),
      popular: ['Kabe', 'Hobby', 'Adria', 'Fendt'],
    },
    trucks: {
      discover: [
        card('Lastbil för rätt uppdrag', 'Trucks for the right job', 'Lkw für den Einsatz', 'Jämför axlar, påbyggnad och driftprofil.', 'Compare axle setup, body type and operating profile.', 'Achsen, Aufbau und Einsatzprofil vergleichen.', '/marketplace/trucks', '/category-trucks-hero.jpg'),
        card('Export och dokument', 'Export and documents', 'Export und Unterlagen', 'Se land, moms och tekniska uppgifter innan kontakt.', 'Review country, VAT and technical data before contact.', 'Land, MwSt. und technische Daten vor Kontakt prüfen.', '/marketplace/trucks?filter=Export', '/category-vans-hero.jpg'),
        card('Sälj tyngre fordon', 'Sell heavy vehicles', 'Schwere Fahrzeuge verkaufen', 'Bygg en annons med bilder, mått, vikt och service.', 'Create a listing with photos, dimensions, weight and service.', 'Anzeige mit Bildern, Maßen, Gewicht und Service erstellen.', '/salj-fordon?category=trucks', '/category-trucks-hero.jpg'),
      ],
      topRated: top(['Volvo FH 500', '68 000 mil · Sverige', '54 900 €'], ['Scania R450', '72 000 mil · Polen', '49 500 €'], ['Mercedes Actros', '61 000 mil · Tyskland', '57 900 €'], ['MAN TGX 18.470', '58 000 mil · Nederländerna', '52 900 €']),
      popular: ['Volvo FH', 'Scania', 'Actros', 'MAN'],
    },
    agriculture: {
      discover: [
        card('Maskiner för säsongen', 'Machines for the season', 'Maschinen für die Saison', 'Jämför timmar, effekt och redskap för lantbruket.', 'Compare hours, power and implements for farming.', 'Stunden, Leistung und Geräte vergleichen.', '/marketplace/agriculture', '/category-agriculture-hero.jpg'),
        card('Drifttimmar och service', 'Hours and service', 'Stunden und Service', 'Se vad som är dokumenterat innan du planerar transport.', 'Review documentation before planning transport.', 'Unterlagen prüfen, bevor Transport geplant wird.', '/marketplace/agriculture?filter=Service', '/category-construction-hero.jpg'),
        card('Sälj lantbruksmaskin', 'Sell farm machinery', 'Landmaschine verkaufen', 'Visa skick, redskap och kapacitet för rätt köpare.', 'Show condition, implements and capacity for the right buyer.', 'Zustand, Geräte und Kapazität klar zeigen.', '/salj-fordon?category=agriculture', '/category-agriculture-hero.jpg'),
      ],
      topRated: top(['John Deere 6155R', '4 200 h · Danmark', '92 000 €'], ['Fendt 724 Vario', '5 100 h · Tyskland', '118 000 €'], ['Valtra T174', '3 900 h · Finland', '86 500 €'], ['New Holland T7', '4 800 h · Polen', '74 900 €']),
      popular: ['John Deere', 'Fendt', 'Valtra', 'New Holland'],
    },
    construction: {
      discover: [
        card('Entreprenad för jobbet', 'Construction machines for the job', 'Baumaschinen für den Einsatz', 'Jämför vikt, hydraulik och redskap innan köp.', 'Compare weight, hydraulics and attachments before buying.', 'Gewicht, Hydraulik und Anbaugeräte vergleichen.', '/marketplace/construction', '/category-construction-hero.jpg'),
        card('Kontroll före transport', 'Check before transport', 'Vor Transport prüfen', 'Se mått, skick och servicehistorik tydligare.', 'Review dimensions, condition and service history clearly.', 'Maße, Zustand und Servicehistorie prüfen.', '/marketplace/construction?filter=Service', '/category-trucks-hero.jpg'),
        card('Sälj maskin med fakta', 'Sell machinery with facts', 'Maschine mit Daten verkaufen', 'Lägg upp timmar, vikt, redskap och bilder i samma flöde.', 'Publish hours, weight, attachments and photos in one flow.', 'Stunden, Gewicht, Geräte und Bilder veröffentlichen.', '/salj-fordon?category=construction', '/category-construction-hero.jpg'),
      ],
      topRated: top(['Volvo EC220E', '5 600 h · Sverige', '86 000 €'], ['CAT 320', '6 100 h · Tyskland', '92 500 €'], ['Hitachi ZX210', '4 900 h · Polen', '79 900 €'], ['Komatsu WA320', '7 200 h · Nederländerna', '68 500 €']),
      popular: ['Volvo CE', 'CAT', 'Hitachi', 'Komatsu'],
    },
    'electric-bikes': {
      discover: [
        card('Elcykel för vardagen', 'E-bikes for daily life', 'E-Bikes für den Alltag', 'Jämför batteri, motorplacering och användning.', 'Compare battery, motor position and use case.', 'Akku, Motorposition und Nutzung vergleichen.', '/marketplace/electric-bikes', '/category-electric-bikes-hero.jpg'),
        card('Pendla smartare', 'Commute smarter', 'Smarter pendeln', 'Hitta city, cargo och trekking-modeller i hela EU.', 'Find city, cargo and trekking models across the EU.', 'City-, Cargo- und Trekkingmodelle in der EU finden.', '/marketplace/electric-bikes?filter=Pendling', '/category-e-scooters-hero.jpg'),
        card('Sälj din elcykel', 'Sell your e-bike', 'E-Bike verkaufen', 'Visa batteriskick, laddare och kvitto för tryggare affär.', 'Show battery condition, charger and receipt for trust.', 'Akkuzustand, Ladegerät und Rechnung zeigen.', '/salj-fordon?category=electric-bikes', '/category-electric-bikes-hero.jpg'),
      ],
      topRated: top(['Trek Allant+ 7', '625 Wh · Sverige', '24 900 kr'], ['Cube Kathmandu Hybrid', '750 Wh · Tyskland', '2 650 €'], ['Riese & Müller Charger', '625 Wh · Nederländerna', '3 100 €'], ['Specialized Turbo Vado', '710 Wh · Danmark', '2 900 €']),
      popular: ['Trek', 'Cube', 'Riese Müller', 'Specialized'],
    },
    'e-scooters': {
      discover: [
        card('Elspark för korta resor', 'E-scooters for short trips', 'E-Scooter für kurze Wege', 'Jämför räckvidd, bromsar och vikt för vardagen.', 'Compare range, brakes and weight for everyday use.', 'Reichweite, Bremsen und Gewicht vergleichen.', '/marketplace/e-scooters', '/category-e-scooters-hero.jpg'),
        card('Regler i olika länder', 'Rules across countries', 'Regeln nach Land', 'Välj modell med koll på hastighet och användningsområde.', 'Choose with speed and use case in mind.', 'Mit Blick auf Geschwindigkeit und Nutzung wählen.', '/marketplace/e-scooters?filter=Regler', '/category-electric-bikes-hero.jpg'),
        card('Sälj kompakt mobilitet', 'Sell compact mobility', 'Kompakte Mobilität verkaufen', 'Lägg upp batteri, skick och tillbehör tydligt.', 'Show battery, condition and accessories clearly.', 'Akku, Zustand und Zubehör klar zeigen.', '/salj-fordon?category=e-scooters', '/category-e-scooters-hero.jpg'),
      ],
      topRated: top(['Ninebot Max G2', '70 km räckvidd · Sverige', '6 900 kr'], ['Xiaomi 4 Ultra', '55 km räckvidd · Tyskland', '620 €'], ['Vsett 9+', '85 km räckvidd · Polen', '890 €'], ['NIU KQi3 Max', '65 km räckvidd · Danmark', '740 €']),
      popular: ['Ninebot', 'Xiaomi', 'Vsett', 'NIU'],
    },
  }

  return content[slug]
}

function card(
  svTitle: string,
  enTitle: string,
  deTitle: string,
  svText: string,
  enText: string,
  deText: string,
  href: string,
  image: string,
) {
  return {
    title: { sv: svTitle, en: enTitle, de: deTitle },
    text: { sv: svText, en: enText, de: deText },
    href,
    image,
  }
}

function top(...items: Array<[string, string, string]>) {
  return items.map(([title, meta, price]) => ({
    title: { sv: title, en: title, de: title },
    meta: { sv: meta, en: meta, de: meta },
    price,
  }))
}

function guideIcon(slug: MarketplaceCategorySlug, index: number) {
  const profiles = {
    cars: [Gauge, BarChart3, Sparkles],
    vans: [Layers3, BarChart3, Wrench],
    motorcycles: [Gauge, ShieldCheck, Compass],
    motorhomes: [Layers3, Gauge, Compass],
    caravans: [Layers3, ShieldCheck, Wrench],
    trucks: [Layers3, BarChart3, Wrench],
    agriculture: [Gauge, Wrench, Globe2],
    construction: [Layers3, Wrench, ShieldCheck],
    'electric-bikes': [Gauge, BarChart3, ShieldCheck],
    'e-scooters': [Gauge, Wrench, CircleHelp],
  } as const
  return profiles[slug][index] || MessagesSquare
}

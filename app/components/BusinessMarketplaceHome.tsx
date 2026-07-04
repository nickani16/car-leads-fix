import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Globe2,
  LockKeyhole,
  MapPin,
  Search,
} from 'lucide-react'
import MarketplaceSearch from './MarketplaceSearch'
import NewsletterSignup from './NewsletterSignup'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import CountryFlag from './CountryFlag'
import SavedListingButton from './SavedListingButton'
import {
  marketplaceCategories,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { categoryLandingPath } from '@/lib/category-landings'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingSpecChips } from '@/lib/listing-display'
import { buildListingPath } from '@/lib/listing-url'
import {
  getMarketplaceSellerTrustByUserIds,
  getPublishedMarketplaceListings,
} from '@/lib/marketplace-public-data'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type HomeListing = {
  id: string
  slug: MarketplaceCategorySlug
  categoryLabel: string
  title: string
  meta: string
  location: string
  countryCode: string
  price: string
  imageUrl: string | null
  fuelType: string | null
  gearbox: string | null
  mileageKm: number | null
  modelYear: number | null
  sellerTrust: 'verified' | 'unverified'
}

type CategoryCard = {
  slug: MarketplaceCategorySlug
  label: string
  href: string
  count: number
}

const homeContainerClass =
  'mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8'

const homeCopy = {
  sv: {
    heroAlt: 'Europeisk fordonsmarknad för privatpersoner och företag',
    heroEyebrow: 'Europas fordonsmarknad',
    heroTitle: 'Köp och sälj fordon över hela Europa.',
    heroTypingPrefix: 'Europas marknadsplats för fordon.',
    heroText:
      'Europas marknadsplats för bilar, transportbilar, motorcyklar, lastbilar och mer. Riktiga annonser. En plattform.',
    statIntroTitle: 'En marknadsplats. Hela Europa.',
    statIntroText: 'Riktiga fordon. Riktiga människor. Riktiga möjligheter.',
    countries: 'Länder',
    categories: 'Alla större kategorier',
    realListings: 'Riktiga annonser från säljare',
    safeTrade: 'Tryggare affärer',
    featuredTitle: 'Utvalda annonser från alla kategorier',
    viewAllListings: 'Visa alla annonser',
    viewAllVehicles: 'Visa alla fordon',
    vehicleFinderEyebrow: 'Hitta ditt fordon',
    vehicleFinderTitle: 'Välj fordonstyp och hitta rätt annons.',
    vehicleFinderText:
      'Oavsett vad du söker har vi rätt fordon för dig. Välj en kategori för att komma igång.',
    noListingsTitle: 'Inga publicerade annonser ännu.',
    noListingsText:
      'När riktiga annonser publiceras visas de här automatiskt. Bli först med att lägga upp ett fordon på Autorell.',
    createListing: 'Lägg upp annons',
    browseTitle: 'Bläddra efter kategori',
    listing: 'annons',
    listings: 'annonser',
    sellTitle: 'Sälj ditt fordon till köpare över hela Europa',
    sellText: 'Det är gratis att börja. Få mer synlighet och sälj snabbare.',
    sellCta: 'Sälj ditt fordon',
    whyTitle: 'Därför väljer säljare Autorell',
    whyText:
      'Vi gör det enklare att köpa och sälja fordon över landsgränser, med tydligare information och seriösare kontakter.',
    verifiedTitle: 'Verifierade säljare',
    verifiedText: 'Konton och annonser granskas för bättre förtroende.',
    secureTitle: 'Tryggare process',
    secureText: 'Strukturerad fordonsdata och tydliga kontaktflöden.',
    europeTitle: 'Byggt för EU',
    europeText: 'Land, stad, valuta och fordonsdata visas tydligt.',
    countryTitle: 'Populärt i ditt land',
    countryChange: 'Ändra',
    today: 'Nya annonser idag',
    priceDrops: 'Prisändringar idag',
    soldWeek: 'Fordon sålda denna vecka',
    seeLocal: 'Se svenska annonser',
  },
  en: {
    heroAlt: 'European vehicle marketplace for private and business sellers',
    heroEyebrow: "Europe's vehicle marketplace",
    heroTitle: 'Buy and sell vehicles across Europe.',
    heroTypingPrefix: "Europe's marketplace for vehicles.",
    heroText:
      "Europe's marketplace for cars, vans, motorcycles, trucks and more. Real listings. One platform.",
    statIntroTitle: 'One marketplace. All of Europe.',
    statIntroText: 'Real vehicles. Real people. Real opportunities.',
    countries: 'Countries',
    categories: 'All major categories',
    realListings: 'Real listings from sellers',
    safeTrade: 'Safe and secure trade',
    featuredTitle: 'Featured listings from all categories',
    viewAllListings: 'View all listings',
    viewAllVehicles: 'View all vehicles',
    vehicleFinderEyebrow: 'Find your vehicle',
    vehicleFinderTitle: 'Choose a vehicle type and find the right listing.',
    vehicleFinderText:
      'Whatever you are looking for, Autorell helps you start in the right category.',
    noListingsTitle: 'No published listings yet.',
    noListingsText:
      'When real listings are published, they will appear here automatically. Be the first to list a vehicle on Autorell.',
    createListing: 'Create listing',
    browseTitle: 'Browse by category',
    listing: 'listing',
    listings: 'listings',
    sellTitle: 'Sell your vehicle to buyers across Europe',
    sellText: 'It is free to start. Get more visibility and sell faster.',
    sellCta: 'Sell your vehicle',
    whyTitle: 'Why sellers choose Autorell',
    whyText:
      'We make it easier to buy and sell vehicles across borders, with clearer information and more serious contacts.',
    verifiedTitle: 'Verified sellers',
    verifiedText: 'Accounts and listings are reviewed for better trust.',
    secureTitle: 'Safer process',
    secureText: 'Structured vehicle data and clear contact flows.',
    europeTitle: 'Built for the EU',
    europeText: 'Country, city, currency and vehicle data are shown clearly.',
    countryTitle: 'Popular in your country',
    countryChange: 'Change',
    today: 'New listings today',
    priceDrops: 'Price drops today',
    soldWeek: 'Vehicles sold this week',
    seeLocal: 'See local listings',
  },
  de: {
    heroAlt: 'Europäischer Fahrzeugmarktplatz für Privatpersonen und Unternehmen',
    heroEyebrow: 'Europas Fahrzeugmarkt',
    heroTitle: 'Fahrzeuge in ganz Europa kaufen und verkaufen.',
    heroTypingPrefix: 'Europas Marktplatz für Fahrzeuge.',
    heroText:
      'Europas Marktplatz für Autos, Transporter, Motorräder, Lkw und mehr. Echte Anzeigen. Eine Plattform.',
    statIntroTitle: 'Ein Marktplatz. Ganz Europa.',
    statIntroText: 'Echte Fahrzeuge. Echte Menschen. Echte Möglichkeiten.',
    countries: 'Länder',
    categories: 'Alle wichtigen Kategorien',
    realListings: 'Echte Anzeigen von Verkäufern',
    safeTrade: 'Sichere Geschäfte',
    featuredTitle: 'Ausgewählte Anzeigen aus allen Kategorien',
    viewAllListings: 'Alle Anzeigen ansehen',
    viewAllVehicles: 'Alle Fahrzeuge ansehen',
    vehicleFinderEyebrow: 'Fahrzeug finden',
    vehicleFinderTitle: 'Fahrzeugtyp wählen und passende Anzeige finden.',
    vehicleFinderText:
      'Egal wonach Sie suchen, Autorell hilft Ihnen beim Start in der richtigen Kategorie.',
    noListingsTitle: 'Noch keine veröffentlichten Anzeigen.',
    noListingsText:
      'Sobald echte Anzeigen veröffentlicht werden, erscheinen sie hier automatisch. Inserieren Sie als Erste ein Fahrzeug auf Autorell.',
    createListing: 'Anzeige erstellen',
    browseTitle: 'Nach Kategorie stöbern',
    listing: 'Anzeige',
    listings: 'Anzeigen',
    sellTitle: 'Verkaufen Sie Ihr Fahrzeug an Käufer in ganz Europa',
    sellText: 'Der Einstieg ist kostenlos. Erhalten Sie mehr Sichtbarkeit und verkaufen Sie schneller.',
    sellCta: 'Fahrzeug verkaufen',
    whyTitle: 'Warum Verkäufer Autorell wählen',
    whyText:
      'Wir machen den Fahrzeughandel über Grenzen hinweg einfacher, mit klareren Informationen und seriöseren Kontakten.',
    verifiedTitle: 'Verifizierte Verkäufer',
    verifiedText: 'Konten und Anzeigen werden für mehr Vertrauen geprüft.',
    secureTitle: 'Sicherer Prozess',
    secureText: 'Strukturierte Fahrzeugdaten und klare Kontaktwege.',
    europeTitle: 'Für die EU gebaut',
    europeText: 'Land, Stadt, Währung und Fahrzeugdaten werden klar angezeigt.',
    countryTitle: 'Beliebt in Ihrem Land',
    countryChange: 'Ändern',
    today: 'Neue Anzeigen heute',
    priceDrops: 'Preisänderungen heute',
    soldWeek: 'Verkaufte Fahrzeuge diese Woche',
    seeLocal: 'Lokale Anzeigen ansehen',
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
  const { featuredListings } = await getHomeMarketplaceData(locale, marketCode)
  const localMarketCode =
    marketCode || (locale === 'sv' ? 'SE' : locale === 'de' ? 'DE' : 'EU')
  const localMarketLabel =
    localMarketCode === 'EU'
      ? 'Europe'
      : getEuCountryName(localMarketCode, locale)

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="bg-white pt-0">
        <div className="relative w-full">
          <div className="px-0">
            <div className="relative min-h-[250px] overflow-hidden rounded-none bg-white sm:min-h-[330px] lg:min-h-[320px]">
              <Image
                src="/autorell-home-hero-family-dealer.webp"
                alt={t.heroAlt}
                fill
                preload
                className="object-cover object-[42%_center] sm:scale-[1.03] sm:object-[52%_42%]"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,26,.18)_0%,rgba(3,10,26,.105)_31%,rgba(3,10,26,.025)_58%,rgba(3,10,26,0)_100%)] sm:bg-[linear-gradient(90deg,rgba(3,10,26,.12)_0%,rgba(3,10,26,.075)_34%,rgba(3,10,26,.02)_60%,rgba(3,10,26,0)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,10,26,.02)_0%,rgba(3,10,26,0)_42%)]" />

              <div className="relative mx-auto flex min-h-[250px] max-w-[390px] flex-col justify-center px-5 py-7 min-[430px]:max-w-[430px] sm:min-h-[330px] sm:max-w-[var(--autorell-page-max)] sm:px-8 sm:py-10 lg:min-h-[320px] lg:py-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/95 [text-shadow:0_2px_14px_rgba(0,0,0,.34)] sm:text-xs sm:text-white/85">
                  {t.heroEyebrow}
                </p>
                <h1 className="mt-5 max-w-[330px] text-[28px] leading-[.99] tracking-[-0.035em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,.36)] sm:max-w-[720px] sm:text-[40px] sm:tracking-[-0.045em] lg:max-w-[790px] lg:text-[45px]">
                  {t.heroTitle}
                </h1>
                <p className="mt-4 max-w-[700px] text-[16px] font-normal leading-snug text-white [text-shadow:0_3px_18px_rgba(0,0,0,.28)] sm:text-[18px] lg:text-[19px]">
                  {t.heroTypingPrefix}
                </p>
              </div>
            </div>
          </div>

          <div className={`relative z-10 -mt-[34px] sm:-mt-[43px] ${homeContainerClass}`}>
            <div className="sm:px-16 lg:px-28 xl:px-32">
              <MarketplaceSearch locale={locale} defaultCountry={localMarketCode} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className={homeContainerClass}>
          <div className="flex items-end justify-between gap-5">
            <h2 className="text-3xl leading-tight tracking-[-0.045em] sm:text-[38px]">
              {t.featuredTitle}
            </h2>
            <Link
              href={localizePublicHref(locale, '/marketplace/cars')}
              className="hidden items-center gap-2 text-sm font-bold text-[#0866ff] sm:inline-flex"
            >
              {t.viewAllListings}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredListings.length ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-4 lg:grid-cols-4">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} locale={locale} />
                ))}
              </div>
              <div className="mt-9 flex justify-center">
                <Link
                  href={localizePublicHref(locale, '/marketplace/cars')}
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#b8cffd] bg-white px-7 text-sm font-bold text-[#0866ff] shadow-sm transition hover:border-[#0866ff] hover:bg-[#f8fbff]"
                >
                  {t.viewAllListings}
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-9 overflow-hidden rounded-[18px] border border-[#dfe6f2] bg-[#f8fbff] p-6 text-center shadow-[0_14px_36px_rgba(16,24,40,.05)] sm:p-10">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#0866ff] text-white">
                <Search className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-2xl tracking-[-0.04em]">{t.noListingsTitle}</h3>
              <p className="mx-auto mt-3 max-w-2xl break-words text-sm leading-7 text-[#667085]">
                {t.noListingsText}
              </p>
              <Link
                href={localizePublicHref(locale, '/salj-fordon')}
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[12px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_12px_26px_rgba(8,102,255,.22)]"
              >
                {t.createListing}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white pb-14 sm:pb-20">
        <div className={homeContainerClass}>
          <div className="relative overflow-hidden rounded-[20px] border border-[#dfe6f2] bg-[#e8f1ff]">
            <div className="absolute inset-y-0 right-0 hidden w-[56%] sm:block">
              <Image
                src="/autorell-sell-keys.png"
                alt=""
                fill
                className="object-cover object-left"
                sizes="720px"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#dbe8fb_0%,#edf4ff_28%,rgba(246,249,253,.94)_48%,rgba(246,249,253,.54)_63%,rgba(246,249,253,.12)_82%,rgba(246,249,253,0)_100%)]" />
            <div className="relative px-7 py-10 sm:min-h-[220px] sm:px-12 sm:py-12">
              <h2 className="max-w-[470px] text-2xl leading-[1.04] tracking-[-0.045em] min-[375px]:text-3xl sm:text-[42px]">
                {t.sellTitle}
              </h2>
              <p className="mt-4 max-w-[430px] text-sm leading-7 text-[#475467]">
                {t.sellText}
              </p>
              <Link
                href={localizePublicHref(locale, '/salj-fordon')}
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[12px] bg-[#0866ff] px-6 text-sm font-bold text-white"
              >
                {t.sellCta}
              </Link>
            </div>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-[18px] border border-[#dfe6f2] bg-white lg:grid-cols-2">
            <div className="p-7 sm:p-9">
              <h2 className="text-2xl tracking-[-0.04em]">{t.whyTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                {t.whyText}
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {[
                  { title: t.verifiedTitle, text: t.verifiedText, icon: BadgeCheck },
                  { title: t.secureTitle, text: t.secureText, icon: LockKeyhole },
                  { title: t.europeTitle, text: t.europeText, icon: Globe2 },
                ].map(({ title, text, icon: Icon }) => (
                  <div key={title}>
                    <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#edf4ff] text-[#0866ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-bold">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#667085]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#dfe6f2] p-7 sm:p-9 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl tracking-[-0.04em]">{t.countryTitle}</h2>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                    <CountryFlag code={localMarketCode.toLowerCase()} className="h-[18px] w-[27px]" />
                    {localMarketLabel}
                  </p>
                </div>
                <Link href="#market-selector" className="text-xs font-bold text-[#0866ff]">
                  {t.countryChange}
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[t.today, t.priceDrops, t.soldWeek].map((label) => (
                  <div key={label}>
                    <strong className="block text-2xl tracking-[-0.04em]">0</strong>
                    <span className="mt-2 block text-xs leading-5 text-[#667085]">{label}</span>
                  </div>
                ))}
              </div>
              <Link
                href={localizePublicHref(locale, '/marketplace/cars')}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]"
              >
                {t.seeLocal}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <NewsletterSignup locale={locale} category="home" variant="home" />
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

async function getHomeMarketplaceData(
  locale: PublicLocale,
  marketCode?: string,
): Promise<{
  featuredListings: HomeListing[]
  categoryCards: CategoryCard[]
  totalListings: number
}> {
  const language = marketplaceLanguage(locale)
  const displayCurrency = displayCurrencyForMarket(marketCode)

  try {
    const listings = await getPublishedMarketplaceListings(120)
    const counts = new Map<string, number>()

    for (const listing of listings) {
      counts.set(listing.category, (counts.get(listing.category) || 0) + 1)
    }

    const categoryCards = marketplaceCategories.map((category) => ({
      slug: category.slug,
      label:
        locale === 'sv' || locale === 'de' || locale === 'en'
          ? category.labels[language]
          : translatePublic(locale, category.labels.en),
      href: localizePublicHref(locale, categoryLandingPath(category.slug)),
      count: counts.get(category.slug) || 0,
    }))

    const sellerTrust = await getMarketplaceSellerTrustByUserIds(
      listings.map((listing) => listing.seller_user_id).filter(Boolean),
    )

    const featuredListings = await Promise.all(listings.slice(0, 16).map(async (listing) => {
      const category = marketplaceCategories.find(
        (item) => item.slug === listing.category,
      )
      const categoryLabel = category
        ? locale === 'sv' || locale === 'de' || locale === 'en'
          ? category.labels[language]
          : translatePublic(locale, category.labels.en)
        : String(listing.category)
      const meta = [
        listing.model_year,
        listing.mileage_km
          ? `${Number(listing.mileage_km).toLocaleString('sv-SE')} km`
          : null,
        listing.operating_hours
          ? `${Number(listing.operating_hours).toLocaleString('sv-SE')} h`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')

      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      return {
        id: listing.id,
        slug: listing.category as MarketplaceCategorySlug,
        categoryLabel,
        title: listing.title,
        meta,
        location: [listing.city, getEuCountryName(listing.country_code, locale)]
          .filter(Boolean)
          .join(', '),
        countryCode: listing.country_code,
        price: price.label,
        imageUrl: listing.images?.[0] || null,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        mileageKm: listing.mileage_km,
        modelYear: listing.model_year,
        sellerTrust: sellerTrust.get(listing.seller_user_id || '') || 'unverified',
      }
    }))

    return {
      featuredListings,
      categoryCards,
      totalListings: listings.length,
    }
  } catch {
    return {
      featuredListings: [],
      categoryCards: marketplaceCategories.map((category) => ({
        slug: category.slug,
        label:
          locale === 'sv' || locale === 'de' || locale === 'en'
            ? category.labels[language]
            : translatePublic(locale, category.labels.en),
        href: localizePublicHref(locale, categoryLandingPath(category.slug)),
        count: 0,
      })),
      totalListings: 0,
    }
  }
}

function ListingCard({
  listing,
  locale,
}: {
  listing: HomeListing
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
    <Link
      href={localizePublicHref(
        locale,
        buildListingPath({
          id: listing.id,
          title: listing.title,
          city: listing.location,
        }),
      )}
      className="group overflow-hidden rounded-[12px] border border-[#dfe6f2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(16,24,40,.1)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#edf4ff]">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#0866ff]">
            <CarFront className="h-10 w-10" />
          </div>
        )}
        <div className="absolute right-2 top-2 scale-[.68] origin-top-right sm:right-3 sm:top-3 sm:scale-[.78]">
          <SavedListingButton listingId={listing.id} />
        </div>
        {listing.sellerTrust === 'verified' ? (
          <span className="absolute left-2 top-2 rounded-[7px] bg-[#0866ff] px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:left-3 sm:top-3">
            {locale === 'sv' ? 'Verifierad' : locale === 'de' ? 'Geprüft' : 'Verified'}
          </span>
        ) : null}
        <CountryFlag
          code={listing.countryCode || 'eu'}
          className="absolute bottom-2 right-2 h-6 w-6 rounded-full sm:bottom-3 sm:right-3 sm:h-7 sm:w-7"
        />
      </div>
      <div className="p-3 sm:p-4">
        <span className="inline-flex rounded-[5px] bg-[#edf4ff] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#0866ff] sm:px-2 sm:text-[10px] sm:tracking-[0.08em]">
          {listing.categoryLabel}
        </span>
        <h3 className="mt-2 line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[18px] text-[#101828] sm:mt-3 sm:min-h-[40px] sm:text-sm sm:leading-5">
          {listing.title}
        </h3>
        {listing.meta ? (
          <p className="mt-1.5 line-clamp-1 text-[11px] font-medium text-[#667085] sm:mt-2 sm:text-xs">{listing.meta}</p>
        ) : null}
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
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#667085] sm:mt-2 sm:gap-1.5 sm:text-xs">
          <MapPin className="h-3 w-3 shrink-0 text-[#0866ff] sm:h-3.5 sm:w-3.5" />
          {listing.location}
        </p>
        <p className="mt-3 text-sm font-bold tracking-[-0.02em] text-[#101828] sm:mt-4 sm:text-base sm:tracking-[-0.03em]">
          {listing.price}
        </p>
      </div>
    </Link>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReviewWordmark({
  brand,
  label,
  rating,
}: {
  brand: 'trustpilot' | 'google' | 'feefo' | 'reviews'
  label: string
  rating: string
}) {
  const brandClass = {
    trustpilot: 'text-[#00b67a]',
    google: 'text-[#5f6368]',
    feefo: 'text-[#59636f]',
    reviews: 'text-[#667085]',
  }[brand]

  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] px-4 py-3">
      <div className={`flex items-center gap-2 text-[22px] font-bold leading-none ${brandClass}`}>
        {brand === 'trustpilot' ? <span className="text-[#00b67a]">★</span> : null}
        {brand === 'google' ? <GoogleMark /> : null}
        {brand === 'feefo' ? <FeefoDots /> : null}
        {brand === 'reviews' ? <ReviewsMark /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-[13px] tracking-[0.08em] text-[#101828]">★★★★★</div>
      <span className="mt-1 text-xs font-semibold text-[#667085]">{rating}</span>
    </div>
  )
}

function GoogleMark() {
  return (
    <span className="relative grid h-5 w-5 place-items-center rounded-full border-[3px] border-[#4285f4] text-[0]" aria-hidden="true">
      <span className="absolute -right-[3px] top-[6px] h-[3px] w-3 bg-[#4285f4]" />
      <span className="absolute -left-[3px] -top-[3px] h-3 w-3 rounded-tl-full border-l-[3px] border-t-[3px] border-[#ea4335]" />
      <span className="absolute -bottom-[3px] -left-[3px] h-3 w-3 rounded-bl-full border-b-[3px] border-l-[3px] border-[#fbbc05]" />
      <span className="absolute -bottom-[3px] right-[1px] h-3 w-3 rounded-br-full border-b-[3px] border-r-[3px] border-[#34a853]" />
    </span>
  )
}

function FeefoDots() {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <span key={item} className="h-2.5 w-2.5 rounded-full bg-[#9aa4b2]" />
      ))}
    </span>
  )
}

function ReviewsMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#667085] text-[11px] font-bold text-white" aria-hidden="true">
      R
    </span>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BriefcaseBusiness,
  BusFront,
  CarFront,
  Check,
  Construction,
  Globe2,
  Handshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Tractor,
  Truck,
  UserRound,
  Warehouse,
} from 'lucide-react'
import MarketplaceSearch from './MarketplaceSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import {
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const categoryItems = [
  { labels: ['Bilar', 'Cars', 'Autos'], href: '/marketplace/cars', icon: CarFront },
  { labels: ['Transportbilar', 'Vans', 'Transporter'], href: '/marketplace/vans', icon: BusFront },
  { labels: ['Motorcyklar', 'Motorcycles', 'Motorräder'], href: '/marketplace/motorcycles', icon: Bike },
  { labels: ['Husbilar', 'Motorhomes', 'Wohnmobile'], href: '/marketplace/motorhomes', icon: BusFront },
  { labels: ['Husvagnar', 'Caravans', 'Wohnwagen'], href: '/marketplace/caravans', icon: Warehouse },
  { labels: ['Lastbilar', 'Trucks', 'Lkw'], href: '/marketplace/trucks', icon: Truck },
  { labels: ['Lantbruksmaskiner', 'Agricultural machinery', 'Landmaschinen'], href: '/marketplace/agriculture', icon: Tractor },
  { labels: ['Entreprenadmaskiner', 'Construction machinery', 'Baumaschinen'], href: '/marketplace/construction', icon: Construction },
  { labels: ['Elcyklar', 'Electric bikes', 'E-Bikes'], href: '/marketplace/electric-bikes', icon: Leaf },
  { labels: ['Elsparkcyklar', 'E-scooters', 'E-Scooter'], href: '/marketplace/e-scooters', icon: Leaf },
] as const

const homeCopy = {
  sv: {
    heroAlt: 'Europeisk fordonsmarknad för privatpersoner och företag',
    eyebrow: 'Europas marknadsplats för fordon',
    heroTitle: 'Köp och sälj fordon över hela Europa.',
    heroText: 'En sammanhållen marknadsplats för privatpersoner och företag. Hitta rätt fordon, nå fler köpare och genomför tryggare affärer över landsgränser.',
    assurances: ['Verifierade konton', 'Handel över hela EU', 'Strukturerad fordonsdata'],
    sellVehicle: 'Sälj ett fordon',
    businessSolutions: 'Lösningar för företag',
    mobilityEyebrow: 'En marknad för all mobilitet',
    mobilityTitle: 'Från vardagsbil till tung utrustning.',
    explore: 'Utforska hela marknaden',
    builtFor: 'Byggd för hela marknaden',
    platformTitle: 'En plattform. Olika behov. Samma höga standard.',
    privateEyebrow: 'För privatpersoner',
    privateTitle: 'Köp smartare. Sälj till en större marknad.',
    privateText: 'Hitta fordon i flera europeiska marknader eller skapa en tydlig försäljning med räckvidd bortom din lokala marknad.',
    sellYours: 'Sälj ditt fordon',
    businessEyebrow: 'För företag',
    businessTitle: 'Hantera lager, volymer och affärer i Europa.',
    businessText: 'Publicera fordon, nå professionella köpare och samla gränsöverskridande handel i ett strukturerat arbetsflöde.',
    discoverBusiness: 'Upptäck företagslösningen',
    reachEyebrow: 'Europeisk räckvidd',
    reachTitle: 'Fler möjligheter på varje sida av affären.',
    reachText: 'Autorell för samman utbud och efterfrågan mellan europeiska marknader — med tydligare information och tryggare motparter.',
    statMarkets: 'EU-marknader',
    statCategories: 'fordonskategorier',
    statMarket: 'sammanhållen marknad',
    statReach: 'gränsöverskridande räckvidd',
    verifiedTitle: 'Verifierade aktörer',
    verifiedText: 'Tydligare identitet och professionella konton skapar bättre förutsättningar för varje affär.',
    safeTitle: 'Tryggare process',
    safeText: 'Strukturerad information och tydliga steg minskar osäkerheten mellan köpare och säljare.',
    crossTitle: 'Enklare över gränser',
    crossText: 'En gemensam marknad gör det lättare att hitta rätt motpart i Sverige och resten av Europa.',
  },
  en: {
    heroAlt: 'European vehicle marketplace for private and business sellers',
    eyebrow: "Europe's vehicle marketplace",
    heroTitle: 'Buy and sell vehicles across Europe.',
    heroText: 'One connected marketplace for private sellers and businesses. Find the right vehicle, reach more buyers and trade with greater confidence across borders.',
    assurances: ['Verified accounts', 'Trade across the EU', 'Structured vehicle data'],
    sellVehicle: 'Sell a vehicle',
    businessSolutions: 'Business solutions',
    mobilityEyebrow: 'One market for every kind of mobility',
    mobilityTitle: 'From everyday cars to heavy equipment.',
    explore: 'Explore the marketplace',
    builtFor: 'Built for the whole market',
    platformTitle: 'One platform. Different needs. The same high standard.',
    privateEyebrow: 'For private sellers',
    privateTitle: 'Buy smarter. Sell to a larger market.',
    privateText: 'Find vehicles across European markets or create a clear listing with reach beyond your local market.',
    sellYours: 'Sell your vehicle',
    businessEyebrow: 'For businesses',
    businessTitle: 'Manage inventory, volume and deals across Europe.',
    businessText: 'List vehicles, reach professional buyers and manage cross-border trade in one structured workflow.',
    discoverBusiness: 'Explore business solutions',
    reachEyebrow: 'European reach',
    reachTitle: 'More opportunities on both sides of every deal.',
    reachText: 'Autorell connects supply and demand across European markets with clearer information and more trusted counterparties.',
    statMarkets: 'EU markets',
    statCategories: 'vehicle categories',
    statMarket: 'connected marketplace',
    statReach: 'cross-border reach',
    verifiedTitle: 'Verified participants',
    verifiedText: 'Clearer identities and professional accounts create better conditions for every transaction.',
    safeTitle: 'A safer process',
    safeText: 'Structured information and clear steps reduce uncertainty between buyers and sellers.',
    crossTitle: 'Simpler across borders',
    crossText: 'One marketplace makes it easier to find the right counterparty across Europe.',
  },
  de: {
    heroAlt: 'Europäischer Fahrzeugmarktplatz für Privatpersonen und Unternehmen',
    eyebrow: 'Europas Marktplatz für Fahrzeuge',
    heroTitle: 'Fahrzeuge in ganz Europa kaufen und verkaufen.',
    heroText: 'Ein gemeinsamer Marktplatz für Privatpersonen und Unternehmen. Finden Sie das richtige Fahrzeug, erreichen Sie mehr Käufer und handeln Sie sicherer über Grenzen hinweg.',
    assurances: ['Verifizierte Konten', 'Handel in der gesamten EU', 'Strukturierte Fahrzeugdaten'],
    sellVehicle: 'Fahrzeug verkaufen',
    businessSolutions: 'Lösungen für Unternehmen',
    mobilityEyebrow: 'Ein Markt für jede Art von Mobilität',
    mobilityTitle: 'Vom Alltagsauto bis zur schweren Maschine.',
    explore: 'Marktplatz entdecken',
    builtFor: 'Für den gesamten Markt entwickelt',
    platformTitle: 'Eine Plattform. Verschiedene Bedürfnisse. Ein hoher Standard.',
    privateEyebrow: 'Für Privatpersonen',
    privateTitle: 'Cleverer kaufen. In einen größeren Markt verkaufen.',
    privateText: 'Finden Sie Fahrzeuge auf europäischen Märkten oder erstellen Sie eine klare Anzeige mit Reichweite über Ihren lokalen Markt hinaus.',
    sellYours: 'Fahrzeug verkaufen',
    businessEyebrow: 'Für Unternehmen',
    businessTitle: 'Bestand, Volumen und Geschäfte in Europa verwalten.',
    businessText: 'Fahrzeuge inserieren, professionelle Käufer erreichen und grenzüberschreitenden Handel strukturiert verwalten.',
    discoverBusiness: 'Unternehmenslösung entdecken',
    reachEyebrow: 'Europäische Reichweite',
    reachTitle: 'Mehr Möglichkeiten auf beiden Seiten des Geschäfts.',
    reachText: 'Autorell verbindet Angebot und Nachfrage auf europäischen Märkten mit klareren Informationen und verlässlicheren Handelspartnern.',
    statMarkets: 'EU-Märkte',
    statCategories: 'Fahrzeugkategorien',
    statMarket: 'gemeinsamer Marktplatz',
    statReach: 'grenzüberschreitende Reichweite',
    verifiedTitle: 'Verifizierte Teilnehmer',
    verifiedText: 'Klare Identitäten und professionelle Konten schaffen bessere Voraussetzungen für jedes Geschäft.',
    safeTitle: 'Sicherer Prozess',
    safeText: 'Strukturierte Informationen und klare Schritte reduzieren Unsicherheit zwischen Käufern und Verkäufern.',
    crossTitle: 'Einfacher über Grenzen',
    crossText: 'Ein gemeinsamer Marktplatz erleichtert die Suche nach dem richtigen Handelspartner in Europa.',
  },
} as const

export default function BusinessMarketplaceHome({
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
  const labelIndex = locale === 'sv' ? 0 : locale === 'de' ? 2 : 1
  const categories = categoryItems.map((item) => ({
    ...item,
    label:
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? item.labels[labelIndex]
        : translatePublic(locale, item.labels[1]),
  }))
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="px-4 pb-20 pt-7 sm:px-7 sm:pb-24 sm:pt-9 lg:px-10">
        <div className="relative mx-auto max-w-[1340px]">
          <div className="relative min-h-[480px] overflow-hidden rounded-[30px] border border-[#dce5f7] bg-white sm:min-h-[570px]">
            <Image
              src="/autorell-volvo-hero.jpg"
              alt={t.heroAlt}
              fill
              preload
              className="object-cover object-[72%_center]"
              sizes="(max-width: 1400px) 100vw, 1340px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(252,253,255,.99)_0%,rgba(238,245,255,.97)_34%,rgba(230,240,255,.7)_58%,rgba(255,255,255,0)_82%)]" />
            <div className="market-blob absolute -left-32 -top-40 h-[460px] w-[460px] bg-[#dfeaff]/55" />

            <div className="relative flex min-h-[480px] max-w-[720px] flex-col justify-center px-7 pb-28 pt-12 text-[#101828] sm:min-h-[570px] sm:px-14 sm:pb-32 lg:px-20">
              <span className="inline-flex w-fit items-center gap-2 rounded-[13px] border border-[#c9d9ff] bg-white/75 px-4 py-2 text-xs font-semibold text-[#0866ff] backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                {t.eyebrow}
              </span>
              <h1 className="mt-7 max-w-[300px] text-[38px] leading-[.98] tracking-[-0.055em] sm:max-w-[610px] sm:text-6xl sm:leading-[.97] sm:tracking-[-0.06em] lg:text-[74px]">
                {t.heroTitle}
              </h1>
              <p className="mt-6 max-w-[300px] text-base leading-7 text-[#526179] sm:max-w-[580px] sm:text-lg sm:leading-8">
                {t.heroText}
              </p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                {t.assurances.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-xs font-semibold text-[#475467]">
                    <Check className="h-4 w-4 text-[#0866ff]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-[78px] min-w-0 px-3 sm:-mt-[52px] sm:px-8 lg:px-16">
            <MarketplaceSearch locale={locale} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-[#475467]">
              <Link href="/salj-fordon" className="inline-flex items-center gap-2 transition hover:text-[#0866ff]">
                {t.sellVehicle}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/foretag" className="inline-flex items-center gap-2 transition hover:text-[#0866ff]">
                {t.businessSolutions}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e4e7ec] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                {t.mobilityEyebrow}
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                {t.mobilityTitle}
              </h2>
            </div>
            <Link href="/marketplace/cars" className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]">
              {t.explore}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-[26px] border border-[#e4e7ec] bg-[#f9fafb] sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ label, href, icon: Icon }, index) => (
              <Link
                key={label}
                href={href}
                className={`group min-h-36 border-[#e4e7ec] bg-white p-5 transition hover:z-10 hover:bg-[#f4f7ff] ${
                  index % 2 === 0 ? 'border-r' : ''
                } ${index < 5 ? 'border-b' : ''} sm:border-r`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[#dce6ff] bg-[#eef4ff] text-[#0866ff] transition group-hover:scale-105 group-hover:bg-[#0866ff] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="mt-7 flex items-center justify-between gap-2 font-semibold">
                  {label}
                  <ArrowRight className="h-4 w-4 text-[#0866ff] transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fb] py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              {t.builtFor}
            </p>
            <h2 className="mt-4 text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">
              {t.platformTitle}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[30px] border border-[#dde3ef] bg-white p-8 shadow-[0_18px_55px_rgba(16,24,40,.06)] sm:p-11">
              <div className="market-blob absolute -right-20 -top-24 h-64 w-64 bg-[#eaf1ff]" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#0866ff] text-white">
                  <UserRound className="h-6 w-6" />
                </span>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#667085]">
                  {t.privateEyebrow}
                </p>
                <h3 className="mt-3 max-w-lg text-3xl leading-[1.08] tracking-[-0.04em]">
                  {t.privateTitle}
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-[#667085]">
                  {t.privateText}
                </p>
                <Link href="/salj-fordon" className="mt-8 inline-flex items-center gap-2 font-bold text-[#0866ff]">
                  {t.sellYours}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[30px] border border-[#cad9fb] bg-[#edf4ff] p-8 text-[#101828] shadow-[0_18px_55px_rgba(16,24,40,.06)] sm:p-11">
              <div className="market-blob absolute -bottom-32 -right-20 h-72 w-72 bg-[#d9e7ff]" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#0866ff] text-white">
                  <BriefcaseBusiness className="h-6 w-6" />
                </span>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#667085]">
                  {t.businessEyebrow}
                </p>
                <h3 className="mt-3 max-w-lg text-3xl leading-[1.08] tracking-[-0.04em]">
                  {t.businessTitle}
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-[#667085]">
                  {t.businessText}
                </p>
                <Link href="/foretag" className="mt-8 inline-flex items-center gap-2 font-bold text-[#0866ff]">
                  {t.discoverBusiness}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="overflow-hidden rounded-[32px] border border-[#cbdafb] bg-[linear-gradient(125deg,#f6f9ff_0%,#eaf2ff_55%,#dce9ff_100%)] text-[#101828]">
            <div className="grid lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-8 sm:p-12 lg:p-14">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#0866ff]">
                  <Globe2 className="h-4 w-4" />
                  {t.reachEyebrow}
                </span>
                <h2 className="mt-5 max-w-xl text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">
                  {t.reachTitle}
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-[#667085]">
                  {t.reachText}
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-[#cbdafb] lg:border-l lg:border-t-0">
                {[
                  ['27', t.statMarkets],
                  ['10', t.statCategories],
                  ['1', t.statMarket],
                  ['EU', t.statReach],
                ].map(([value, label]) => (
                  <div key={label} className="border-b border-r border-[#cbdafb] p-7 sm:p-9">
                    <strong className="block text-3xl tracking-[-0.04em] text-[#0866ff]">{value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-[#667085]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: t.verifiedTitle,
                text: t.verifiedText,
              },
              {
                icon: ShieldCheck,
                title: t.safeTitle,
                text: t.safeText,
              },
              {
                icon: Handshake,
                title: t.crossTitle,
                text: t.crossText,
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-[24px] border border-[#e4e7ec] bg-[#f9fafb] p-7">
                <Icon className="h-6 w-6 text-[#0866ff]" />
                <h3 className="mt-6 text-xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

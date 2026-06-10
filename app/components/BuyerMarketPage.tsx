import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Check,
  FileCheck2,
  Gavel,
  Globe2,
  MapPin,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type BuyerLocale = 'de' | 'en'

const content = {
  de: {
    eyebrow: 'Schwedische Fahrzeuge für europäische Händler',
    title: 'Ausgewählte Fahrzeuge. Klarere Entscheidungen.',
    intro:
      'Autorell verbindet qualifizierte Fahrzeuge aus Schweden mit verifizierten professionellen Käufern in Europa.',
    primary: 'Händlerzugang beantragen',
    secondary: 'Händler-Login',
    facts: ['Fahrzeuge aus Schweden', '24 Stunden Gebotsphase', 'Strukturierte Fahrzeugdaten'],
    marketEyebrow: 'Autorell Dealer Network',
    marketTitle: 'Ein fokussierter Einkaufsmarkt für schwedische Fahrzeuge.',
    marketText:
      'Deutschland ist zum Start ein Käufermarkt. Fahrzeuge werden in Schweden erfasst und qualifiziert, bevor sie für zugelassene Händler freigeschaltet werden.',
    cards: [
      ['Schwedischer Ursprung', 'Standort, Identität und Fahrzeugprofil werden vor der Auktion erfasst.'],
      ['Ausgewählte Fahrzeuge', 'Schwerpunkt auf Fahrzeugen ab Modelljahr 2018 mit höchstens 100.000 km.'],
      ['Deklarierter Zustand', 'Bekannte Schäden, Warnleuchten, Service und technische Angaben sind strukturiert.'],
      ['Europäische Gebote', 'Zugelassene Händler können Fahrzeuge prüfen, beobachten und Gebote abgeben.'],
    ],
    processEyebrow: 'So funktioniert der Einkauf',
    processTitle: 'Von Schweden zu Ihrem Bestand.',
    steps: [
      ['Fahrzeug prüfen', 'Lesen Sie Fahrzeugdaten, Bilder und die Zustandsdeklaration.'],
      ['Gebot abgeben', 'Bieten Sie innerhalb der aktiven 24-Stunden-Phase.'],
      ['Verkäufer entscheidet', 'Der schwedische Verkäufer kann das höchste Angebot annehmen oder ablehnen.'],
      ['Vertrag und Prüfung', 'Der Kauf bleibt an die Übereinstimmung mit der Deklaration gebunden.'],
      ['Zahlung und Abholung', 'Zahlungsstatus, Abholung und Dokumente werden im Geschäftsraum koordiniert.'],
      ['Transport nach Europa', 'Das Fahrzeug wird nach Freigabe zum professionellen Käufer transportiert.'],
    ],
    criteria: 'Fahrzeugkriterien zum Start',
    criteriaText:
      'Autorell nimmt zunächst nur Fahrzeuge an, die in Schweden verfügbar, fahrbereit und für den europäischen Handel relevant sind.',
    criteriaItems: [
      'Modelljahr 2018 oder neuer',
      'Höchstens 100.000 km',
      'Fahrbereit und verkehrssicher',
      'Keine schweren Motor- oder Getriebeprobleme',
      'Keine erheblichen Flüssigkeitslecks',
      'Keine schweren unreparierten Unfallschäden',
    ],
    cta: 'Zugang zum schwedischen Fahrzeugangebot.',
    ctaText:
      'Beantragen Sie den Händlerzugang. Nach der Unternehmensprüfung erhalten Sie Zugriff auf aktive Fahrzeuge und Auktionen.',
  },
  en: {
    eyebrow: 'Swedish vehicles for European dealers',
    title: 'Selected vehicles. Clearer decisions.',
    intro:
      'Autorell connects qualified vehicles in Sweden with verified professional buyers across Europe.',
    primary: 'Apply for dealer access',
    secondary: 'Dealer login',
    facts: ['Vehicles located in Sweden', '24-hour bidding', 'Structured vehicle data'],
    marketEyebrow: 'Autorell Dealer Network',
    marketTitle: 'A focused buying market for Swedish vehicles.',
    marketText:
      'At launch, Sweden is the seller market. Vehicles are submitted and qualified in Sweden before approved European dealers receive access.',
    cards: [
      ['Swedish origin', 'Location, identity and vehicle profile are recorded before bidding starts.'],
      ['Selected vehicles', 'Focused on model year 2018 or newer with no more than 100,000 km.'],
      ['Declared condition', 'Known damage, warnings, service and technical details are structured.'],
      ['European bidding', 'Approved dealers can review, watch and bid on relevant vehicles.'],
    ],
    processEyebrow: 'How buying works',
    processTitle: 'From Sweden to your inventory.',
    steps: [
      ['Review the vehicle', 'Read the vehicle data, images and condition declaration.'],
      ['Place your bid', 'Bid during the active 24-hour auction period.'],
      ['Seller decides', 'The Swedish seller may accept or decline the highest offer.'],
      ['Contract and verification', 'The purchase remains conditional on the declared information being accurate.'],
      ['Payment and collection', 'Payment status, collection and documents are coordinated in the deal room.'],
      ['European delivery', 'After approval, the vehicle is transported to the professional buyer.'],
    ],
    criteria: 'Initial vehicle criteria',
    criteriaText:
      'Autorell initially accepts vehicles that are available in Sweden, roadworthy and relevant to professional European buyers.',
    criteriaItems: [
      'Model year 2018 or newer',
      'Maximum 100,000 km',
      'Driveable and roadworthy',
      'No major engine or transmission issues',
      'No significant fluid leaks',
      'No major unrepaired collision damage',
    ],
    cta: 'Access selected Swedish vehicle supply.',
    ctaText:
      'Apply for dealer access. Once your company is approved, you can view active vehicles and auctions.',
  },
} as const

const cardIcons = [MapPin, BadgeCheck, FileCheck2, Gavel]
const stepIcons = [CarFront, Gavel, BadgeCheck, ShieldCheck, FileCheck2, Truck]

export default function BuyerMarketPage({ locale }: { locale: BuyerLocale }) {
  const t = content[locale]

  return (
    <main className="overflow-hidden bg-white text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative isolate overflow-hidden bg-[#f7f2e8] lg:min-h-[720px]">
        <Image
          src="/autorell-home-hero.webp"
          alt=""
          fill
          priority
          className="object-cover object-[70%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fcfaf5_0%,rgba(252,250,245,.98)_38%,rgba(252,250,245,.7)_58%,rgba(252,250,245,.08)_82%)] max-md:bg-[linear-gradient(180deg,#fcfaf5_0%,rgba(252,250,245,.96)_52%,rgba(32,33,36,.18)_100%)]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1440px] items-start px-5 pb-16 pt-16 sm:px-8 lg:items-center lg:px-12 lg:py-20 xl:px-16">
          <div className="max-w-[720px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d5d7d2] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#536b76] backdrop-blur">
              <Globe2 className="h-4 w-4" />
              {t.eyebrow}
            </span>
            <h1 className="mt-7 text-[44px] leading-[.99] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#526877] sm:text-xl">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.18)]"
              >
                {t.primary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#c9c9c2] bg-white/75 px-7 text-sm font-medium backdrop-blur"
              >
                {t.secondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {t.facts.map((fact) => (
                <span
                  key={fact}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-[#4d616b] shadow-[0_8px_24px_rgba(32,33,36,.06)]"
                >
                  <Check className="h-3.5 w-3.5 text-[#4f8ca8]" />
                  {fact}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fahrzeuge" className="bg-[#f5f1e8] py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#718188]">
                {t.marketEyebrow}
              </p>
              <h2 className="mt-5 text-[38px] leading-[1.04] tracking-[-0.05em] sm:text-5xl">
                {t.marketTitle}
              </h2>
              <p className="mt-5 leading-8 text-[#64747a]">{t.marketText}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.cards.map(([title, text], index) => {
                const Icon = cardIcons[index]
                return (
                  <article
                    key={title}
                    className="rounded-[22px] border border-white/80 bg-white/80 p-6 shadow-[0_18px_55px_rgba(32,33,36,.055)]"
                  >
                    <Icon className="h-5 w-5 text-[#527f92]" />
                    <h3 className="mt-7 text-xl tracking-[-0.03em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#68777c]">{text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="ablauf" className="relative overflow-hidden bg-[#202427] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
            {t.processEyebrow}
          </p>
          <h2 className="mt-5 max-w-3xl text-[38px] leading-[1.04] tracking-[-0.05em] sm:text-5xl">
            {t.processTitle}
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.steps.map(([title, text], index) => {
              const Icon = stepIcons[index]
              return (
                <article
                  key={title}
                  className="min-h-[250px] rounded-[22px] border border-white/10 bg-white/[.045] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[#b4d9ef]" />
                    <span className="text-[10px] tracking-[0.16em] text-white/35">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-10 text-xl tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#718188]">
              Sweden first
            </p>
            <h2 className="mt-5 text-[36px] leading-[1.05] tracking-[-0.048em] sm:text-5xl">
              {t.criteria}
            </h2>
            <p className="mt-5 leading-8 text-[#64747a]">{t.criteriaText}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.criteriaItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[16px] border border-[#e0e6e5] bg-[#fafbf9] px-5 py-4 text-sm text-[#4e5d62]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e2f0f5]">
                  <Check className="h-3.5 w-3.5 text-[#4f7f94]" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <div className="mx-auto max-w-[1100px] rounded-[26px] bg-[#b4d9ef] px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-3xl text-[34px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
            {t.cta}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#39586a]">{t.ctaText}</p>
          <Link
            href="/dealer-apply"
            className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-8 text-sm font-medium text-white"
          >
            {t.primary}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

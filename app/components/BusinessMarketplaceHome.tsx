import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CircleHelp,
  Globe2,
  ShieldCheck,
} from 'lucide-react'
import MarketplaceSearch from './MarketplaceSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const homeCopy = {
  sv: {
    heroAlt: 'Autorell fordonsmarknad',
    heroTitle: 'Köp och sälj fordon i hela Europa.',
    heroText: 'Sök bland fordon från privatpersoner och företag. Filtrera på kategori, land, märke och pris i ett tydligt flöde.',
    sellVehicle: 'Sälj ett fordon',
    businessSolutions: 'För företag',
  },
  en: {
    heroAlt: 'Autorell vehicle marketplace',
    heroTitle: 'Buy and sell vehicles across Europe.',
    heroText: 'Search vehicles from private sellers and businesses. Filter by category, country, make and price in one clear flow.',
    sellVehicle: 'Sell a vehicle',
    businessSolutions: 'For businesses',
  },
  de: {
    heroAlt: 'Autorell Fahrzeugmarktplatz',
    heroTitle: 'Fahrzeuge in ganz Europa kaufen und verkaufen.',
    heroText: 'Fahrzeuge von privaten und gewerblichen Anbietern suchen. Nach Kategorie, Land, Marke und Preis filtern.',
    sellVehicle: 'Fahrzeug verkaufen',
    businessSolutions: 'Für Unternehmen',
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

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="relative overflow-hidden bg-[#f4f7fb]">
        <div className="absolute inset-0">
          <Image
            src="/autorell-woman-driving-hero.jpeg"
            alt={t.heroAlt}
            fill
            priority
            className="object-cover object-[58%_center]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,22,76,.82)_0%,rgba(8,22,76,.62)_38%,rgba(8,102,255,.22)_68%,rgba(8,102,255,.04)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-4 pb-14 pt-12 sm:px-8 sm:pb-20 lg:pt-16">
          <div className="max-w-[680px] text-white">
            <h1 className="text-[38px] font-extrabold leading-[1.03] tracking-[-0.05em] sm:text-[56px] lg:text-[64px]">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-[560px] text-base font-medium leading-7 text-white/88 sm:text-lg sm:leading-8">
              {t.heroText}
            </p>
          </div>

          <div className="mt-8 max-w-[860px]">
            <MarketplaceSearch locale={locale} />
          </div>

          <div className="mt-5 max-w-[860px]">
            <HomeTrustAccordion locale={locale} />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-white">
            <Link href="/salj-fordon" className="inline-flex items-center gap-2 transition hover:opacity-80">
              {t.sellVehicle}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/foretag" className="inline-flex items-center gap-2 transition hover:opacity-80">
              {t.businessSolutions}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function HomeTrustAccordion({ locale }: { locale: PublicLocale }) {
  const items =
    locale === 'sv'
      ? [
          {
            icon: ShieldCheck,
            title: 'Hur hjälper Autorell mig göra en tryggare affär?',
            text: 'Vi samlar fordonsdata, land och säljartyp i ett tydligt flöde så att du kan jämföra bättre innan du tar kontakt.',
          },
          {
            icon: Globe2,
            title: 'Kan jag söka fordon från olika länder?',
            text: 'Ja. Välj ett specifikt land eller hela Europa. Det gör det enklare att hitta rätt fordon utan att blanda bort viktiga uppgifter.',
          },
          {
            icon: CircleHelp,
            title: 'Passar Autorell både privatpersoner och företag?',
            text: 'Ja. Privatpersoner kan sälja och hitta fordon, medan företag får ett mer strukturerat sätt att nå köpare i flera marknader.',
          },
        ]
      : locale === 'de'
        ? [
            {
              icon: ShieldCheck,
              title: 'Wie hilft Autorell bei sicheren Geschäften?',
              text: 'Fahrzeugdaten, Land und Anbietertyp werden klar dargestellt, damit Sie vor dem Kontakt besser vergleichen können.',
            },
            {
              icon: Globe2,
              title: 'Kann ich Fahrzeuge aus verschiedenen Ländern suchen?',
              text: 'Ja. Wählen Sie ein einzelnes Land oder ganz Europa und vergleichen Sie Angebote strukturierter.',
            },
            {
              icon: CircleHelp,
              title: 'Ist Autorell für private und gewerbliche Nutzer?',
              text: 'Ja. Privatpersonen können kaufen und verkaufen, während Unternehmen Käufer in mehreren Märkten erreichen können.',
            },
          ]
        : [
            {
              icon: ShieldCheck,
              title: 'How does Autorell help make deals safer?',
              text: 'We present vehicle data, country and seller type in a clear flow so you can compare better before making contact.',
            },
            {
              icon: Globe2,
              title: 'Can I search vehicles from different countries?',
              text: 'Yes. Choose one country or all of Europe to find relevant vehicles without losing important details.',
            },
            {
              icon: CircleHelp,
              title: 'Is Autorell for both private sellers and businesses?',
              text: 'Yes. Private sellers can list and find vehicles, while businesses get a structured way to reach buyers across markets.',
            },
          ]

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d8e1f0] bg-white shadow-[0_18px_42px_rgba(16,24,40,.12)]">
      {items.map(({ icon: Icon, title, text }, index) => (
        <details
          key={title}
          className="group border-b border-[#e4e7ec] last:border-b-0"
          open={index === 0}
        >
          <summary className="grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-[#101828] [&::-webkit-details-marker]:hidden">
            <Icon className="h-5 w-5 text-[#0866ff]" strokeWidth={1.8} />
            <span className="text-sm font-bold tracking-[-0.02em] sm:text-base">
              {title}
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0866ff] text-sm font-bold leading-none text-white transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="px-5 pb-5 pl-[56px] text-sm leading-6 text-[#667085]">
            {text}
          </p>
        </details>
      ))}
    </div>
  )
}

import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FilePlus2,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Warehouse,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const businessPageCopy = {
  sv: {
    metaTitle: 'Företagskonto för fordonsförsäljare | Autorell',
    metaDescription:
      'Publicera fordonslager, hantera annonser och nå köpare i hela EU med Autorells företagskonto.',
    eyebrow: 'Autorell för företag',
    title: 'Sälj fordon till köpare i hela Europa.',
    intro:
      'Autorell ger handlare, verkstäder, åkerier, maskinföretag och återkommande säljare en tydlig plats att publicera lager, hantera förfrågningar och nå rätt marknad utan krångliga flöden.',
    primaryCta: 'Skapa företagskonto',
    secondaryCta: 'Publicera fordon',
    proof: [
      'Byggt för EU-marknader',
      'Privata och professionella köpare',
      'Ett konto för hela lagret',
    ],
    featureTitle: 'Verktygen företag behöver från första annonsen.',
    features: [
      {
        title: 'Företagsprofil',
        text: 'Samla företagsnamn, kontaktuppgifter och annonser på en professionell säljarprofil.',
        icon: Building2,
      },
      {
        title: 'Lagerannonsering',
        text: 'Publicera bilar, transportbilar, maskiner, lastbilar och andra fordonskategorier med strukturerad data.',
        icon: Warehouse,
      },
      {
        title: 'Köparförfrågningar',
        text: 'Få meddelanden från seriösa köpare och håll kontakten samlad i Autorell.',
        icon: MessageCircle,
      },
      {
        title: 'EU-räckvidd',
        text: 'Visa fordon på rätt språk, valuta och marknad när köpare söker över landsgränser.',
        icon: Globe2,
      },
      {
        title: 'Trygg presentation',
        text: 'Tydliga annonser, fordonsdata och säljarinformation gör affären enklare att förstå.',
        icon: ShieldCheck,
      },
      {
        title: 'Bättre överblick',
        text: 'Följ publicerade, pausade, sålda och utgångna annonser från samma konto.',
        icon: BarChart3,
      },
    ],
    stepsTitle: 'Så kommer företaget igång',
    steps: [
      {
        title: 'Skapa företagskonto',
        text: 'Registrera organisationen och välj kontaktuppgifter som köpare ska se.',
      },
      {
        title: 'Lägg upp fordon',
        text: 'Fyll i pris, bilder, plats, specifikationer och den beskrivning säljaren vill visa.',
      },
      {
        title: 'Hantera dialogen',
        text: 'Köpare kontaktar er via Autorell och ni slutför affären enligt era egna villkor.',
      },
    ],
    ctaTitle: 'Redo att visa ert lager för fler köpare?',
    ctaText:
      'Starta med ett företagskonto och publicera första fordonet när allt är klart.',
  },
  en: {
    metaTitle: 'Business account for vehicle sellers | Autorell',
    metaDescription:
      'Publish vehicle inventory, manage listings and reach buyers across the EU with an Autorell business account.',
    eyebrow: 'Autorell for business',
    title: 'Sell vehicles to buyers across Europe.',
    intro:
      'Autorell gives dealers, workshops, transport companies, machinery businesses and recurring sellers a clear place to publish inventory, manage enquiries and reach the right market without complicated flows.',
    primaryCta: 'Create business account',
    secondaryCta: 'Advertise a vehicle',
    proof: [
      'Built for EU markets',
      'Private and professional buyers',
      'One account for full inventory',
    ],
    featureTitle: 'The tools businesses need from the first listing.',
    features: [
      {
        title: 'Business profile',
        text: 'Keep company name, contact details and listings together on a professional seller profile.',
        icon: Building2,
      },
      {
        title: 'Inventory listings',
        text: 'Publish cars, vans, machines, trucks and other vehicle categories with structured data.',
        icon: Warehouse,
      },
      {
        title: 'Buyer enquiries',
        text: 'Receive messages from serious buyers and keep the conversation organised in Autorell.',
        icon: MessageCircle,
      },
      {
        title: 'EU reach',
        text: 'Show vehicles with the right language, currency and market context when buyers search across borders.',
        icon: Globe2,
      },
      {
        title: 'Trusted presentation',
        text: 'Clear listings, vehicle data and seller information make each deal easier to understand.',
        icon: ShieldCheck,
      },
      {
        title: 'Better overview',
        text: 'Track published, paused, sold and expired listings from the same account.',
        icon: BarChart3,
      },
    ],
    stepsTitle: 'How your company gets started',
    steps: [
      {
        title: 'Create a business account',
        text: 'Register the organisation and choose the contact details buyers should see.',
      },
      {
        title: 'Add vehicles',
        text: 'Enter price, images, location, specifications and the description the seller wants to show.',
      },
      {
        title: 'Manage the dialogue',
        text: 'Buyers contact you through Autorell and you complete the deal on your own terms.',
      },
    ],
    ctaTitle: 'Ready to show your inventory to more buyers?',
    ctaText:
      'Start with a business account and publish the first vehicle when everything is ready.',
  },
  de: {
    metaTitle: 'Unternehmenskonto für Fahrzeugverkäufer | Autorell',
    metaDescription:
      'Fahrzeugbestand veröffentlichen, Anzeigen verwalten und Käufer in der EU mit einem Autorell-Unternehmenskonto erreichen.',
    eyebrow: 'Autorell für Unternehmen',
    title: 'Fahrzeuge an Käufer in ganz Europa verkaufen.',
    intro:
      'Autorell bietet Händlern, Werkstätten, Transportunternehmen, Maschinenbetrieben und regelmäßigen Verkäufern einen klaren Ort, um Bestand zu veröffentlichen, Anfragen zu verwalten und den richtigen Markt ohne komplizierte Abläufe zu erreichen.',
    primaryCta: 'Unternehmenskonto erstellen',
    secondaryCta: 'Fahrzeug inserieren',
    proof: [
      'Für EU-Märkte gebaut',
      'Private und professionelle Käufer',
      'Ein Konto für den gesamten Bestand',
    ],
    featureTitle: 'Die Werkzeuge, die Unternehmen ab der ersten Anzeige brauchen.',
    features: [
      {
        title: 'Unternehmensprofil',
        text: 'Firmenname, Kontaktdaten und Anzeigen in einem professionellen Verkäuferprofil bündeln.',
        icon: Building2,
      },
      {
        title: 'Bestandsanzeigen',
        text: 'Autos, Transporter, Maschinen, Lkw und weitere Fahrzeugkategorien mit strukturierten Daten veröffentlichen.',
        icon: Warehouse,
      },
      {
        title: 'Käuferanfragen',
        text: 'Nachrichten von ernsthaften Käufern erhalten und die Kommunikation in Autorell organisiert halten.',
        icon: MessageCircle,
      },
      {
        title: 'EU-Reichweite',
        text: 'Fahrzeuge mit passender Sprache, Währung und Marktsicht zeigen, wenn Käufer grenzüberschreitend suchen.',
        icon: Globe2,
      },
      {
        title: 'Vertrauensvolle Darstellung',
        text: 'Klare Anzeigen, Fahrzeugdaten und Verkäuferinformationen machen jedes Geschäft leichter verständlich.',
        icon: ShieldCheck,
      },
      {
        title: 'Bessere Übersicht',
        text: 'Veröffentlichte, pausierte, verkaufte und abgelaufene Anzeigen über dasselbe Konto verfolgen.',
        icon: BarChart3,
      },
    ],
    stepsTitle: 'So startet Ihr Unternehmen',
    steps: [
      {
        title: 'Unternehmenskonto erstellen',
        text: 'Organisation registrieren und festlegen, welche Kontaktdaten Käufer sehen sollen.',
      },
      {
        title: 'Fahrzeuge hinzufügen',
        text: 'Preis, Bilder, Standort, Spezifikationen und die Beschreibung eintragen, die der Verkäufer zeigen möchte.',
      },
      {
        title: 'Dialog verwalten',
        text: 'Käufer kontaktieren Sie über Autorell und Sie schließen das Geschäft zu Ihren eigenen Bedingungen ab.',
      },
    ],
    ctaTitle: 'Bereit, Ihren Bestand mehr Käufern zu zeigen?',
    ctaText:
      'Starten Sie mit einem Unternehmenskonto und veröffentlichen Sie das erste Fahrzeug, sobald alles bereit ist.',
  },
} as const

type BusinessCopy = (typeof businessPageCopy)[keyof typeof businessPageCopy]

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getBusinessCopy(locale)
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: { canonical: 'https://www.autorell.com/foretag' },
  }
}

export default async function BusinessPage() {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const copy = getBusinessCopy(locale)
  const createAccountHref = localizePublicHref(locale, '/register?account=business')
  const createListingHref = localizePublicHref(
    locale,
    locale === 'sv' ? '/konto/annonser/ny' : '/account/listings/new',
  )

  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f8fbff,#eef5ff)]">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1] tracking-[-.055em] sm:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={createAccountHref} className="inline-flex min-h-13 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-extrabold text-white transition hover:bg-[#075ce5]">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={createListingHref} className="inline-flex min-h-13 items-center rounded-[14px] border border-[#b8c5da] bg-white px-6 font-extrabold transition hover:border-[#0866ff] hover:text-[#0866ff]">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#dce6f4] bg-white p-6 shadow-[0_24px_70px_rgba(16,24,40,.10)]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <strong className="text-lg">{copy.primaryCta}</strong>
            </div>
            <ul className="mt-6 space-y-4">
              {copy.proof.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold text-[#344054]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8">
        <h2 className="max-w-3xl text-3xl font-black tracking-[-.045em] sm:text-5xl">
          {copy.featureTitle}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {copy.features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[20px] border border-[#e1e5ec] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.045)]">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eaf1ff] text-[#0866ff]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-black tracking-[-.035em]">{title}</h3>
              <p className="mt-3 leading-7 text-[#667085]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#dce3ef] bg-white">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8">
          <h2 className="text-3xl font-black tracking-[-.045em] sm:text-5xl">
            {copy.stepsTitle}
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {copy.steps.map((step, index) => (
              <article key={step.title} className="rounded-[18px] border border-[#e1e7f0] bg-[#f8fbff] p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0866ff] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-black tracking-[-.03em]">{step.title}</h3>
                <p className="mt-3 leading-7 text-[#667085]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8">
        <div className="rounded-[24px] bg-[#101828] p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="max-w-2xl text-3xl font-black tracking-[-.045em] sm:text-5xl">
              {copy.ctaTitle}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#cbd5e1]">{copy.ctaText}</p>
          </div>
          <Link href={createAccountHref} className="mt-7 inline-flex min-h-13 shrink-0 items-center gap-2 rounded-[14px] bg-white px-6 font-extrabold text-[#101828] transition hover:bg-[#edf5ff] lg:mt-0">
            {copy.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function getBusinessCopy(locale: PublicLocale): BusinessCopy {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return businessPageCopy[locale]
  }

  return translatePublicObject(locale, businessPageCopy.en)
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'sv'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'sv'
}

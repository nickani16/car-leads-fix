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
import { cleanSeoText } from '@/lib/market-seo'

const businessPageCopy = {
  sv: {
    metaTitle: 'Företagskonto för fordonsförsäljare | Autorell',
    metaDescription:
      'Publicera fordonslager, hantera annonser och nå köpare i hela EU med Autorells företagskonto.',
    eyebrow: 'Autorell fÃ¶r fÃ¶retag',
    title: 'SÃ¤lj fordon till kÃ¶pare i hela Europa.',
    intro:
      'Autorell ger handlare, verkstÃ¤der, Ã¥kerier, maskinfÃ¶retag och Ã¥terkommande sÃ¤ljare en tydlig plats att publicera lager, hantera fÃ¶rfrÃ¥gningar och nÃ¥ rÃ¤tt marknad utan krÃ¥ngliga flÃ¶den.',
    primaryCta: 'Skapa fÃ¶retagskonto',
    secondaryCta: 'Publicera fordon',
    proof: [
      'Byggt fÃ¶r EU-marknader',
      'Privata och professionella kÃ¶pare',
      'Ett konto fÃ¶r hela lagret',
    ],
    featureTitle: 'Verktygen fÃ¶retag behÃ¶ver frÃ¥n fÃ¶rsta annonsen.',
    features: [
      {
        title: 'FÃ¶retagsprofil',
        text: 'Samla fÃ¶retagsnamn, kontaktuppgifter och annonser pÃ¥ en professionell sÃ¤ljarprofil.',
        icon: Building2,
      },
      {
        title: 'Lagerannonsering',
        text: 'Publicera bilar, transportbilar, maskiner, lastbilar och andra fordonskategorier med strukturerad data.',
        icon: Warehouse,
      },
      {
        title: 'KÃ¶parfÃ¶rfrÃ¥gningar',
        text: 'FÃ¥ meddelanden frÃ¥n seriÃ¶sa kÃ¶pare och hÃ¥ll kontakten samlad i Autorell.',
        icon: MessageCircle,
      },
      {
        title: 'EU-rÃ¤ckvidd',
        text: 'Visa fordon pÃ¥ rÃ¤tt sprÃ¥k, valuta och marknad nÃ¤r kÃ¶pare sÃ¶ker Ã¶ver landsgrÃ¤nser.',
        icon: Globe2,
      },
      {
        title: 'Trygg presentation',
        text: 'Tydliga annonser, fordonsdata och sÃ¤ljarinformation gÃ¶r affÃ¤ren enklare att fÃ¶rstÃ¥.',
        icon: ShieldCheck,
      },
      {
        title: 'BÃ¤ttre Ã¶verblick',
        text: 'FÃ¶lj publicerade, pausade, sÃ¥lda och utgÃ¥ngna annonser frÃ¥n samma konto.',
        icon: BarChart3,
      },
    ],
    stepsTitle: 'SÃ¥ kommer fÃ¶retaget igÃ¥ng',
    steps: [
      {
        title: 'Skapa fÃ¶retagskonto',
        text: 'Registrera organisationen och vÃ¤lj kontaktuppgifter som kÃ¶pare ska se.',
      },
      {
        title: 'LÃ¤gg upp fordon',
        text: 'Fyll i pris, bilder, plats, specifikationer och den beskrivning sÃ¤ljaren vill visa.',
      },
      {
        title: 'Hantera dialogen',
        text: 'KÃ¶pare kontaktar er via Autorell och ni slutfÃ¶r affÃ¤ren enligt era egna villkor.',
      },
    ],
    ctaTitle: 'Redo att visa ert lager fÃ¶r fler kÃ¶pare?',
    ctaText:
      'Starta med ett fÃ¶retagskonto och publicera fÃ¶rsta fordonet nÃ¤r allt Ã¤r klart.',
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
    eyebrow: 'Autorell fÃ¼r Unternehmen',
    title: 'Fahrzeuge an KÃ¤ufer in ganz Europa verkaufen.',
    intro:
      'Autorell bietet HÃ¤ndlern, WerkstÃ¤tten, Transportunternehmen, Maschinenbetrieben und regelmÃ¤ÃŸigen VerkÃ¤ufern einen klaren Ort, um Bestand zu verÃ¶ffentlichen, Anfragen zu verwalten und den richtigen Markt ohne komplizierte AblÃ¤ufe zu erreichen.',
    primaryCta: 'Unternehmenskonto erstellen',
    secondaryCta: 'Fahrzeug inserieren',
    proof: [
      'FÃ¼r EU-MÃ¤rkte gebaut',
      'Private und professionelle KÃ¤ufer',
      'Ein Konto fÃ¼r den gesamten Bestand',
    ],
    featureTitle: 'Die Werkzeuge, die Unternehmen ab der ersten Anzeige brauchen.',
    features: [
      {
        title: 'Unternehmensprofil',
        text: 'Firmenname, Kontaktdaten und Anzeigen in einem professionellen VerkÃ¤uferprofil bÃ¼ndeln.',
        icon: Building2,
      },
      {
        title: 'Bestandsanzeigen',
        text: 'Autos, Transporter, Maschinen, Lkw und weitere Fahrzeugkategorien mit strukturierten Daten verÃ¶ffentlichen.',
        icon: Warehouse,
      },
      {
        title: 'KÃ¤uferanfragen',
        text: 'Nachrichten von ernsthaften KÃ¤ufern erhalten und die Kommunikation in Autorell organisiert halten.',
        icon: MessageCircle,
      },
      {
        title: 'EU-Reichweite',
        text: 'Fahrzeuge mit passender Sprache, WÃ¤hrung und Marktsicht zeigen, wenn KÃ¤ufer grenzÃ¼berschreitend suchen.',
        icon: Globe2,
      },
      {
        title: 'Vertrauensvolle Darstellung',
        text: 'Klare Anzeigen, Fahrzeugdaten und VerkÃ¤uferinformationen machen jedes GeschÃ¤ft leichter verstÃ¤ndlich.',
        icon: ShieldCheck,
      },
      {
        title: 'Bessere Ãœbersicht',
        text: 'VerÃ¶ffentlichte, pausierte, verkaufte und abgelaufene Anzeigen Ã¼ber dasselbe Konto verfolgen.',
        icon: BarChart3,
      },
    ],
    stepsTitle: 'So startet Ihr Unternehmen',
    steps: [
      {
        title: 'Unternehmenskonto erstellen',
        text: 'Organisation registrieren und festlegen, welche Kontaktdaten KÃ¤ufer sehen sollen.',
      },
      {
        title: 'Fahrzeuge hinzufÃ¼gen',
        text: 'Preis, Bilder, Standort, Spezifikationen und die Beschreibung eintragen, die der VerkÃ¤ufer zeigen mÃ¶chte.',
      },
      {
        title: 'Dialog verwalten',
        text: 'KÃ¤ufer kontaktieren Sie Ã¼ber Autorell und Sie schlieÃŸen das GeschÃ¤ft zu Ihren eigenen Bedingungen ab.',
      },
    ],
    ctaTitle: 'Bereit, Ihren Bestand mehr KÃ¤ufern zu zeigen?',
    ctaText:
      'Starten Sie mit einem Unternehmenskonto und verÃ¶ffentlichen Sie das erste Fahrzeug, sobald alles bereit ist.',
  },
} as const

type BusinessCopy = (typeof businessPageCopy)[keyof typeof businessPageCopy]

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getBusinessCopy(locale)
  const canonicalPath = headerStore.get('x-autorell-pathname') || '/business'
  return {
    title: { absolute: cleanSeoText(copy.metaTitle, 65) },
    description: cleanSeoText(copy.metaDescription, 150),
    alternates: { canonical: `https://www.autorell.com${canonicalPath}` },
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



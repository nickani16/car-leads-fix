import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  Building2,
  FilePlus2,
  MessageCircle,
  Warehouse,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { isPublicLanguage, translatePublic, type PublicLocale } from '@/lib/public-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const hostname = headerStore.get('host') || ''
  const host = hostname.includes('autorell.de')
    ? 'https://www.autorell.de'
    : hostname.includes('autorell.com')
      ? 'https://www.autorell.com'
      : 'https://www.autorell.se'
  const title =
    locale === 'sv'
      ? 'Fordonsmarknadsplats för företag | Autorell'
      : locale === 'de'
        ? 'Fahrzeugmarktplatz für Unternehmen | Autorell'
        : translatePublic(locale, 'Vehicle marketplace for businesses | Autorell')
  const description =
    locale === 'sv'
      ? 'Skapa företagskonto, publicera fordonslager och hantera annonser och köparförfrågningar i hela EU.'
      : locale === 'de'
        ? 'Unternehmenskonto erstellen, Fahrzeugbestand inserieren und Anzeigen sowie Käuferanfragen in der gesamten EU verwalten.'
        : translatePublic(
            locale,
            'Create a business account, publish vehicle inventory and manage listings and buyer enquiries across the EU.',
          )
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${host}/foretag` },
  }
}

const features = [
  { icon: Building2, title: 'Företagskonto', text: 'Samla organisationens kontaktuppgifter, identitet och annonser på ett konto.' },
  { icon: FilePlus2, title: 'Annonsera fordon', text: 'Publicera bilar, transportbilar, maskiner och andra fordonskategorier med tydliga data.' },
  { icon: Warehouse, title: 'Hantera lager', text: 'Följ publicerade, pausade, sålda och utgångna annonser från kontot.' },
  { icon: MessageCircle, title: 'Samla förfrågningar', text: 'Ta emot meddelanden från intresserade köpare utan dealer- eller budflöden.' },
  { icon: BarChart3, title: 'Marketplace-lösningar', text: 'Bygg räckvidd över flera EU-marknader med lokala språk, valutor och landfilter.' },
] as const

export default async function BusinessPage() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'sv'
  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f7faff,#e7f0ff)]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Autorell för företag</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1] tracking-[-.055em] sm:text-7xl">
            Publicera och hantera fordonslager i hela Europa.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
            Autorell är en marknadsplats, inte en bilhandlare. Företag behåller
            kontrollen över pris, annonser, kundkontakt och den slutliga affären.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/registrera" className="inline-flex min-h-13 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">
              Skapa företagskonto <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/salj-fordon" className="inline-flex min-h-13 items-center rounded-[14px] border border-[#b8c5da] bg-white px-6 font-bold">
              Lägg upp annons
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1240px] gap-5 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-[24px] border border-[#e1e5ec] bg-white p-7">
            <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eaf1ff] text-[#0866ff]"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-6 text-2xl tracking-[-.035em]">{title}</h2>
            <p className="mt-3 leading-7 text-[#667085]">{text}</p>
          </article>
        ))}
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'sv'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'sv'
}

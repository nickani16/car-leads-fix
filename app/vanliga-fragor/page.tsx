import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeEuro,
  CarFront,
  CircleHelp,
  FileWarning,
  MessageCircle,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react'
import { createPublicMetadata } from '@/lib/public-seo'
import { isPublicLanguage, localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'
import FaqPageClient from './FaqPageClient'

export const metadata = createPublicMetadata({
  title: 'Hjälpcenter för Autorell marketplace',
  description:
    'Svar om konton, annonser, fordonsköp, export, import, transport, registrering, priser, meddelanden och trygghet på Autorell.',
  path: '/help-center',
})

export default async function FaqPage() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'sv'
  const t = (sv: string, en: string, de: string) => {
    if (locale === 'sv') return sv
    if (locale === 'de') return de
    return translatePublic(locale, en)
  }

  const quickActions = [
    [
      CarFront,
      t('Skapa eller hantera annons', 'Create or manage a listing', 'Anzeige erstellen oder verwalten'),
      t('Publicera, redigera, betala eller följ en granskning.', 'Publish, edit, pay or follow a review.', 'Veröffentlichen, bearbeiten, bezahlen oder Prüfung verfolgen.'),
      localizePublicHref(locale, '/account/listings/new'),
    ],
    [
      UserRound,
      t('Konto och inloggning', 'Account and sign-in', 'Konto und Anmeldung'),
      t('Få hjälp med mejlkod, profil, företag och sparade objekt.', 'Get help with email codes, profile, company and saved items.', 'Hilfe zu E-Mail-Code, Profil, Unternehmen und gespeicherten Objekten.'),
      localizePublicHref(locale, '/account'),
    ],
    [
      BadgeEuro,
      t('Priser och betalning', 'Prices and payment', 'Preise und Zahlung'),
      t('Se annonspriser, Checkout och betalningsfrågor.', 'See listing prices, checkout and payment questions.', 'Anzeigenpreise, Checkout und Zahlungsfragen ansehen.'),
      localizePublicHref(locale, '/pricing'),
    ],
    [
      FileWarning,
      t('Rapportera problem', 'Report a problem', 'Problem melden'),
      t('Skicka in annons-ID, betalningsreferens eller säkerhetsärende.', 'Send a listing ID, payment reference or safety case.', 'Anzeigen-ID, Zahlungsreferenz oder Sicherheitsfall senden.'),
      localizePublicHref(locale, '/report'),
    ],
  ] as const

  const supportCards = [
    [
      ShieldCheck,
      t('Trygghet', 'Safety', 'Sicherheit'),
      t(
        'Kontrollera säljare, dokument, pris och betalningsväg innan affären går vidare.',
        'Check the seller, documents, price and payment route before the deal moves forward.',
        'Prüfen Sie Verkäufer, Dokumente, Preis und Zahlungsweg, bevor der Handel weitergeht.',
      ),
    ],
    [
      MessageCircle,
      t('Meddelanden', 'Messages', 'Nachrichten'),
      t(
        'Håll viktiga frågor i Autorell så att annons, kontakt och historik finns samlat.',
        'Keep important questions in Autorell so the listing, contact and history stay together.',
        'Behalten Sie wichtige Fragen in Autorell, damit Anzeige, Kontakt und Verlauf zusammenbleiben.',
      ),
    ],
    [
      Truck,
      t('Transport', 'Transport', 'Transport'),
      t(
        'Stäm av hämtning, export, tillfälliga skyltar och registrering innan betalning.',
        'Agree on pickup, export, temporary plates and registration before payment.',
        'Klären Sie Abholung, Export, Kurzzeitkennzeichen und Registrierung vor der Zahlung.',
      ),
    ],
    [
      CircleHelp,
      t('Support', 'Support', 'Support'),
      t(
        'Använd annons-ID, referensnummer och mejladress när du kontaktar support.',
        'Use listing ID, reference number and email address when contacting support.',
        'Nutzen Sie Anzeigen-ID, Referenznummer und E-Mail-Adresse beim Kontakt mit dem Support.',
      ),
    ],
  ] as const

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#dfe6f2] bg-[#f5f9ff]">
        <div className="mx-auto grid w-full max-w-[var(--autorell-page-max)] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-16">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              {t('Autorell hjälpcenter', 'Autorell help center', 'Autorell Hilfe')}
            </p>
            <h1 className="mt-4 max-w-[330px] break-words text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] min-[430px]:max-w-[370px] sm:max-w-3xl sm:text-6xl sm:leading-[1.02] sm:tracking-[-0.03em] lg:text-[68px]">
              {t(
                'Snabb hjälp när du köper, säljer eller hanterar annonser.',
                'Fast help when you buy, sell or manage listings.',
                'Schnelle Hilfe beim Kaufen, Verkaufen und Verwalten von Anzeigen.',
              )}
            </h1>
            <p className="mt-5 max-w-[330px] text-base leading-7 text-[#566174] min-[430px]:max-w-[370px] sm:max-w-2xl sm:text-lg sm:leading-8">
              {t(
                'Sök bland praktiska svar om konton, annonser, betalning, export, meddelanden och säkerhet. Börja med snabbvalen eller sök direkt i frågorna.',
                'Search practical answers about accounts, listings, payment, export, messages and safety. Start with a shortcut or search the questions directly.',
                'Suchen Sie praktische Antworten zu Konten, Anzeigen, Zahlung, Export, Nachrichten und Sicherheit. Starten Sie mit einer Schnellwahl oder suchen Sie direkt in den Fragen.',
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#faq-search" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#0054d8] min-[520px]:w-auto">
                {t('Sök i hjälpcentret', 'Search the help center', 'Hilfe durchsuchen')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={localizePublicHref(locale, '/report')} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-[#bfd0ea] bg-white px-5 text-sm font-bold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff] min-[520px]:w-auto">
                {t('Rapportera problem', 'Report a problem', 'Problem melden')}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[8px] border border-[#d7e3f4] bg-white">
            <div className="relative aspect-[4/3] w-full bg-[#dcecf8]">
              <Image
                src="/autorell-pricing-mobile-hero.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 440px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-3 border-t border-[#dfe6f2]">
              {[
                [t('Svar', 'Answers', 'Antworten'), '40+'],
                [t('Marknader', 'Markets', 'Märkte'), '11'],
                [t('Ämnen', 'Topics', 'Themen'), '10'],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-[#dfe6f2] px-4 py-4 last:border-r-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#667085]">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-[#101828]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5ebf3] bg-white">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-3 px-5 py-6 sm:px-8 lg:grid-cols-4">
          {quickActions.map(([Icon, title, text, href]) => (
            <Link key={String(title)} href={href} className="group flex min-w-0 gap-4 rounded-[8px] border border-[#dfe6f2] bg-white p-4 transition hover:border-[#0866ff] hover:bg-[#f8fbff]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#eef5ff] text-[#0866ff]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <strong className="block text-sm text-[#101828]">{String(title)}</strong>
                <span className="mt-1 block text-xs leading-5 text-[#667085]">{String(text)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="relative mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[.72fr_1fr] lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                {t('Vanliga ärenden', 'Common cases', 'Häufige Fälle')}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
                {t(
                  'Hitta rätt hjälp utan att leta runt.',
                  'Find the right help without hunting around.',
                  'Finden Sie die richtige Hilfe ohne langes Suchen.',
                )}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#667085]">
                {t(
                  'De viktigaste områdena är samlade här: trygghet, meddelanden, transport och support. FAQ:n under uppdateras med samma marknad och språk som sidan.',
                  'The important areas are gathered here: safety, messages, transport and support. The FAQ below follows the same market and language as the page.',
                  'Die wichtigsten Bereiche sind hier gesammelt: Sicherheit, Nachrichten, Transport und Support. Die FAQ darunter folgt Markt und Sprache der Seite.',
                )}
              </p>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {supportCards.map(([Icon, title, text]) => (
                <article key={String(title)} className="flex min-w-0 gap-4 rounded-[8px] border border-[#dfe6f2] bg-[#f8fbff] p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0866ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <strong className="text-sm">{String(title)}</strong>
                    <p className="mt-1 max-w-[245px] break-words text-xs leading-5 text-[#667085] sm:max-w-none">{String(text)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <FaqPageClient locale={locale} />
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

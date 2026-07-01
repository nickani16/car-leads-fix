import { headers } from 'next/headers'
import { CircleHelp, MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import { createPublicMetadata } from '@/lib/public-seo'
import { isPublicLanguage, translatePublic, type PublicLocale } from '@/lib/public-i18n'
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
  const supportCards = [
    [
      ShieldCheck,
      t('Trygghet', 'Safety', 'Sicherheit'),
      t(
        'Rapportera misstänkt bedrägeri och identitetsmissbruk.',
        'Report suspected fraud and identity misuse.',
        'Verdächtigen Betrug und Identitätsmissbrauch melden.',
      ),
    ],
    [
      MessageCircle,
      t('Meddelanden', 'Messages', 'Nachrichten'),
      t(
        'Kontakta säljare och behåll kommunikationen i kontot.',
        'Contact sellers and keep communication in your account.',
        'Verkäufer kontaktieren und Kommunikation im Konto behalten.',
      ),
    ],
    [
      Truck,
      t('Transport', 'Transport', 'Transport'),
      t(
        'Förstå dokument, transport, skyltar och registrering mellan länder.',
        'Understand documents, transport, plates and registration between countries.',
        'Dokumente, Transport, Kennzeichen und Registrierung zwischen Ländern verstehen.',
      ),
    ],
    [
      CircleHelp,
      t('Support', 'Support', 'Support'),
      t(
        'Få hjälp med konto, annons, betalning eller granskning.',
        'Get help with an account, listing, payment or review.',
        'Hilfe zu Konto, Anzeige, Zahlung oder Prüfung erhalten.',
      ),
    ],
  ] as const

  return (
    <main className="overflow-x-hidden bg-[#f7f9fc] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="relative overflow-hidden border-b border-[#e1e6ef] bg-white">
        <div className="market-blob absolute -right-24 -top-36 h-[420px] w-[420px] bg-[#e8f0ff]" />
        <div className="relative mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid w-full min-w-0 gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
                {t('Autorell hjälpcenter', 'Autorell help center', 'Autorell Hilfe')}
              </p>
              <h1 className="mt-5 max-w-3xl text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-6xl sm:tracking-[-0.055em] lg:text-[72px]">
                {t(
                  'Hjälp för köp, försäljning och tryggare affärer.',
                  'Help for buying, selling and safer deals.',
                  'Hilfe für Kauf, Verkauf und sicherere Geschäfte.',
                )}
              </h1>
              <p className="mt-6 max-w-[330px] break-words text-lg leading-8 text-[#667085] sm:max-w-2xl">
                {t(
                  'Sök bland tydliga svar om konton, annonser, transport, registrering, priser, meddelanden och vad du gör om något verkar fel.',
                  'Search clear answers about accounts, listings, transport, registration, prices, messages and what to do if something seems wrong.',
                  'Klare Antworten zu Konten, Anzeigen, Transport, Registrierung, Preisen, Nachrichten und verdächtigen Situationen finden.',
                )}
              </p>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {supportCards.map(([Icon, title, text]) => (
                <article key={String(title)} className="flex min-w-0 gap-4 rounded-[16px] border border-[#dde4ef] bg-[#f8faff] p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-[#0866ff] shadow-sm">
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

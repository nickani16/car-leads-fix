import { headers } from 'next/headers'
import { createPublicMetadata } from '@/lib/public-seo'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'
import FaqPageClient from './FaqPageClient'

const helpCenterMeta: Record<PublicLocale, { title: string; description: string }> = {
  sv: {
    title: 'Autorell hjälpcenter',
    description: 'Hitta svar om konto, annonser, köp, betalning, företag, export, transport och trygghet på Autorell.',
  },
  de: {
    title: 'Autorell Hilfe-Center',
    description: 'Antworten zu Konto, Anzeigen, Kauf, Zahlung, Unternehmen, Export, Transport und Sicherheit bei Autorell.',
  },
  en: {
    title: 'Autorell help center',
    description: 'Find answers about accounts, listings, buying, payment, business, export, transport and safety on Autorell.',
  },
  at: {
    title: 'Autorell Hilfe-Center',
    description: 'Antworten zu Konto, Anzeigen, Kauf, Zahlung, Unternehmen, Export, Transport und Sicherheit bei Autorell.',
  },
  be: {
    title: 'Autorell helpcentrum',
    description: 'Vind antwoorden over accounts, advertenties, kopen, betaling, bedrijven, export, transport en veiligheid.',
  },
  fr: {
    title: 'Centre d’aide Autorell',
    description: 'Trouvez des réponses sur compte, annonces, achat, paiement, entreprises, export, transport et sécurité.',
  },
  es: {
    title: 'Centro de ayuda Autorell',
    description: 'Respuestas sobre cuenta, anuncios, compra, pago, empresas, exportación, transporte y seguridad.',
  },
  it: {
    title: 'Centro assistenza Autorell',
    description: 'Risposte su account, annunci, acquisto, pagamenti, aziende, export, trasporto e sicurezza.',
  },
  pl: {
    title: 'Centrum pomocy Autorell',
    description: 'Odpowiedzi o koncie, ogłoszeniach, zakupie, płatnościach, firmach, eksporcie, transporcie i bezpieczeństwie.',
  },
  nl: {
    title: 'Autorell helpcentrum',
    description: 'Vind antwoorden over accounts, advertenties, kopen, betaling, bedrijven, export, transport en veiligheid.',
  },
  fi: {
    title: 'Autorell ohjekeskus',
    description: 'Vastauksia tileistä, ilmoituksista, ostamisesta, maksuista, yrityksistä, viennistä, kuljetuksesta ja turvallisuudesta.',
  },
  da: {
    title: 'Autorell hjælpecenter',
    description: 'Find svar om konto, annoncer, køb, betaling, virksomheder, eksport, transport og sikkerhed på Autorell.',
  },
}

export async function generateMetadata() {
  const headerStore = await headers()
  const locale = normalizePublicLocale(headerStore.get('x-autorell-language') || 'sv')
  const meta = helpCenterMeta[locale] || helpCenterMeta.en
  return createPublicMetadata({
    title: meta.title,
    description: meta.description,
    path: '/help-center',
    locale,
  })
}

export default async function FaqPage() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const locale = normalizePublicLocale(requestedLocale)

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#dfe6f2] bg-white">
        <div className="mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8 sm:py-14">
          <FaqPageClient locale={locale} />
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function normalizePublicLocale(value: string): PublicLocale {
  return value === 'sv' || value === 'de' || isPublicLanguage(value) ? value : 'sv'
}

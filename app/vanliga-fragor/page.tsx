import { headers } from 'next/headers'
import { createPublicMetadata } from '@/lib/public-seo'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'
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

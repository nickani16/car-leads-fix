import { headers } from 'next/headers'
import { createPublicMetadata } from '@/lib/public-seo'
import PublicContactPage from '@/app/components/PublicContactPage'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'

export const metadata = createPublicMetadata({
  title: 'Kontakta Autorell | Säljare, företag och köpare',
  description:
    'Kontakta Autorell om att sälja bil, ett pågående ärende, företagslösningar, handlaråtkomst eller teknisk support.',
  path: '/contact',
})

export default async function ContactPage() {
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
    <main className="overflow-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <PublicContactPage locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}

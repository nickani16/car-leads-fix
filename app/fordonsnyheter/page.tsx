import { headers } from 'next/headers'
import { createPublicMetadata } from '@/lib/public-seo'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'

export const metadata = createPublicMetadata({
  title: 'Fordonsnyheter | Autorell',
  description:
    'Fordonsnyheter, guider och artiklar om bilar, transportbilar, lastbilar, motorcyklar, elfordon och fordonsmarknaden i Europa.',
  path: '/fordonsnyheter',
})

export default async function VehicleNewsRootPage() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'sv'

  return <VehicleNewsPage locale={locale} marketCode={marketCode} />
}

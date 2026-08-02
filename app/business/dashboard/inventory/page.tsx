import { permanentRedirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref } from '@/lib/public-i18n'

export default async function LegacyBusinessInventoryRoute() {
  const locale = await getRequestLocale()
  permanentRedirect(localizePublicHref(locale, '/account/company/inventory'))
}

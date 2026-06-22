import { headers } from 'next/headers'
import { isPublicLanguage, type PublicLocale } from './public-i18n'

export async function getRequestLocale(): Promise<PublicLocale> {
  const requestHeaders = await headers()
  const requested = requestHeaders.get('x-autorell-language')
  if (requested && isPublicLanguage(requested)) return requested

  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  ).toLowerCase()

  if (hostname.includes('autorell.de')) return 'de'
  if (hostname.includes('autorell.com')) return 'en'
  return 'sv'
}

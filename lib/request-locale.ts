import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { isPublicLanguage, type PublicLocale } from './public-i18n'

export async function getRequestLocale(): Promise<PublicLocale> {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()])
  const requestedMarket = requestHeaders.get('x-autorell-market')?.toUpperCase()
  if (requestedMarket === 'AT') return 'at'
  if (requestedMarket === 'BE') return 'be'

  const requested = requestHeaders.get('x-autorell-language')
  if (requested === 'sv' || requested === 'de') return requested
  if (requested && isPublicLanguage(requested)) return requested

  const cookieMarket = cookieStore.get('autorell-market')?.value
  if (cookieMarket === 'at') return 'at'
  if (cookieMarket === 'be') return 'be'

  const cookieLanguage = cookieStore.get('autorell-language')?.value
  if (cookieLanguage === 'sv' || cookieLanguage === 'de') return cookieLanguage
  if (cookieLanguage && isPublicLanguage(cookieLanguage)) return cookieLanguage

  if (cookieMarket === 'sv') return 'sv'
  if (cookieMarket === 'de') return 'de'

  return 'en'
}

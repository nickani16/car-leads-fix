import { headers } from 'next/headers'
import AppDownloadPage, { generateAppDownloadMetadata } from '@/app/components/AppDownloadPage'
import type { PublicLocale } from '@/lib/public-i18n'

async function requestContext() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'en'
  const locale = normalizeLocale(requestedLocale)
  return {
    locale,
    marketCode: headerStore.get('x-autorell-market') || undefined,
  }
}

export async function generateMetadata() {
  const { locale } = await requestContext()
  return generateAppDownloadMetadata(locale)
}

export default async function AppPage() {
  const { locale, marketCode } = await requestContext()
  return <AppDownloadPage locale={locale} marketCode={marketCode} />
}

function normalizeLocale(value: string): PublicLocale {
  if (['sv', 'de', 'en', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da'].includes(value)) {
    return value as PublicLocale
  }
  return 'en'
}

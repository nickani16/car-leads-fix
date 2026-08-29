import translations from './generated-public-client-translations.json'
import { manualPublicTranslation } from './manual-public-translations'
import {
  repairMojibakeText,
  translationLocale,
  type PublicLocale,
} from './public-locale'

export * from './public-locale'

const structuralKeys = new Set([
  'href',
  'src',
  'path',
  'primaryHref',
  'browseHref',
  'state',
  'status',
  'type',
  'value',
  'locale',
  'code',
  'id',
  'slug',
])

export function translatePublic(locale: PublicLocale, value: string) {
  const cleanValue = repairMojibakeText(value)
  if (locale === 'en') return cleanValue
  const normalizedLocale = translationLocale(locale)
  const manual =
    manualPublicTranslation(normalizedLocale, cleanValue) ||
    manualPublicTranslation(normalizedLocale, value)
  if (manual) return repairMojibakeText(manual)
  const dictionary = (
    translations as Record<string, Record<string, string> | undefined>
  )[normalizedLocale]
  return repairMojibakeText(dictionary?.[cleanValue] || dictionary?.[value] || cleanValue)
}

export function translatePublicObject<T>(
  locale: PublicLocale,
  value: T,
  parentKey = '',
): T {
  if (typeof value === 'string') {
    return (
      structuralKeys.has(parentKey)
        ? value
        : translatePublic(locale, value)
    ) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      translatePublicObject(locale, item, parentKey),
    ) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        translatePublicObject(locale, item, key),
      ]),
    ) as T
  }

  return value
}

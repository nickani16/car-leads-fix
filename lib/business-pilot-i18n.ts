import en from './business-pilot-copy.en.json'
import sv from './business-pilot-copy.sv.json'
import de from './business-pilot-copy.de.json'
import fr from './business-pilot-copy.fr.json'
import es from './business-pilot-copy.es.json'
import it from './business-pilot-copy.it.json'
import nl from './business-pilot-copy.nl.json'
import fi from './business-pilot-copy.fi.json'
import da from './business-pilot-copy.da.json'
import pl from './business-pilot-copy.pl.json'
import { translationLocale, type PublicLocale } from '@/lib/public-i18n'

export const businessPilotLocales = [
  'en',
  'sv',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'fi',
  'da',
  'pl',
] as const

export type BusinessPilotLocale = (typeof businessPilotLocales)[number]
export type BusinessPilotCopy = typeof en

const copyByLocale: Record<BusinessPilotLocale, BusinessPilotCopy> = {
  en,
  sv,
  de,
  fr,
  es,
  it,
  nl,
  fi,
  da,
  pl,
}

export function getBusinessPilotCopy(locale: PublicLocale): BusinessPilotCopy {
  return copyByLocale[normalizeBusinessPilotLocale(locale)]
}

export function normalizeBusinessPilotLocale(locale: PublicLocale | string): BusinessPilotLocale {
  const normalized = translationLocale(locale as PublicLocale)
  return businessPilotLocales.includes(normalized as BusinessPilotLocale)
    ? normalized as BusinessPilotLocale
    : 'en'
}

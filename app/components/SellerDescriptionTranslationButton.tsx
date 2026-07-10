'use client'

import { ExternalLink, Languages } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'

type SupportedDetectionLanguage =
  | 'sv'
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'nl'
  | 'pl'
  | 'da'
  | 'fi'

const googleTargetLanguage: Record<string, string> = {
  sv: 'sv',
  de: 'de',
  en: 'en',
  fr: 'fr',
  es: 'es',
  it: 'it',
  nl: 'nl',
  pl: 'pl',
  da: 'da',
  fi: 'fi',
  pt: 'pt',
  cs: 'cs',
  ro: 'ro',
  bg: 'bg',
  hr: 'hr',
  el: 'el',
  hu: 'hu',
  sk: 'sk',
  sl: 'sl',
  et: 'et',
  lv: 'lv',
  lt: 'lt',
}

const languageSignals: Record<SupportedDetectionLanguage, string[]> = {
  sv: ['och', 'att', 'med', 'som', 'till', 'for', 'fran', 'inte', 'den', 'det', 'ar', 'pa', 'bilen', 'fordon', 'sommardack', 'vinterdack', 'service'],
  en: ['and', 'the', 'with', 'for', 'from', 'this', 'that', 'not', 'vehicle', 'car', 'service', 'condition', 'seller', 'available', 'mileage'],
  de: ['und', 'der', 'die', 'das', 'mit', 'fur', 'von', 'nicht', 'fahrzeug', 'auto', 'zustand', 'service', 'verkaufer', 'ausstattung'],
  es: ['y', 'el', 'la', 'los', 'las', 'con', 'para', 'desde', 'vehiculo', 'coche', 'estado', 'mantenimiento', 'vendedor', 'disponible'],
  fr: ['et', 'le', 'la', 'les', 'avec', 'pour', 'depuis', 'vehicule', 'voiture', 'etat', 'entretien', 'vendeur', 'disponible'],
  it: ['e', 'il', 'la', 'gli', 'con', 'per', 'da', 'veicolo', 'auto', 'stato', 'manutenzione', 'venditore', 'disponibile'],
  nl: ['en', 'de', 'het', 'met', 'voor', 'van', 'niet', 'voertuig', 'auto', 'staat', 'onderhoud', 'verkoper', 'beschikbaar'],
  pl: ['i', 'oraz', 'samochod', 'pojazd', 'sprzedawca', 'stan', 'serwis', 'dostepny', 'przebieg', 'wyposazenie'],
  da: ['og', 'det', 'med', 'for', 'fra', 'ikke', 'bil', 'koretoj', 'stand', 'service', 'saelger', 'tilgaengelig'],
  fi: ['ja', 'on', 'etta', 'kanssa', 'auto', 'ajoneuvo', 'myyja', 'kunto', 'huolto', 'saatavilla', 'varusteet'],
}

const diacriticSignals: Array<[SupportedDetectionLanguage, RegExp, number]> = [
  ['sv', /[åäö]/gi, 4],
  ['de', /[äöüß]/gi, 4],
  ['es', /[áéíóúñ¿¡]/gi, 4],
  ['fr', /[àâçéèêëîïôùûüÿœ]/gi, 4],
  ['it', /[àèéìíîòóùú]/gi, 3],
  ['pl', /[ąćęłńóśźż]/gi, 4],
  ['da', /[æøå]/gi, 4],
  ['fi', /[äö]/gi, 2],
]

export default function SellerDescriptionTranslationButton({
  text,
  locale,
}: {
  text: string
  locale: PublicLocale
}) {
  const trimmed = text.trim()
  if (trimmed.length < 24) return null

  const pageLanguage = normalizeComparableLanguage(locale)
  const detectedLanguage = detectLanguage(trimmed)
  if (detectedLanguage && detectedLanguage === pageLanguage) return null

  const target = googleTargetLanguage[locale] || 'en'
  const href = `https://translate.google.com/?sl=auto&tl=${encodeURIComponent(target)}&text=${encodeURIComponent(trimmed)}&op=translate`
  const label = translateLabel(locale)
  const helper = helperText(locale, detectedLanguage)

  return (
    <div className="mt-4 rounded-[12px] border border-[#d8e6ff] bg-[#f8fbff] px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
            <Languages className="h-4 w-4 text-[#0866ff]" />
            {label.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">{helper}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0757da]"
        >
          {label.button}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function normalizeComparableLanguage(locale: PublicLocale): SupportedDetectionLanguage | null {
  if (locale === 'sv' || locale === 'en' || locale === 'de' || locale === 'es' || locale === 'fr' || locale === 'it' || locale === 'nl' || locale === 'pl' || locale === 'da' || locale === 'fi') {
    return locale
  }
  return null
}

function detectLanguage(value: string): SupportedDetectionLanguage | null {
  const normalized = normalizeText(value)
  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length < 5) return null
  const scores = new Map<SupportedDetectionLanguage, number>()

  for (const [language, signals] of Object.entries(languageSignals) as Array<[SupportedDetectionLanguage, string[]]>) {
    let score = 0
    for (const signal of signals) {
      if (words.includes(signal)) score += 2
    }
    scores.set(language, score)
  }

  for (const [language, regex, weight] of diacriticSignals) {
    const matches = value.match(regex)
    if (matches?.length) {
      scores.set(language, (scores.get(language) || 0) + Math.min(matches.length * weight, 12))
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1])
  const [best, second] = ranked
  if (!best || best[1] < 4) return null
  if (second && best[1] - second[1] < 3) return null
  return best[0]
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/[^a-z\s]/g, ' ')
}

function translateLabel(locale: PublicLocale) {
  if (locale === 'sv') return { title: 'Vill du läsa säljarens text på svenska?', button: 'Översätt till svenska' }
  if (locale === 'de') return { title: 'Verkäufertext übersetzen', button: 'Auf Deutsch übersetzen' }
  if (locale === 'es') return { title: 'Traducir el texto del vendedor', button: 'Traducir al español' }
  if (locale === 'fr') return { title: 'Traduire le texte du vendeur', button: 'Traduire en français' }
  if (locale === 'it') return { title: 'Traduci il testo del venditore', button: 'Traduci in italiano' }
  if (locale === 'nl') return { title: 'Verkoperstekst vertalen', button: 'Vertaal naar Nederlands' }
  if (locale === 'pl') return { title: 'Przetłumacz tekst sprzedawcy', button: 'Przetłumacz na polski' }
  if (locale === 'da') return { title: 'Oversæt sælgerens tekst', button: 'Oversæt til dansk' }
  if (locale === 'fi') return { title: 'Käännä myyjän teksti', button: 'Käännä suomeksi' }
  return { title: 'Translate seller description', button: 'Translate' }
}

function helperText(locale: PublicLocale, detectedLanguage: SupportedDetectionLanguage | null) {
  const detected = detectedLanguage ? languageName(detectedLanguage, locale) : null
  if (locale === 'sv') return detected ? `Texten verkar vara på ${detected}. Översättningen öppnas gratis i Google Translate.` : 'Översättningen öppnas gratis i Google Translate.'
  if (locale === 'de') return detected ? `Der Text scheint auf ${detected} zu sein. Die Übersetzung öffnet kostenlos in Google Translate.` : 'Die Übersetzung öffnet kostenlos in Google Translate.'
  return detected ? `The text appears to be in ${detected}. Translation opens for free in Google Translate.` : 'Translation opens for free in Google Translate.'
}

function languageName(language: SupportedDetectionLanguage, locale: PublicLocale) {
  const names: Record<SupportedDetectionLanguage, Record<'sv' | 'de' | 'en', string>> = {
    sv: { sv: 'svenska', de: 'Schwedisch', en: 'Swedish' },
    en: { sv: 'engelska', de: 'Englisch', en: 'English' },
    de: { sv: 'tyska', de: 'Deutsch', en: 'German' },
    es: { sv: 'spanska', de: 'Spanisch', en: 'Spanish' },
    fr: { sv: 'franska', de: 'Französisch', en: 'French' },
    it: { sv: 'italienska', de: 'Italienisch', en: 'Italian' },
    nl: { sv: 'nederländska', de: 'Niederländisch', en: 'Dutch' },
    pl: { sv: 'polska', de: 'Polnisch', en: 'Polish' },
    da: { sv: 'danska', de: 'Dänisch', en: 'Danish' },
    fi: { sv: 'finska', de: 'Finnisch', en: 'Finnish' },
  }
  if (locale === 'sv') return names[language].sv
  if (locale === 'de') return names[language].de
  return names[language].en
}

'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

export type VehicleSmartSearchSuggestion = {
  href: string
  title: string
  description: string
  keywords?: string
  type?: string
}

const smartSearchCache = new Map<string, { expiresAt: number; data: VehicleSmartSearchSuggestion[] }>()
const smartSearchInflight = new Map<string, Promise<VehicleSmartSearchSuggestion[]>>()
const SMART_SEARCH_CACHE_TTL_MS = 5 * 60_000
const SMART_SEARCH_CACHE_MAX_ENTRIES = 150
const SMART_SEARCH_MIN_QUERY_LENGTH = 3
const SMART_SEARCH_DEBOUNCE_MS = 650

function normalizeSuggestionQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function setSmartSearchCache(key: string, data: VehicleSmartSearchSuggestion[]) {
  if (smartSearchCache.size >= SMART_SEARCH_CACHE_MAX_ENTRIES) {
    const firstKey = smartSearchCache.keys().next().value
    if (firstKey) smartSearchCache.delete(firstKey)
  }
  smartSearchCache.set(key, {
    expiresAt: Date.now() + SMART_SEARCH_CACHE_TTL_MS,
    data,
  })
}

export function useVehicleSmartSearchSuggestions({
  query,
  locale,
  marketCode,
  active = true,
  limit = 10,
}: {
  query: string
  locale: PublicLocale
  marketCode?: string | null
  active?: boolean
  limit?: number
}) {
  const [suggestions, setSuggestions] = useState<VehicleSmartSearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')

  useEffect(() => {
    const trimmed = normalizeSuggestionQuery(query)
    if (!active || trimmed.length < SMART_SEARCH_MIN_QUERY_LENGTH) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        locale,
        q: trimmed,
        limit: String(limit),
      })
      if (marketCode) params.set('market', marketCode)
      const cacheKey = params.toString()
      const cached = smartSearchCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        setSuggestions(cached.data)
        setSearchedQuery(trimmed)
        setLoading(false)
        return
      }

      setLoading(true)
      const request =
        smartSearchInflight.get(cacheKey) ||
        fetch(`/api/public-search?${params.toString()}`)
          .then((response) => (response.ok ? response.json() : []))
          .then((data: VehicleSmartSearchSuggestion[]) => (Array.isArray(data) ? data : []))
          .finally(() => smartSearchInflight.delete(cacheKey))

      smartSearchInflight.set(cacheKey, request)
      request
        .then((data: VehicleSmartSearchSuggestion[]) => {
          if (!controller.signal.aborted) {
            const nextSuggestions = data
            setSmartSearchCache(cacheKey, nextSuggestions)
            setSuggestions(nextSuggestions)
            setSearchedQuery(trimmed)
          }
        })
        .catch((error) => {
          if (error?.name !== 'AbortError') {
            setSuggestions([])
            setSearchedQuery(trimmed)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, SMART_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, limit, locale, marketCode, query])

  const canSearch = active && normalizeSuggestionQuery(query).length >= SMART_SEARCH_MIN_QUERY_LENGTH
  return {
    suggestions: canSearch ? suggestions : [],
    loading: canSearch ? loading : false,
    searched: canSearch && searchedQuery === normalizeSuggestionQuery(query),
  }
}

function typeLabel(type: string | undefined, locale: PublicLocale) {
  if (locale === 'de') {
    if (type === 'category') return 'Kategorie'
    if (type === 'place') return 'Ort'
    if (type === 'vehicle-query') return 'Suche'
    if (type === 'make' || type === 'model') return 'Marke'
    if (type === 'listing') return 'Anzeige'
    return 'Fahrzeug'
  }
  if (locale === 'en') {
    if (type === 'category') return 'Category'
    if (type === 'place') return 'Area'
    if (type === 'vehicle-query') return 'Search'
    if (type === 'make' || type === 'model') return 'Make'
    if (type === 'listing') return 'Listing'
    return 'Vehicle'
  }
  if (type === 'category') return 'Kategori'
  if (type === 'make' || type === 'model') return 'M\u00e4rke'
  if (type === 'place') return 'Område'
  if (type === 'vehicle-query') return 'Sökning'
  if (type === 'listing') return 'Annons'
  return 'Sida'
}

const localizedSmartSearchLabels = {
  sv: { category: 'Kategori', place: 'Område', search: 'Sökning', make: 'Märke', listing: 'Annons', default: 'Sida', loading: 'Söker...' },
  en: { category: 'Category', place: 'Area', search: 'Search', make: 'Make', listing: 'Listing', default: 'Vehicle', loading: 'Searching...' },
  de: { category: 'Kategorie', place: 'Ort', search: 'Suche', make: 'Marke', listing: 'Anzeige', default: 'Fahrzeug', loading: 'Sucht...' },
  it: { category: 'Categoria', place: 'Zona', search: 'Ricerca', make: 'Marca', listing: 'Annuncio', default: 'Veicolo', loading: 'Ricerca...' },
  es: { category: 'Categoria', place: 'Zona', search: 'Busqueda', make: 'Marca', listing: 'Anuncio', default: 'Vehiculo', loading: 'Buscando...' },
  fr: { category: 'Categorie', place: 'Lieu', search: 'Recherche', make: 'Marque', listing: 'Annonce', default: 'Vehicule', loading: 'Recherche...' },
  nl: { category: 'Categorie', place: 'Gebied', search: 'Zoeken', make: 'Merk', listing: 'Advertentie', default: 'Voertuig', loading: 'Zoeken...' },
  pl: { category: 'Kategoria', place: 'Obszar', search: 'Wyszukiwanie', make: 'Marka', listing: 'Ogloszenie', default: 'Pojazd', loading: 'Szukam...' },
  da: { category: 'Kategori', place: 'Område', search: 'Søgning', make: 'Mærke', listing: 'Annonce', default: 'Køretøj', loading: 'Søger...' },
  fi: { category: 'Luokka', place: 'Alue', search: 'Haku', make: 'Merkki', listing: 'Ilmoitus', default: 'Ajoneuvo', loading: 'Haetaan...' },
} as const

function localizedSmartSearchLocale(locale: PublicLocale) {
  if (locale === 'at') return 'de'
  if (locale === 'be') return 'nl'
  return locale in localizedSmartSearchLabels ? (locale as keyof typeof localizedSmartSearchLabels) : 'en'
}

function localizedTypeLabel(type: string | undefined, locale: PublicLocale) {
  if (locale !== 'at' && locale !== 'be' && !(locale in localizedSmartSearchLabels)) return typeLabel(type, locale)
  const labels = localizedSmartSearchLabels[localizedSmartSearchLocale(locale)]
  if (type === 'category') return labels.category
  if (type === 'place') return labels.place
  if (type === 'vehicle-query') return labels.search
  if (type === 'make' || type === 'model') return labels.make
  if (type === 'listing') return labels.listing
  return labels.default
}

function localizedLoadingLabel(locale: PublicLocale) {
  return localizedSmartSearchLabels[localizedSmartSearchLocale(locale)].loading
}

function localizedNoResultsLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Tyvärr finns det inga sökträffar som matchar din sökning.'
  if (locale === 'de' || locale === 'at') return 'Leider gibt es keine Treffer, die zu Ihrer Suche passen.'
  if (locale === 'es') return 'Lo sentimos, no hay resultados que coincidan con tu búsqueda.'
  if (locale === 'fr') return 'Désolé, aucun résultat ne correspond à votre recherche.'
  if (locale === 'it') return 'Spiacenti, non ci sono risultati corrispondenti alla tua ricerca.'
  if (locale === 'nl' || locale === 'be') return 'Helaas zijn er geen resultaten die overeenkomen met je zoekopdracht.'
  if (locale === 'pl') return 'Niestety nie ma wyników pasujących do wyszukiwania.'
  if (locale === 'da') return 'Desværre er der ingen resultater, der matcher din søgning.'
  if (locale === 'fi') return 'Valitettavasti hakuasi vastaavia tuloksia ei löytynyt.'
  return 'Sorry, there are no results that match your search.'
}

export function VehicleSmartSearchSuggestionPanel({
  query,
  suggestions,
  loading,
  searched = false,
  locale,
  onSelect,
  active = true,
  className = '',
}: {
  query: string
  suggestions: VehicleSmartSearchSuggestion[]
  loading: boolean
  searched?: boolean
  locale: PublicLocale
  onSelect?: (suggestion: VehicleSmartSearchSuggestion) => void | boolean
  active?: boolean
  className?: string
}) {
  const showPanel = active && normalizeSuggestionQuery(query).length >= SMART_SEARCH_MIN_QUERY_LENGTH
  if (!showPanel) return null

  return (
    <div
      className={`absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-[8px] border border-[#d0d5dd] bg-white shadow-[0_18px_38px_rgba(16,24,40,.18)] ${className}`}
    >
      {loading && suggestions.length === 0 ? (
        <div className="flex min-h-12 items-center gap-2 px-4 text-[14px] font-[400] text-[#667085]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0866ff]" />
          {localizedLoadingLabel(locale)}
        </div>
      ) : null}
      {searched && !loading && suggestions.length === 0 ? (
        <div className="px-4 py-4 text-[14px] font-[400] leading-6 text-[#475467]">
          {localizedNoResultsLabel(locale)}
        </div>
      ) : null}
      <div className="max-h-[390px] overflow-y-auto">
        {suggestions.map((suggestion) => (
          <Link
            key={`${suggestion.type || 'result'}:${suggestion.href}:${suggestion.title}`}
            href={suggestion.href}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              const shouldNavigate = onSelect?.(suggestion)
              if (shouldNavigate === false) event.preventDefault()
            }}
            className="grid min-h-[54px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4e7ec] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8fbff]"
          >
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-[500] leading-5 text-[#101828]">
                {suggestion.title}
              </span>
              {suggestion.description ? (
                <span className="mt-0.5 block truncate text-[12px] font-[400] leading-4 text-[#667085]">
                  {suggestion.description}
                </span>
              ) : null}
            </span>
            <span className="whitespace-nowrap text-[14px] font-[400] text-[#667085]">
              {localizedTypeLabel(suggestion.type, locale)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

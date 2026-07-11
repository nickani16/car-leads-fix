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

  useEffect(() => {
    const trimmed = query.trim()
    if (!active || trimmed.length < 2) {
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

      setLoading(true)
      fetch(`/api/public-search?${params.toString()}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : []))
        .then((data: VehicleSmartSearchSuggestion[]) => {
          if (!controller.signal.aborted) setSuggestions(Array.isArray(data) ? data : [])
        })
        .catch((error) => {
          if (error?.name !== 'AbortError') setSuggestions([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, limit, locale, marketCode, query])

  const canSearch = active && query.trim().length >= 2
  return {
    suggestions: canSearch ? suggestions : [],
    loading: canSearch ? loading : false,
  }
}

function typeLabel(type: string | undefined, locale: PublicLocale) {
  if (locale === 'de') {
    if (type === 'category') return 'Kategorie'
    if (type === 'place') return 'Ort'
    if (type === 'vehicle-query') return 'Suche'
    if (type === 'make-model') return 'Marke'
    if (type === 'listing') return 'Anzeige'
    return 'Seite'
  }
  if (locale === 'en') {
    if (type === 'category') return 'Category'
    if (type === 'place') return 'Area'
    if (type === 'vehicle-query') return 'Search'
    if (type === 'make-model') return 'Make'
    if (type === 'listing') return 'Listing'
    return 'Page'
  }
  if (type === 'category') return 'Kategori'
  if (type === 'place') return 'Område'
  if (type === 'vehicle-query') return 'Sökning'
  if (type === 'make-model') return 'Märke'
  if (type === 'listing') return 'Annons'
  return 'Sida'
}

export function VehicleSmartSearchSuggestionPanel({
  query,
  suggestions,
  loading,
  locale,
  onSelect,
  className = '',
}: {
  query: string
  suggestions: VehicleSmartSearchSuggestion[]
  loading: boolean
  locale: PublicLocale
  onSelect?: (suggestion: VehicleSmartSearchSuggestion) => void
  className?: string
}) {
  const showPanel = query.trim().length >= 2 && (loading || suggestions.length > 0)
  if (!showPanel) return null

  return (
    <div
      className={`absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-[8px] border border-[#d0d5dd] bg-white shadow-[0_18px_38px_rgba(16,24,40,.18)] ${className}`}
    >
      {loading && suggestions.length === 0 ? (
        <div className="flex min-h-12 items-center gap-2 px-4 text-[14px] font-[400] text-[#667085]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0866ff]" />
          {locale === 'de' ? 'Sucht...' : locale === 'en' ? 'Searching...' : 'Söker...'}
        </div>
      ) : null}
      <div className="max-h-[390px] overflow-y-auto">
        {suggestions.map((suggestion) => (
          <Link
            key={`${suggestion.type || 'result'}:${suggestion.href}:${suggestion.title}`}
            href={suggestion.href}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect?.(suggestion)}
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
              {typeLabel(suggestion.type, locale)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

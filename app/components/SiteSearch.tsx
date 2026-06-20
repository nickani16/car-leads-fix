'use client'

import Link from 'next/link'
import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type SearchResult = {
  href: string
  title: string
  description: string
  keywords: string
}

const copy = {
  sv: {
    label: 'Sök',
    placeholder: 'Sök på Autorell',
    empty: 'Inga relevanta sidor hittades.',
    hint: 'Sök bland alla publika sidor',
  },
  de: {
    label: 'Suche',
    placeholder: 'Autorell durchsuchen',
    empty: 'Keine passenden Seiten gefunden.',
    hint: 'Alle öffentlichen Seiten durchsuchen',
  },
  en: {
    label: 'Search',
    placeholder: 'Search Autorell',
    empty: 'No relevant pages found.',
    hint: 'Search all public pages',
  },
} as const

export default function SiteSearch({
  locale,
  marketCode,
  mobile = false,
  onNavigate,
}: {
  locale: PublicLocale
  marketCode?: string
  mobile?: boolean
  onNavigate?: () => void
}) {
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const text = copy[language]
  const [open, setOpen] = useState(mobile)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchResult[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || index) return
    const params = new URLSearchParams({ locale })
    if (marketCode) params.set('market', marketCode)
    fetch(`/api/public-search?${params.toString()}`)
      .then((response) => response.json())
      .then((data: SearchResult[]) => setIndex(data))
      .catch(() => setIndex([]))
  }, [index, locale, marketCode, open])

  const results = useMemo(() => {
    if (!index) return []
    const normalized = query.trim().toLocaleLowerCase(locale)
    if (normalized.length < 2) return []
    const terms = normalized.split(/\s+/)
    return index
      .map((item) => {
        const title = item.title.toLocaleLowerCase(locale)
        const haystack = `${title} ${item.description} ${item.keywords}`.toLocaleLowerCase(locale)
        const score = terms.reduce(
          (total, term) =>
            total +
            (title.startsWith(term) ? 8 : 0) +
            (title.includes(term) ? 4 : 0) +
            (haystack.includes(term) ? 1 : -8),
          0,
        )
        return { item, score }
      })
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(({ item }) => item)
  }, [index, locale, query])

  useEffect(() => {
    if (open && !mobile) inputRef.current?.focus()
  }, [mobile, open])

  if (!open && !mobile) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={text.label}
        className="grid h-11 w-11 place-items-center rounded-full border border-[#d9dfdf] bg-white/90 text-[#242424] transition hover:-translate-y-0.5 hover:border-[#adcddd] hover:bg-[#eef7fb]"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    )
  }

  const panel = (
    <div className={mobile ? 'relative w-full' : 'relative w-[min(430px,calc(100vw-32px))]'}>
      <div className="flex h-12 items-center gap-3 rounded-[15px] border border-[#cfdadd] bg-white px-4 shadow-[0_12px_32px_rgba(32,33,36,.1)] focus-within:border-[#89b9d2] focus-within:ring-4 focus-within:ring-[#b4d9ef]/30">
        <Search className="h-[18px] w-[18px] shrink-0 text-[#66808c]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text.placeholder}
          aria-label={text.placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#8b989e]"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            <X className="h-4 w-4 text-[#718087]" />
          </button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div className={`${mobile ? 'mt-2' : 'absolute right-0 top-full z-50 mt-2'} w-full overflow-hidden rounded-[18px] border border-[#dce3e5] bg-white p-2 shadow-[0_24px_65px_rgba(32,33,36,.16)]`}>
          {results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result.href}
                href={result.href}
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                  onNavigate?.()
                }}
                className="group flex items-center gap-3 rounded-[13px] px-3 py-3 transition hover:bg-[#eef6fa]"
              >
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-medium text-[#202124]">
                    {result.title}
                  </strong>
                  <span className="mt-0.5 block truncate text-[11px] text-[#738187]">
                    {result.description}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#7195a6] transition group-hover:translate-x-0.5" />
              </Link>
            ))
          ) : (
            <p className="px-4 py-5 text-sm text-[#718087]">{text.empty}</p>
          )}
        </div>
      )}
      {mobile && query.trim().length < 2 && (
        <p className="mt-2 px-1 text-[11px] text-[#7b878c]">{text.hint}</p>
      )}
    </div>
  )

  if (mobile) return panel

  return (
    <div className="absolute right-0 top-full z-40 pt-3">
      <div className="flex items-start gap-2 rounded-[20px] border border-[#dce3e5] bg-[#f7f8f6] p-2 shadow-[0_24px_65px_rgba(32,33,36,.16)]">
        {panel}
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setQuery('')
          }}
          aria-label="Close search"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-[#66767c] hover:bg-white"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  )
}

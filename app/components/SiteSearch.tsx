'use client'

import Link from 'next/link'
import { ArrowRight, Search, Sparkles, X } from 'lucide-react'
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
    title: 'Vad letar du efter?',
  },
  de: {
    label: 'Suche',
    placeholder: 'Autorell durchsuchen',
    empty: 'Keine passenden Seiten gefunden.',
    hint: 'Alle öffentlichen Seiten durchsuchen',
    title: 'Wonach suchen Sie?',
  },
  en: {
    label: 'Search',
    placeholder: 'Search Autorell',
    empty: 'No relevant pages found.',
    hint: 'Search all public pages',
    title: 'What are you looking for?',
  },
} as const

export default function SiteSearch({
  locale,
  marketCode,
  mobile = false,
  headerMobile = false,
  onNavigate,
}: {
  locale: PublicLocale
  marketCode?: string
  mobile?: boolean
  headerMobile?: boolean
  onNavigate?: () => void
}) {
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const text = copy[language]
  const [open, setOpen] = useState(mobile && !headerMobile)
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

  if (!open && (!mobile || headerMobile)) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={text.label}
        className={`grid h-11 w-11 place-items-center rounded-full border text-[#242424] transition hover:-translate-y-0.5 hover:border-[#adcddd] hover:bg-[#eef7fb] ${
          headerMobile
            ? 'border-[#deddd8] bg-[#f8f7f3] min-[1120px]:hidden'
            : 'border-[#d9dfdf] bg-white/90'
        }`}
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    )
  }

  const panel = (
    <div className={mobile || headerMobile ? 'relative w-full' : 'relative w-full'}>
      <div className="flex h-14 items-center gap-3 rounded-[18px] border border-[#c9d7dc] bg-white px-4 shadow-[0_14px_38px_rgba(32,52,62,.1)] transition focus-within:border-[#78aec9] focus-within:ring-4 focus-within:ring-[#b4d9ef]/35">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f4fa] text-[#315f75]">
          <Search className="h-[17px] w-[17px]" />
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text.placeholder}
          aria-label={text.placeholder}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#202124] outline-none placeholder:text-[#8b989e]"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            <X className="h-4 w-4 text-[#718087]" />
          </button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div className={`${mobile || headerMobile ? 'mt-3' : 'absolute right-0 top-full z-50 mt-3'} w-full overflow-hidden rounded-[20px] border border-[#d8e2e5] bg-white p-2 shadow-[0_28px_75px_rgba(32,45,52,.18)]`}>
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
                className="group flex items-center gap-3 rounded-[15px] border border-transparent px-3 py-3 transition hover:border-[#dceaf0] hover:bg-[#eef7fb]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f5f5] text-[#6a7e87] transition group-hover:bg-white group-hover:text-[#315f75]">
                  <ArrowRight className="h-4 w-4 -rotate-45" />
                </span>
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
      {(mobile || headerMobile) && query.trim().length < 2 && (
        <p className="mt-3 flex items-center gap-2 px-1 text-[11px] text-[#718087]">
          <Sparkles className="h-3.5 w-3.5 text-[#5b91aa]" />
          {text.hint}
        </p>
      )}
    </div>
  )

  if (mobile) return panel

  if (headerMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close search"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#242424] bg-[#242424] text-white min-[1120px]:hidden"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        <div className="fixed inset-x-0 bottom-0 top-[104px] z-[120] overflow-y-auto bg-[#182126]/20 backdrop-blur-[2px] md:top-[124px] min-[1120px]:hidden">
          <div className="border-t border-[#d8e1e3] bg-[linear-gradient(145deg,#f8fbfb,#edf5f7)] px-5 py-5 shadow-[0_28px_70px_rgba(24,33,38,.22)] sm:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#658392]">
                    Autorell
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#202124]">
                    {text.title}
                  </p>
                </div>
              </div>
              {panel}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="absolute right-0 top-full z-40 pt-3">
      <div className="w-[min(540px,calc(100vw-32px))] rounded-[24px] border border-[#d8e2e5] bg-[linear-gradient(145deg,#f9fbfb,#edf5f7)] p-4 shadow-[0_30px_85px_rgba(28,42,49,.2)]">
        <div className="mb-4 flex items-start justify-between gap-5 px-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#658392]">
              Autorell search
            </p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[#202124]">
              {text.title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setQuery('')
            }}
            aria-label="Close search"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d4dfe2] bg-white text-[#66767c] transition hover:border-[#aac9d8] hover:text-[#242424]"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </div>
        {panel}
      </div>
    </div>
  )
}

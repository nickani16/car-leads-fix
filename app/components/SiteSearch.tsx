'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bike,
  BusFront,
  CarFront,
  Grid2X2,
  Search,
  Truck,
  Warehouse,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type SearchResult = {
  href: string
  title: string
  description: string
  keywords: string
}

const copy = {
  sv: {
    label: 'Sök',
    placeholder: 'Sök annonser, fordon och sidor',
    empty: 'Inga relevanta sidor hittades.',
    hint: 'Sök bland annonser, fordon, kategorier och publika sidor',
    title: 'Vad letar du efter?',
  },
  de: {
    label: 'Suche',
    placeholder: 'Autorell durchsuchen',
    empty: 'Keine passenden Seiten gefunden.',
    hint: 'Anzeigen, Fahrzeuge, Kategorien und Seiten durchsuchen',
    title: 'Wonach suchen Sie?',
  },
  en: {
    label: 'Search',
    placeholder: 'Search listings, vehicles and pages',
    empty: 'No relevant pages found.',
    hint: 'Search listings, vehicles, categories and public pages',
    title: 'What are you looking for?',
  },
} as const

const desktopCopy = {
  sv: {
    all: 'Alla',
    cars: 'Bilar',
    vans: 'Transportbilar',
    motorcycles: 'Motorcyklar',
    motorhomes: 'Husbilar',
    caravans: 'Husvagnar',
    trucks: 'Lastbilar',
    more: 'Mer',
    recent: 'Senaste sökningar',
    clear: 'Rensa allt',
    quick: 'Snabbvägar',
    tip: 'Tips: tryck',
    anywhere: 'var som helst för att öppna sök',
  },
  de: {
    all: 'Alle',
    cars: 'Autos',
    vans: 'Transporter',
    motorcycles: 'Motorräder',
    motorhomes: 'Wohnmobile',
    caravans: 'Wohnwagen',
    trucks: 'Lkw',
    more: 'Mehr',
    recent: 'Letzte Suchen',
    clear: 'Alles löschen',
    quick: 'Schnellzugriff',
    tip: 'Tipp: Drücken Sie',
    anywhere: 'überall, um die Suche zu öffnen',
  },
  en: {
    all: 'All',
    cars: 'Cars',
    vans: 'Vans',
    motorcycles: 'Motorcycles',
    motorhomes: 'Motorhomes',
    caravans: 'Caravans',
    trucks: 'Trucks',
    more: 'More',
    recent: 'Recent searches',
    clear: 'Clear all',
    quick: 'Quick access',
    tip: 'Tip: press',
    anywhere: 'anywhere to open search',
  },
} as const

const desktopTabs: Array<{ key: keyof typeof desktopCopy.en; href: string; icon: LucideIcon }> = [
  { key: 'all', href: '/marketplace/cars', icon: CarFront },
  { key: 'cars', href: '/cars', icon: CarFront },
  { key: 'vans', href: '/vans', icon: BusFront },
  { key: 'motorcycles', href: '/motorcycles', icon: Bike },
  { key: 'motorhomes', href: '/motorhomes', icon: BusFront },
  { key: 'caravans', href: '/caravans', icon: Warehouse },
  { key: 'trucks', href: '/trucks', icon: Truck },
  { key: 'more', href: '/cars', icon: Grid2X2 },
]

const searchHistoryStorageKey = 'autorell.searchHistory.v1'
const maxRecentSearches = 6

const quickAccess: Array<{ key: keyof typeof desktopCopy.en; href: string; icon: LucideIcon; desc: string }> = [
  { key: 'cars', href: '/cars', icon: CarFront, desc: 'Find cars across Europe' },
  { key: 'vans', href: '/vans', icon: BusFront, desc: 'Find vans for work or business' },
  { key: 'motorcycles', href: '/motorcycles', icon: Bike, desc: 'Explore motorcycles and scooters' },
  { key: 'motorhomes', href: '/motorhomes', icon: BusFront, desc: 'Find motorhomes and RVs' },
  { key: 'trucks', href: '/trucks', icon: Truck, desc: 'Trucks, trailers and more' },
]

function quickAccessTitle(language: keyof typeof desktopCopy, label: string) {
  if (language === 'sv') return `Sök ${label.toLowerCase()}`
  if (language === 'de') return `${label} suchen`
  return `Search ${label.toLowerCase()}`
}

function quickAccessDescription(language: keyof typeof desktopCopy) {
  if (language === 'sv') return 'Hitta annonser i hela Europa'
  if (language === 'de') return 'Anzeigen in ganz Europa finden'
  return 'Find listings across Europe'
}

function readSearchHistory() {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(searchHistoryStorageKey) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  } catch {
    return []
  }
}

function emptyRecentText(language: keyof typeof desktopCopy) {
  if (language === 'sv') return 'Inga senaste sökningar än.'
  if (language === 'de') return 'Noch keine letzten Suchen.'
  return 'No recent searches yet.'
}

export default function SiteSearch({
  locale,
  marketCode,
  mobile = false,
  headerMobile = false,
  headerDesktop = false,
  onNavigate,
}: {
  locale: PublicLocale
  marketCode?: string
  mobile?: boolean
  headerMobile?: boolean
  headerDesktop?: boolean
  onNavigate?: () => void
}) {
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const text = copy[language]
  const desktopText = desktopCopy[language]
  const [open, setOpen] = useState(mobile && !headerMobile)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readSearchHistory())
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  function saveRecentSearch(value: string) {
    const trimmed = value.trim()
    if (trimmed.length < 2 || typeof window === 'undefined') return

    const next = [trimmed, ...recentSearches.filter((item) => item.toLocaleLowerCase(locale) !== trimmed.toLocaleLowerCase(locale))]
      .slice(0, maxRecentSearches)
    setRecentSearches(next)
    window.localStorage.setItem(searchHistoryStorageKey, JSON.stringify(next))
  }

  function removeRecentSearch(value: string) {
    if (typeof window === 'undefined') return

    const next = recentSearches.filter((item) => item !== value)
    setRecentSearches(next)
    window.localStorage.setItem(searchHistoryStorageKey, JSON.stringify(next))
  }

  function clearRecentSearches() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(searchHistoryStorageKey)
    setRecentSearches([])
  }

  useEffect(() => {
    const trimmed = query.trim()
    if (!open || trimmed.length < 2) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        locale,
        q: trimmed,
        limit: '10',
      })
      if (marketCode) params.set('market', marketCode)
      setSearching(true)
      fetch(`/api/public-search?${params.toString()}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : []))
        .then((data: SearchResult[]) => setResults(Array.isArray(data) ? data : []))
        .catch((error) => {
          if (error?.name !== 'AbortError') setResults([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false)
        })
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [locale, marketCode, open, query])

  function submitBestResult() {
    const trimmed = query.trim()
    if (trimmed.length < 2 || results.length === 0) return

    saveRecentSearch(trimmed)
    setOpen(false)
    setQuery('')
    onNavigate?.()
    router.push(results[0].href)
  }

  useEffect(() => {
    if (open && !mobile && !headerMobile) inputRef.current?.focus()
  }, [headerMobile, mobile, open])

  useEffect(() => {
    if (!headerDesktop) return

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }

      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [headerDesktop])

  useEffect(() => {
    if (!open || mobile) return

    function handleOutsidePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return

      setOpen(false)
      setQuery('')
    }

    document.addEventListener('mousedown', handleOutsidePointerDown, true)
    document.addEventListener('touchstart', handleOutsidePointerDown, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointerDown, true)
      document.removeEventListener('touchstart', handleOutsidePointerDown, true)
    }
  }, [mobile, open])

  if (!open && (!mobile || headerMobile)) {
    if (headerDesktop) {
      return (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={text.label}
          className="flex min-w-[66px] flex-col items-center justify-center px-2 text-[#202124] transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
        >
          <Search className="h-[19px] w-[19px]" strokeWidth={1.7} />
          <span className="text-[10px] font-medium">{text.label}</span>
        </button>
      )
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={text.label}
        className={`transition ${
          headerMobile
            ? 'flex h-12 min-w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 text-[#101828] hover:text-[#0866ff] min-[1120px]:hidden'
            : 'grid h-11 w-11 place-items-center rounded-full border border-[#deddd8] bg-white text-[#202124]'
        }`}
      >
        <Search className={headerMobile ? 'h-[22px] w-[22px]' : 'h-[18px] w-[18px]'} strokeWidth={1.7} />
        {headerMobile ? (
          <span className="text-[10px] font-medium leading-none">{text.label}</span>
        ) : null}
      </button>
    )
  }

  const panel = (
    <div className={mobile || headerMobile ? 'relative w-full' : 'relative w-full'}>
      <div className="flex h-14 items-center gap-3 rounded-[15px] border border-[#d7d9dc] bg-white px-4 shadow-[0_10px_30px_rgba(32,33,36,.08)] transition focus-within:border-[#8d9499] focus-within:ring-4 focus-within:ring-black/5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#eaf1ff] text-[#0866ff]">
          <Search className="h-[17px] w-[17px]" />
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submitBestResult()
            }
          }}
          placeholder={text.placeholder}
          aria-label={text.placeholder}
          className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none placeholder:text-[#98a2b3]"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            <X className="h-4 w-4 text-[#718087]" />
          </button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div className={`${mobile || headerMobile ? 'mt-3' : 'absolute right-0 top-full z-50 mt-3'} w-full overflow-hidden rounded-[16px] border border-[#dedede] bg-white p-2 shadow-[0_24px_65px_rgba(32,33,36,.16)]`}>
          {searching ? (
            <p className="px-4 py-5 text-sm text-[#718087]">{text.hint}</p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result.href}
                href={result.href}
                onClick={() => {
                  saveRecentSearch(query || result.title)
                  setOpen(false)
                  setQuery('')
                  onNavigate?.()
                }}
                className="group flex items-center gap-3 rounded-[12px] border border-transparent px-3 py-3 transition hover:border-[#e2e2e2] hover:bg-[#f5f5f3]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#f1f2f2] text-[#62686c] transition group-hover:bg-white group-hover:text-[#202124]">
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
                <ArrowRight className="h-4 w-4 shrink-0 text-[#777d81] transition group-hover:translate-x-0.5" />
              </Link>
            ))
          ) : (
            <p className="px-4 py-5 text-sm text-[#718087]">{text.empty}</p>
          )}
        </div>
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
          className="flex h-12 min-w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 text-[#0866ff] min-[1120px]:hidden"
        >
          <X className="h-[22px] w-[22px]" strokeWidth={1.7} />
          <span className="text-[10px] font-medium leading-none">{text.label}</span>
        </button>
        {createPortal(
          <div
            className="fixed inset-x-0 bottom-0 top-[56px] z-[200] overflow-y-auto bg-black/20 backdrop-blur-[2px] min-[1120px]:hidden"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false)
                setQuery('')
              }
            }}
          >
            <div ref={panelRef} className="border-t border-[#deddd8] bg-[#f7f7f5] px-5 py-5 shadow-[0_24px_60px_rgba(32,33,36,.16)] sm:px-8">
              <div className="mx-auto max-w-2xl">
                <div className="mb-4">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#202124]">
                    {text.title}
                  </p>
                </div>
                {panel}
              </div>
            </div>
          </div>,
          document.body,
        )}
      </>
    )
  }

  if (headerDesktop) {
    return (
      <div className="relative flex h-full">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setQuery('')
          }}
          aria-label="Close search"
          className="flex min-w-[66px] flex-col items-center justify-center bg-[#f7f8f8] px-2 text-[#0866ff]"
        >
          <X className="h-[19px] w-[19px]" strokeWidth={1.7} />
          <span className="text-[10px] font-medium">{text.label}</span>
        </button>
        {createPortal(
          <div
            className="fixed inset-0 z-[190] hidden overflow-y-auto bg-[#0b1220]/52 px-6 py-10 backdrop-blur-[2px] min-[1120px]:block"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false)
                setQuery('')
              }
            }}
          >
            <div className="mx-auto flex min-h-full w-full max-w-[var(--autorell-page-max)] items-start justify-center pt-10">
              <div ref={panelRef} className="max-h-[calc(100dvh-80px)] w-[min(820px,calc(100vw-96px))] overflow-y-auto rounded-[26px] border border-white/70 bg-white shadow-[0_34px_100px_rgba(4,12,28,.35)]">
                <div className="flex h-[76px] items-center gap-4 border-b border-[#edf0f5] px-7">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#eaf1ff] text-[#0866ff]">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        submitBestResult()
                      }
                    }}
                    placeholder={text.placeholder}
                    aria-label={text.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-[#1f2937] outline-none placeholder:text-[#98a2b3]"
                  />
                  <span className="hidden">
                    ⌘ K
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    aria-label="Close search"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#344054] transition hover:bg-[#f2f4f7] hover:text-[#0866ff]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex items-center gap-3 overflow-x-auto border-b border-[#edf0f5] px-5 py-3 text-sm font-semibold text-[#344054]">
                  {desktopTabs.map(({ key, href, icon: Icon }, tabIndex) => (
                    <Link
                      key={key}
                      href={localizePublicHref(locale, href)}
                      onClick={() => {
                        setOpen(false)
                        setQuery('')
                      }}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[12px] px-3 transition hover:bg-[#f2f6ff] hover:text-[#0866ff] ${
                        tabIndex === 0 ? 'bg-[#eaf1ff] text-[#0866ff]' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {desktopText[key]}
                    </Link>
                  ))}
                </nav>

                <div className="grid grid-cols-[1fr_1px_1fr] gap-0 px-7 py-7">
                  <section className="min-w-0 pr-7">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-[#101828]">{desktopText.recent}</h3>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        disabled={recentSearches.length === 0}
                        className="text-xs font-bold text-[#0866ff]"
                      >
                        {desktopText.clear}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {query.trim().length >= 2 ? (
                        searching ? (
                          <p className="rounded-[12px] bg-[#f8fafc] px-3 py-4 text-sm font-medium text-[#667085]">
                            {text.hint}
                          </p>
                        ) : results.length ? (
                          results.slice(0, 6).map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                saveRecentSearch(query || item.title)
                                setOpen(false)
                                setQuery('')
                              }}
                              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] hover:text-[#0866ff]"
                            >
                              <Search className="h-4 w-4 shrink-0 text-[#667085]" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold">{item.title}</span>
                                <span className="mt-0.5 block truncate text-xs font-medium text-[#667085]">
                                  {item.description}
                                </span>
                              </span>
                              <ArrowRight className="h-4 w-4 text-[#98a2b3]" />
                            </Link>
                          ))
                        ) : (
                          <p className="rounded-[12px] bg-[#f8fafc] px-3 py-4 text-sm font-medium text-[#667085]">
                            {text.empty}
                          </p>
                        )
                      ) : (
                        recentSearches.length ? (
                          recentSearches.map((item) => (
                            <div
                              key={item}
                              className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc]"
                            >
                              <button
                                type="button"
                                onClick={() => setQuery(item)}
                                className="flex min-w-0 flex-1 items-center gap-3 text-left transition hover:text-[#0866ff]"
                              >
                                <Search className="h-4 w-4 shrink-0 text-[#667085]" />
                                <span className="min-w-0 flex-1 truncate">{item}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRecentSearch(item)}
                                aria-label="Remove search"
                                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#98a2b3] transition hover:bg-white hover:text-[#344054]"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-[12px] bg-[#f8fafc] px-3 py-4 text-sm font-medium text-[#667085]">
                            {emptyRecentText(language)}
                          </p>
                        )
                      )}
                    </div>
                  </section>

                  <div className="bg-[#edf0f5]" />

                  <section className="min-w-0 pl-7">
                    <h3 className="mb-5 text-sm font-bold text-[#101828]">{desktopText.quick}</h3>
                    <div className="space-y-3">
                      {quickAccess.map(({ key, href, icon: Icon }) => (
                        <Link
                          key={key}
                          href={localizePublicHref(locale, href)}
                          onClick={() => {
                            setOpen(false)
                            setQuery('')
                          }}
                          className="group flex items-center gap-4 rounded-[14px] p-2 transition hover:bg-[#f8fbff]"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf1ff] text-[#0866ff]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <strong className="block text-sm font-bold text-[#101828]">
                              {quickAccessTitle(language, desktopText[key].toString())}
                            </strong>
                            <span className="mt-0.5 block truncate text-xs font-medium text-[#667085]">
                              {quickAccessDescription(language)}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#344054] transition group-hover:translate-x-0.5 group-hover:text-[#0866ff]" />
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="hidden">
                  <span className="text-[#0866ff]">✦</span>
                  <span className="flex-1 text-center">
                    <strong className="text-[#0866ff]">{desktopText.tip}</strong>{' '}
                    <kbd className="rounded-[6px] bg-white px-2 py-1 text-xs font-bold text-[#344054] shadow-sm">⌘</kbd>{' '}
                    <kbd className="rounded-[6px] bg-white px-2 py-1 text-xs font-bold text-[#344054] shadow-sm">K</kbd>{' '}
                    {desktopText.anywhere}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-full z-40 pt-3">
      <div ref={panelRef} className="w-[min(540px,calc(100vw-32px))] rounded-[24px] border border-[#d8e2e5] bg-[linear-gradient(145deg,#f9fbfb,#edf5f7)] p-4 shadow-[0_30px_85px_rgba(28,42,49,.2)]">
        <div className="mb-4 flex items-start justify-between gap-5 px-1">
          <div>
            <p className="text-lg font-semibold tracking-[-0.025em] text-[#202124]">
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

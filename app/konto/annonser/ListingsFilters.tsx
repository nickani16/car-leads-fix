'use client'

import { Filter, RotateCcw, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  accountListingTabs,
  type AccountListingFilters,
  type AccountListingTab,
} from '@/lib/account-listings-management'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'

const tabLabels: Record<AccountListingTab, { sv: string; en: string }> = {
  all: { sv: 'Alla', en: 'All' },
  active: { sv: 'Aktiva', en: 'Active' },
  payment: { sv: 'Väntar på betalning', en: 'Awaiting payment' },
  review: { sv: 'Under granskning', en: 'In review' },
  draft: { sv: 'Utkast', en: 'Drafts' },
  paused: { sv: 'Pausade', en: 'Paused' },
  expired: { sv: 'Utgångna', en: 'Expired' },
  sold: { sv: 'Sålda', en: 'Sold' },
  deleted: { sv: 'Borttagna', en: 'Deleted' },
}

export default function ListingsFilters({
  filters,
  counts,
  categories,
  countries,
  accountType,
  locale,
}: {
  filters: AccountListingFilters
  counts: Record<AccountListingTab, number>
  categories: string[]
  countries: string[]
  accountType: string
  locale: PublicLocale
}) {
  const router = useRouter()
  const pathname = usePathname()
  const currentParams = useSearchParams()
  const [search, setSearch] = useState(filters.query)
  const searchTouched = useRef(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const t = (sv: string, en: string) => locale === 'sv' ? sv : translatePublic(locale, en)

  const update = useCallback((changes: Record<string, string | number | null>) => {
    const params = new URLSearchParams(currentParams.toString())
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') params.delete(key)
      else params.set(key, String(value))
    })
    if (!Object.prototype.hasOwnProperty.call(changes, 'page')) params.delete('page')
    params.delete('choosePackage')
    params.delete('listing')
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ''}`, { scroll: false })
  }, [currentParams, pathname, router])

  useEffect(() => {
    if (!searchTouched.current) return
    const timeout = window.setTimeout(() => update({ query: search || null }), 350)
    return () => window.clearTimeout(timeout)
  }, [search, update])

  function handleTabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? accountListingTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + accountListingTabs.length) % accountListingTabs.length
    const next = accountListingTabs[nextIndex]
    update({ status: next === 'all' ? null : next })
    window.requestAnimationFrame(() => document.getElementById(`listing-tab-${next}`)?.focus())
  }

  const fieldClass = 'h-11 min-w-0 rounded-[12px] border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#344054] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10'

  const filterFields = (
    <>
      <FilterSelect label={t('Kategori', 'Category')} value={filters.category} onChange={(value) => update({ category: value })} className={fieldClass}>
        <option value="all">{t('Alla kategorier', 'All categories')}</option>
        {categories.map((category) => <option key={category} value={category}>{categoryLabel(category, locale)}</option>)}
      </FilterSelect>
      <FilterSelect label={t('Marknad', 'Market')} value={filters.country} onChange={(value) => update({ country: value })} className={fieldClass}>
        <option value="all">{t('Alla marknader', 'All markets')}</option>
        {countries.map((country) => <option key={country} value={country.toLowerCase()}>{country.toUpperCase()}</option>)}
      </FilterSelect>
      <FilterSelect label={t('Paket', 'Package')} value={filters.package} onChange={(value) => update({ package: value })} className={fieldClass}>
        <option value="all">{t('Alla paket', 'All packages')}</option>
        <option value="free_7d">Start · 5</option>
        <option value="standard_15d">Standard · 15</option>
        <option value="premium_30d">Premium · 30</option>
      </FilterSelect>
      <FilterSelect label={t('Marknadsföring', 'Promotion')} value={filters.marketing} onChange={(value) => update({ marketing: value })} className={fieldClass}>
        <option value="all">{t('Alla', 'All')}</option>
        <option value="active">{t('Aktiv marknadsföring', 'Active promotion')}</option>
        <option value="none">{t('Utan marknadsföring', 'Without promotion')}</option>
      </FilterSelect>
      {accountType === 'business' ? <FilterSelect label={t('Säljartyp', 'Seller type')} value={filters.sellerType} onChange={(value) => update({ sellerType: value })} className={fieldClass}>
        <option value="all">{t('Alla säljartyper', 'All seller types')}</option>
        <option value="business">{t('Företag', 'Business')}</option>
        <option value="private">{t('Privat', 'Private')}</option>
      </FilterSelect> : null}
    </>
  )

  return (
    <section className="mt-6" aria-label={t('Filtrera dina annonser', 'Filter your listings')}>
      <div
        role="tablist"
        aria-label={t('Annonsstatus', 'Listing status')}
        className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {accountListingTabs.map((tab, index) => {
          const selected = filters.status === tab
          return (
            <button
              id={`listing-tab-${tab}`}
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="listing-results"
              tabIndex={selected ? 0 : -1}
              onClick={() => update({ status: tab === 'all' ? null : tab })}
              onKeyDown={(event) => handleTabKeys(event, index)}
              className={`min-h-10 shrink-0 snap-start rounded-full border px-4 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-[#0866ff]/20 ${selected ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d8e1ed] bg-white text-[#475467] hover:border-[#9ebcf0] hover:text-[#0866ff]'}`}
            >
              {t(tabLabels[tab].sv, tabLabels[tab].en)} ({counts[tab] || 0})
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-[20px] border border-[#dfe6f1] bg-white p-3 shadow-[0_10px_35px_rgba(16,24,40,.04)] sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t('Sök bland dina annonser', 'Search your listings')}</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                type="search"
                value={search}
                onChange={(event) => { searchTouched.current = true; setSearch(event.target.value) }}
                placeholder={t('Sök bland dina annonser', 'Search your listings')}
                className="h-12 w-full rounded-[14px] border border-[#cbd5e1] bg-white pl-10 pr-10 text-sm outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              />
              {search ? <button type="button" onClick={() => { searchTouched.current = true; setSearch('') }} aria-label={t('Rensa sökning', 'Clear search')} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#667085] hover:bg-[#f2f4f7] focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><X className="h-4 w-4" /></button> : null}
            </span>
          </label>

          <FilterSelect label={t('Sortera', 'Sort')} value={filters.sort} onChange={(value) => update({ sort: value })} className={`${fieldClass} w-full lg:w-[210px]`}>
            <option value="updated_desc">{t('Senast uppdaterad', 'Recently updated')}</option>
            <option value="created_desc">{t('Nyast skapad', 'Newest created')}</option>
            <option value="created_asc">{t('Äldst skapad', 'Oldest created')}</option>
            <option value="price_asc">{t('Pris stigande', 'Price ascending')}</option>
            <option value="price_desc">{t('Pris fallande', 'Price descending')}</option>
            <option value="views_desc">{t('Mest visningar', 'Most viewed')}</option>
            <option value="favorites_desc">{t('Flest favoriter', 'Most favorites')}</option>
            <option value="expires_asc">{t('Snart utgående', 'Expiring soon')}</option>
          </FilterSelect>

          {accountType === 'business' ? <FilterSelect label={t('Per sida', 'Per page')} value={String(filters.pageSize)} onChange={(value) => update({ pageSize: value })} className={`${fieldClass} w-full lg:w-[105px]`}>
            <option value="25">25</option><option value="50">50</option><option value="100">100</option>
          </FilterSelect> : null}

          <button type="button" onClick={() => dialogRef.current?.showModal()} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#cbd5e1] bg-white px-4 text-sm font-semibold text-[#344054] outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20 lg:hidden">
            <Filter className="h-4 w-4" /> {t('Filter', 'Filters')}
          </button>
        </div>

        <div className="mt-4 hidden grid-cols-2 gap-3 border-t border-[#eef2f7] pt-4 lg:grid xl:grid-cols-5">
          {filterFields}
        </div>

        {hasActiveFilters(filters) ? <button type="button" onClick={() => router.push(pathname)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0866ff] outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><RotateCcw className="h-4 w-4" />{t('Rensa sökning och filter', 'Clear search and filters')}</button> : null}
      </div>

      <dialog ref={dialogRef} aria-labelledby="mobile-filter-title" className="m-0 ml-auto h-full max-h-none w-[min(92vw,420px)] max-w-none translate-x-0 bg-white p-0 text-[#101828] shadow-2xl backdrop:bg-[#07152d]/55 open:flex open:flex-col">
        <div className="flex items-center justify-between border-b border-[#e4eaf3] p-5">
          <h2 id="mobile-filter-title" className="text-xl font-semibold">{t('Filtrera annonser', 'Filter listings')}</h2>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('Stäng filter', 'Close filters')} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f4f7] outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-5">{filterFields}</div>
        <div className="border-t border-[#e4eaf3] p-5"><button type="button" onClick={() => dialogRef.current?.close()} className="h-12 w-full rounded-[13px] bg-[#0866ff] text-sm font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/30">{t('Visa resultat', 'Show results')}</button></div>
      </dialog>
    </section>
  )
}

function FilterSelect({ label, value, onChange, className, children }: {
  label: string
  value: string
  onChange: (value: string) => void
  className: string
  children: React.ReactNode
}) {
  return <label className="grid min-w-0 gap-1.5"><span className="text-xs font-medium text-[#667085]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={className}>{children}</select></label>
}

function hasActiveFilters(filters: AccountListingFilters) {
  return Boolean(
    filters.query || filters.status !== 'all' || filters.category !== 'all' ||
    filters.country !== 'all' || filters.package !== 'all' || filters.marketing !== 'all' ||
    filters.sellerType !== 'all' || filters.sort !== 'updated_desc' || filters.pageSize !== 25,
  )
}

function categoryLabel(value: string, locale: PublicLocale) {
  const labels: Record<string, { sv: string; en: string }> = {
    cars: { sv: 'Bilar', en: 'Cars' },
    vans: { sv: 'Transportbilar', en: 'Vans' },
    motorcycles: { sv: 'Motorcyklar', en: 'Motorcycles' },
    motorhomes: { sv: 'Husbilar', en: 'Motorhomes' },
    caravans: { sv: 'Husvagnar', en: 'Caravans' },
    trucks: { sv: 'Lastbilar', en: 'Trucks' },
    agriculture: { sv: 'Lantbruk', en: 'Agriculture' },
    construction: { sv: 'Entreprenad', en: 'Construction' },
    'electric-bikes': { sv: 'Elcyklar', en: 'Electric bikes' },
  }
  const label = labels[value]
  if (!label) return value
  return locale === 'sv' ? label.sv : translatePublic(locale, label.en)
}

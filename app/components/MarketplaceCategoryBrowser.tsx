'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  Globe2,
  Heart,
  ImageIcon,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'

export type MarketplaceListing = {
  id: string
  title: string
  year: string | null
  mileageKm: number | null
  fuelType: string | null
  country: string
  saleFormat: 'auction' | 'marketplace'
  priceLabel: string
  imageAvailable: boolean
}

type CategoryConfig = {
  slug: string
  label: string
  singular: string
  description: string
  filters: readonly string[]
}

export default function MarketplaceCategoryBrowser({
  category,
  listings,
}: {
  category: CategoryConfig
  listings: MarketplaceListing[]
}) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const countries = useMemo(
    () =>
      [...new Set(['SE', ...euBuyerMarkets.map((market) => market.code)])]
        .sort((a, b) => countryName(a).localeCompare(countryName(b), 'sv')),
    [],
  )
  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return listings.filter((listing) => {
      if (country && listing.country !== country) return false
      if (
        normalizedQuery &&
        !listing.title.toLowerCase().includes(normalizedQuery)
      ) {
        return false
      }
      return true
    })
  }, [country, listings, query])

  return (
    <>
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 pb-9 pt-7 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#0866ff]">
                <Globe2 className="h-4 w-4" />
                Autorell Europe
              </span>
              <h1 className="mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">
                {category.label}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
                {category.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/salj-fordon?category=${category.slug}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_10px_26px_rgba(8,102,255,.2)]"
              >
                Sälj {category.singular}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/foretag"
                className="inline-flex min-h-12 items-center justify-center rounded-[15px] border border-[#d0d5dd] bg-white px-6 text-sm font-bold"
              >
                Sälj som företag
              </Link>
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setActiveFilter('')}
              className={`shrink-0 rounded-[15px] border px-5 py-3 text-sm font-semibold transition ${
                !activeFilter
                  ? 'border-[#0866ff] bg-[#0866ff] text-white'
                  : 'border-[#b8c9ff] bg-white text-[#0866ff]'
              }`}
            >
              Alla
            </button>
            {category.filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-[15px] border px-5 py-3 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? 'border-[#0866ff] bg-[#eef4ff] text-[#0866ff]'
                    : 'border-[#b8c9ff] bg-white text-[#0866ff]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 rounded-[22px] border border-[#e4e7ec] bg-[#f8faff] p-3 md:grid-cols-[1fr_260px_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0866ff]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Sök ${category.label.toLowerCase()}`}
                className="marketplace-search-control h-12 w-full rounded-[14px] border border-[#d7deed] bg-white pl-12 pr-4 text-sm outline-none focus:border-[#0866ff]"
              />
            </label>
            <label className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0866ff]" />
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="marketplace-search-control h-12 w-full appearance-none rounded-[14px] border border-[#d7deed] bg-white pl-12 pr-10 text-sm font-semibold outline-none focus:border-[#0866ff]"
              >
                <option value="">Hela Europa</option>
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {countryName(code)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            </label>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#b8c9ff] bg-white px-5 text-sm font-bold text-[#0866ff]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter och sortering
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fb] py-10 sm:py-14">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="mb-6 flex items-center justify-between gap-5">
            <p className="text-sm text-[#475467]">
              <strong className="text-[#101828]">{visibleListings.length}</strong>{' '}
              annonser i {category.label.toLowerCase()}
            </p>
            <button type="button" className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]">
              Spara sökning
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {visibleListings.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleListings.map((listing) => (
                <article
                  key={listing.id}
                  className="group overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_12px_38px_rgba(16,24,40,.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(16,24,40,.1)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)]">
                    <div className="market-blob absolute -right-16 -top-20 h-56 w-56 bg-white/65" />
                    <div className="absolute inset-0 grid place-items-center text-[#0866ff]">
                      <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-white bg-white/75 shadow-sm backdrop-blur">
                        <ImageIcon className="h-7 w-7" />
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Spara annons"
                      className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-[14px] bg-white text-[#0866ff] shadow-md"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-4 left-4 rounded-[10px] bg-white/92 px-3 py-1.5 text-[11px] font-bold text-[#344054] shadow-sm">
                      {listing.saleFormat === 'marketplace' ? 'Fast pris' : 'Auktion'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl tracking-[-0.035em]">{listing.title}</h2>
                    <p className="mt-2 text-sm text-[#667085]">
                      {[listing.year, listing.fuelType, listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#eaecf0] pt-4">
                      <div>
                        <span className="block text-xs text-[#98a2b3]">
                          {countryName(listing.country)}
                        </span>
                        <strong className="mt-1 block">{listing.priceLabel}</strong>
                      </div>
                      <button type="button" className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]">
                        Visa annons
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)] sm:py-20">
              <div className="market-blob absolute -right-24 -top-28 h-80 w-80 bg-[#edf3ff]" />
              <div className="relative">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
                  <Search className="h-6 w-6" />
                </span>
                <h2 className="mt-6 text-2xl tracking-[-0.035em]">
                  Inga publicerade annonser matchar just nu.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                  Marknaden uppdateras löpande. Spara sökningen eller bli först
                  med att publicera {category.singular} i den här kategorin.
                </p>
                <Link
                  href={`/salj-fordon?category=${category.slug}`}
                  className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white"
                >
                  Skapa annons
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-4 text-xs text-[#98a2b3]">
                  Annonser publiceras per objekt med valbart annonspaket.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function countryName(code: string) {
  try {
    return new Intl.DisplayNames(['sv'], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}

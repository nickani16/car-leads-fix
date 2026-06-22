'use client'

import Link from 'next/link'
import { Heart, ImageIcon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { MarketplaceListing } from './MarketplaceCategoryBrowser'
import MessageSellerButton from './MessageSellerButton'
import SavedListingButton from './SavedListingButton'
import {
  readSavedListingIds,
  SAVED_LISTINGS_EVENT,
} from '@/lib/saved-listings'

export default function SavedListingsClient({
  listings,
}: {
  listings: MarketplaceListing[]
}) {
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setSavedIds(readSavedListingIds())
    sync()
    window.addEventListener(SAVED_LISTINGS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SAVED_LISTINGS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const savedListings = useMemo(
    () =>
      savedIds
        .map((id) => listings.find((listing) => listing.id === id))
        .filter(Boolean) as MarketplaceListing[],
    [listings, savedIds],
  )

  return (
    <section className="bg-[#f7f8fb] py-10 sm:py-14">
      <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
        {savedListings.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedListings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_12px_38px_rgba(16,24,40,.06)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)]">
                  <div className="market-blob absolute -right-16 -top-20 h-56 w-56 bg-white/65" />
                  <div className="absolute inset-0 grid place-items-center text-[#0866ff]">
                    <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-white/80">
                      <ImageIcon className="h-7 w-7" />
                    </span>
                  </div>
                  <div className="absolute right-4 top-4">
                    <SavedListingButton listingId={listing.id} />
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl tracking-[-0.035em]">{listing.title}</h2>
                  <p className="mt-2 text-sm text-[#667085]">
                    {[
                      listing.year,
                      listing.fuelType,
                      listing.mileageKm !== null
                        ? `${listing.mileageKm.toLocaleString('sv-SE')} km`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#475467]">
                    {listing.sellerName}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#eaecf0] pt-4">
                    <strong>{listing.priceLabel}</strong>
                    <MessageSellerButton
                      leadId={listing.id}
                      enabled={listing.messagingEnabled}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)]">
            <div className="market-blob absolute -right-24 -top-28 h-80 w-80 bg-[#edf3ff]" />
            <div className="relative">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
                <Heart className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-2xl tracking-[-0.035em]">
                Du har inga sparade annonser ännu.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                Tryck på hjärtat på en annons så samlas dina favoriter här.
              </p>
              <Link
                href="/marketplace/cars#marketplace-search"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white"
              >
                <Search className="h-5 w-5" />
                Sök fordon
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

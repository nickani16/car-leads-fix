'use client'

import Link from 'next/link'
import { Heart, ImageIcon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { MarketplaceListing } from './MarketplaceCategoryBrowser'
import SavedListingButton from './SavedListingButton'
import { FlagIcon } from './PublicFooter'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import {
  SAVED_LISTINGS_EVENT,
  SAVED_LISTINGS_KEY,
} from '@/lib/saved-listings'
import { buildListingPath } from '@/lib/listing-url'
import { formatMileageAsMil } from '@/lib/listing-display'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

export default function SavedListingsClient({
  locale = 'sv',
  marketCode,
}: {
  locale?: PublicLocale
  marketCode?: string
}) {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(true)
  const copy = savedListingsClientCopy(locale)

  useEffect(() => {
    const sync = () => {
      void loadSavedListings()
    }
    window.addEventListener(SAVED_LISTINGS_EVENT, sync)
    window.addEventListener('storage', sync)
    void loadSavedListings()
    return () => {
      window.removeEventListener(SAVED_LISTINGS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }

    async function loadSavedListings() {
      setIsLoading(true)
      const params = new URLSearchParams({ locale })
      if (marketCode) params.set('market', marketCode)
      try {
        const response = await fetch(`/api/saved-listings?${params.toString()}`, {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        })
        if (response.status === 401) {
          setAuthenticated(false)
          setSavedIds([])
          setListings([])
          return
        }
        if (!response.ok) throw new Error('Could not load saved listings')
        const payload = (await response.json()) as { listingIds?: string[]; listings?: MarketplaceListing[] }
        setAuthenticated(true)
        setSavedIds(payload.listingIds || [])
        setListings(payload.listings || [])
        window.localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(payload.listingIds || []))
      } catch {
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }
  }, [locale, marketCode])

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
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_12px_38px_rgba(16,24,40,.04)]"
              >
                <div className="h-64 bg-[#edf3ff]" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 rounded bg-[#eef2f8]" />
                  <div className="h-4 w-1/2 rounded bg-[#eef2f8]" />
                  <div className="h-10 rounded bg-[#eef2f8]" />
                </div>
              </div>
            ))}
          </div>
        ) : !authenticated ? (
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="mt-6 text-2xl tracking-[-0.035em]">{copy.signInTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">
              {copy.signInText}
            </p>
          </div>
        ) : savedListings.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedListings.map((listing) => {
              const detailHref = buildListingPath({
                id: listing.id,
                title: listing.title,
                make: listing.make,
                model: listing.model,
                year: listing.year,
                city: listing.city,
                country_code: listing.country,
              }, locale)
              const sellerLabel = listing.sellerIsTrader ? listing.sellerName : copy.privateSeller

              return (
              <article
                key={listing.id}
                className="relative overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_12px_38px_rgba(16,24,40,.06)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)]">
                  <ListingCardImageCarousel
                    images={listing.imageUrls?.length ? listing.imageUrls : listing.imageUrl ? [listing.imageUrl] : []}
                    title={listing.title}
                    href={detailHref}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    previousLabel={copy.previousImage}
                    nextLabel={copy.nextImage}
                    placeholder={
                      <>
                        <div className="market-blob absolute -right-16 -top-20 h-56 w-56 bg-white/65" />
                        <div className="absolute inset-0 grid place-items-center text-[#0866ff]">
                          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-white/80">
                            <ImageIcon className="h-7 w-7" />
                          </span>
                        </div>
                      </>
                    }
                  />
                  <div className="absolute right-4 top-4">
                    <SavedListingButton listingId={listing.id} />
                  </div>
                </div>
                <div className="p-5">
                  <Link href={detailHref} className="block hover:text-[#0866ff]">
                    <h2 className="text-xl tracking-[-0.035em]">{listing.title}</h2>
                  </Link>
                  <p className="mt-2 text-sm text-[#667085]">
                    {[
                      listing.year,
                      listing.fuelType,
                      listing.mileageKm !== null
                        ? formatMileageAsMil(listing.mileageKm, locale)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                  <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#475467]">
                      {sellerLabel}
                    </p>
                    <FlagIcon code={(listing.country || 'EU').toUpperCase()} size="sm" />
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#eaecf0] pt-4">
                    <strong>{listing.priceLabel}</strong>
                    <Link href={detailHref} className="text-sm font-bold text-[#0866ff]">
                      {copy.viewListing}
                    </Link>
                  </div>
                </div>
              </article>
              )
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)]">
            <div className="market-blob absolute -right-24 -top-28 h-80 w-80 bg-[#edf3ff]" />
            <div className="relative">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
                <Heart className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-2xl tracking-[-0.035em]">
                {copy.emptyTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                {copy.emptyText}
              </p>
              <Link
                href={localizePublicHref(locale, '/marketplace')}
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white"
              >
                <Search className="h-5 w-5" />
                {copy.searchVehicles}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function savedListingsClientCopy(locale: PublicLocale) {
  const en = {
    signInTitle: 'Sign in to view saved listings.',
    signInText: 'Saved listings are connected to your account so they stay available across devices.',
    emptyTitle: 'You do not have any saved listings yet.',
    emptyText: 'Tap the heart on a listing and your favourites will be collected here.',
    searchVehicles: 'Search vehicles',
    viewListing: 'View listing',
    privateSeller: 'Private',
    previousImage: 'Previous image',
    nextImage: 'Next image',
  }

  const copy: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      signInTitle: 'Logga in för sparade annonser.',
      signInText: 'Sparade annonser är kopplade till ditt konto så att de finns kvar mellan enheter.',
      emptyTitle: 'Du har inga sparade annonser ännu.',
      emptyText: 'Tryck på hjärtat på en annons så samlas dina favoriter här.',
      searchVehicles: 'Sök fordon',
      viewListing: 'Visa annons',
      privateSeller: 'Privat',
      previousImage: 'Föregående bild',
      nextImage: 'Nästa bild',
    },
    de: {
      signInTitle: 'Melden Sie sich an, um gespeicherte Anzeigen zu sehen.',
      signInText: 'Gespeicherte Anzeigen sind mit Ihrem Konto verbunden und bleiben auf allen Geräten verfügbar.',
      emptyTitle: 'Sie haben noch keine Anzeigen gespeichert.',
      emptyText: 'Tippen Sie bei einer Anzeige auf das Herz, dann sammeln wir Ihre Favoriten hier.',
      searchVehicles: 'Fahrzeuge suchen',
      viewListing: 'Anzeige ansehen',
      privateSeller: 'Privat',
      previousImage: 'Vorheriges Bild',
      nextImage: 'Nächstes Bild',
    },
    at: {
      signInTitle: 'Melden Sie sich an, um gespeicherte Anzeigen zu sehen.',
      signInText: 'Gespeicherte Anzeigen sind mit Ihrem Konto verbunden und bleiben auf allen Geräten verfügbar.',
      emptyTitle: 'Sie haben noch keine Anzeigen gespeichert.',
      emptyText: 'Tippen Sie bei einer Anzeige auf das Herz, dann sammeln wir Ihre Favoriten hier.',
      searchVehicles: 'Fahrzeuge suchen',
      viewListing: 'Anzeige ansehen',
      privateSeller: 'Privat',
      previousImage: 'Vorheriges Bild',
      nextImage: 'Nächstes Bild',
    },
    be: {
      signInTitle: 'Meld u aan om opgeslagen advertenties te bekijken.',
      signInText: 'Opgeslagen advertenties zijn gekoppeld aan uw account en blijven beschikbaar op al uw apparaten.',
      emptyTitle: 'U hebt nog geen advertenties opgeslagen.',
      emptyText: 'Tik op het hart bij een advertentie en uw favorieten worden hier verzameld.',
      searchVehicles: 'Voertuigen zoeken',
      viewListing: 'Advertentie bekijken',
      privateSeller: 'Particulier',
      previousImage: 'Vorige afbeelding',
      nextImage: 'Volgende afbeelding',
    },
    fr: {
      signInTitle: 'Connectez-vous pour voir vos annonces enregistrées.',
      signInText: 'Les annonces enregistrées sont liées à votre compte et restent disponibles sur tous vos appareils.',
      emptyTitle: 'Vous n’avez pas encore enregistré d’annonce.',
      emptyText: 'Touchez le coeur sur une annonce et vos favoris seront rassemblés ici.',
      searchVehicles: 'Rechercher des véhicules',
      viewListing: 'Voir l’annonce',
      privateSeller: 'Particulier',
      previousImage: 'Image précédente',
      nextImage: 'Image suivante',
    },
    es: {
      signInTitle: 'Inicia sesión para ver anuncios guardados.',
      signInText: 'Los anuncios guardados están vinculados a tu cuenta y quedan disponibles en todos tus dispositivos.',
      emptyTitle: 'Todavía no tienes anuncios guardados.',
      emptyText: 'Pulsa el corazón en un anuncio y tus favoritos se reunirán aquí.',
      searchVehicles: 'Buscar vehículos',
      viewListing: 'Ver anuncio',
      privateSeller: 'Particular',
      previousImage: 'Imagen anterior',
      nextImage: 'Imagen siguiente',
    },
    it: {
      signInTitle: 'Accedi per vedere gli annunci salvati.',
      signInText: 'Gli annunci salvati sono collegati al tuo account e restano disponibili su tutti i dispositivi.',
      emptyTitle: 'Non hai ancora annunci salvati.',
      emptyText: 'Tocca il cuore su un annuncio e i tuoi preferiti saranno raccolti qui.',
      searchVehicles: 'Cerca veicoli',
      viewListing: 'Vedi annuncio',
      privateSeller: 'Privato',
      previousImage: 'Immagine precedente',
      nextImage: 'Immagine successiva',
    },
    pl: {
      signInTitle: 'Zaloguj się, aby zobaczyć zapisane ogłoszenia.',
      signInText: 'Zapisane ogłoszenia są powiązane z Twoim kontem i dostępne na wszystkich urządzeniach.',
      emptyTitle: 'Nie masz jeszcze zapisanych ogłoszeń.',
      emptyText: 'Kliknij serce przy ogłoszeniu, a ulubione pojazdy pojawią się tutaj.',
      searchVehicles: 'Szukaj pojazdów',
      viewListing: 'Zobacz ogłoszenie',
      privateSeller: 'Prywatny',
      previousImage: 'Poprzednie zdjęcie',
      nextImage: 'Następne zdjęcie',
    },
    nl: {
      signInTitle: 'Meld u aan om opgeslagen advertenties te bekijken.',
      signInText: 'Opgeslagen advertenties zijn gekoppeld aan uw account en blijven beschikbaar op al uw apparaten.',
      emptyTitle: 'U hebt nog geen advertenties opgeslagen.',
      emptyText: 'Tik op het hart bij een advertentie en uw favorieten worden hier verzameld.',
      searchVehicles: 'Voertuigen zoeken',
      viewListing: 'Advertentie bekijken',
      privateSeller: 'Particulier',
      previousImage: 'Vorige afbeelding',
      nextImage: 'Volgende afbeelding',
    },
    fi: {
      signInTitle: 'Kirjaudu sisään nähdäksesi tallennetut ilmoitukset.',
      signInText: 'Tallennetut ilmoitukset on liitetty tiliisi ja ne pysyvät käytettävissä kaikilla laitteilla.',
      emptyTitle: 'Sinulla ei ole vielä tallennettuja ilmoituksia.',
      emptyText: 'Napauta ilmoituksen sydäntä, niin suosikkisi kerätään tänne.',
      searchVehicles: 'Etsi ajoneuvoja',
      viewListing: 'Näytä ilmoitus',
      privateSeller: 'Yksityinen',
      previousImage: 'Edellinen kuva',
      nextImage: 'Seuraava kuva',
    },
    da: {
      signInTitle: 'Log ind for at se gemte annoncer.',
      signInText: 'Gemte annoncer er knyttet til din konto og er tilgængelige på tværs af enheder.',
      emptyTitle: 'Du har ingen gemte annoncer endnu.',
      emptyText: 'Tryk på hjertet på en annonce, så samles dine favoritter her.',
      searchVehicles: 'Søg køretøjer',
      viewListing: 'Vis annonce',
      privateSeller: 'Privat',
      previousImage: 'Forrige billede',
      nextImage: 'Næste billede',
    },
  }

  return copy[locale] || en
}

'use client'

import Link from 'next/link'
import { Heart, ImageIcon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { MarketplaceListing } from './MarketplaceCategoryBrowser'
import SavedListingButton from './SavedListingButton'
import { FlagIcon } from './PublicFooter'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import {
  readSavedListingIds,
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
      const localIds = readSavedListingIds()
      const params = new URLSearchParams({ locale })
      if (marketCode) params.set('market', marketCode)
      if (localIds.length) params.set('ids', localIds.join(','))
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
          setSavedIds(localIds)
          setListings([])
          return
        }
        if (!response.ok) throw new Error('Could not load saved listings')
        const payload = (await response.json()) as { authenticated?: boolean; listingIds?: string[]; listings?: MarketplaceListing[] }
        setAuthenticated(Boolean(payload.authenticated))
        setSavedIds(payload.listingIds || [])
        setListings(payload.listings || [])
        if (payload.authenticated) {
          window.localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(payload.listingIds || []))
        }
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
        ) : savedListings.length ? (
          <>
            {!authenticated ? <GuestAccountPrompt copy={copy} locale={locale} /> : null}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                  <SavedListingCard
                    key={listing.id}
                    listing={listing}
                    detailHref={detailHref}
                    sellerLabel={sellerLabel}
                    copy={copy}
                    locale={locale}
                  />
                )
              })}
            </div>
          </>
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
                {authenticated ? copy.emptyText : copy.guestEmptyText}
              </p>
              {!authenticated ? <GuestAccountPrompt copy={copy} locale={locale} compact /> : null}
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

type SavedListingsCopy = ReturnType<typeof savedListingsClientCopy>

function GuestAccountPrompt({
  copy,
  locale,
  compact = false,
}: {
  copy: SavedListingsCopy
  locale: PublicLocale
  compact?: boolean
}) {
  return (
    <div className={`${compact ? 'mx-auto mt-7 max-w-2xl' : ''} rounded-[18px] border border-[#d7e4f6] bg-white p-5 text-left shadow-[0_12px_32px_rgba(16,24,40,.05)]`}>
      <p className="text-sm font-bold text-[#101828]">{copy.guestTitle}</p>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.guestText}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={localizePublicHref(locale, '/register')} className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-5 text-sm font-bold text-white">
          {copy.createAccount}
        </Link>
        <Link href={localizePublicHref(locale, '/login')} className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#d0d5dd] bg-white px-5 text-sm font-bold text-[#101828]">
          {copy.signIn}
        </Link>
      </div>
    </div>
  )
}

function SavedListingCard({
  listing,
  detailHref,
  sellerLabel,
  copy,
  locale,
}: {
  listing: MarketplaceListing
  detailHref: string
  sellerLabel: string
  copy: SavedListingsCopy
  locale: PublicLocale
}) {
  return (
    <article className="relative overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_12px_38px_rgba(16,24,40,.06)]">
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
          <p className="text-xs font-semibold text-[#475467]">{sellerLabel}</p>
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
}

function savedListingsClientCopy(locale: PublicLocale) {
  const en = {
    signInTitle: 'Sign in to view saved listings.',
    signInText: 'Saved listings are connected to your account so they stay available across devices.',
    emptyTitle: 'You do not have any saved listings yet.',
    emptyText: 'Tap the heart on a listing and your favourites will be collected here.',
    guestEmptyText: 'Tap the heart on a listing and it will be saved in this browser. If browser data is cleared, the list disappears.',
    guestTitle: 'Saved on this device',
    guestText: 'You can save listings without an account. Create an account to keep them across devices and get messages, saved searches and alerts.',
    createAccount: 'Create account',
    signIn: 'Sign in',
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
      guestEmptyText: 'Tryck på hjärtat på en annons så sparas den i den här webbläsaren. Om cookies eller webbläsardata rensas försvinner listan.',
      guestTitle: 'Sparat på den här enheten',
      guestText: 'Du kan spara annonser utan konto. Skapa konto för att behålla dem mellan enheter och få meddelanden, sparade sökningar och bevakningar.',
      createAccount: 'Skapa konto',
      signIn: 'Logga in',
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
      guestEmptyText: 'Tippen Sie bei einer Anzeige auf das Herz. Sie wird in diesem Browser gespeichert und verschwindet, wenn Browserdaten gelöscht werden.',
      guestTitle: 'Auf diesem Gerät gespeichert',
      guestText: 'Sie können Anzeigen ohne Konto speichern. Mit einem Konto bleiben sie geräteübergreifend erhalten, inklusive Nachrichten, gespeicherten Suchen und Benachrichtigungen.',
      createAccount: 'Konto erstellen',
      signIn: 'Einloggen',
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
      guestEmptyText: 'Tippen Sie bei einer Anzeige auf das Herz. Sie wird in diesem Browser gespeichert und verschwindet, wenn Browserdaten gelöscht werden.',
      guestTitle: 'Auf diesem Gerät gespeichert',
      guestText: 'Sie können Anzeigen ohne Konto speichern. Mit einem Konto bleiben sie geräteübergreifend erhalten, inklusive Nachrichten, gespeicherten Suchen und Benachrichtigungen.',
      createAccount: 'Konto erstellen',
      signIn: 'Einloggen',
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
      guestEmptyText: 'Tik op het hart bij een advertentie. Deze wordt in deze browser opgeslagen en verdwijnt als browsergegevens worden gewist.',
      guestTitle: 'Op dit apparaat opgeslagen',
      guestText: 'U kunt advertenties zonder account opslaan. Maak een account om ze op al uw apparaten te bewaren en berichten, zoekopdrachten en meldingen te gebruiken.',
      createAccount: 'Account maken',
      signIn: 'Inloggen',
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
      guestEmptyText: 'Touchez le coeur sur une annonce. Elle sera enregistrée dans ce navigateur et disparaîtra si les données du navigateur sont effacées.',
      guestTitle: 'Enregistré sur cet appareil',
      guestText: 'Vous pouvez enregistrer des annonces sans compte. Créez un compte pour les conserver sur tous vos appareils et accéder aux messages, recherches enregistrées et alertes.',
      createAccount: 'Créer un compte',
      signIn: 'Se connecter',
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
      guestEmptyText: 'Pulsa el corazón en un anuncio. Se guardará en este navegador y desaparecerá si se borran los datos del navegador.',
      guestTitle: 'Guardado en este dispositivo',
      guestText: 'Puedes guardar anuncios sin cuenta. Crea una cuenta para conservarlos entre dispositivos y usar mensajes, búsquedas guardadas y alertas.',
      createAccount: 'Crear cuenta',
      signIn: 'Iniciar sesión',
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
      guestEmptyText: 'Tocca il cuore su un annuncio. Verrà salvato in questo browser e sparirà se cancelli i dati del browser.',
      guestTitle: 'Salvato su questo dispositivo',
      guestText: 'Puoi salvare annunci senza account. Crea un account per conservarli su più dispositivi e usare messaggi, ricerche salvate e avvisi.',
      createAccount: 'Crea account',
      signIn: 'Accedi',
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
      guestEmptyText: 'Kliknij serce przy ogłoszeniu. Zostanie zapisane w tej przeglądarce i zniknie po wyczyszczeniu danych przeglądarki.',
      guestTitle: 'Zapisane na tym urządzeniu',
      guestText: 'Możesz zapisywać ogłoszenia bez konta. Utwórz konto, aby zachować je na urządzeniach oraz korzystać z wiadomości, zapisanych wyszukiwań i alertów.',
      createAccount: 'Utwórz konto',
      signIn: 'Zaloguj się',
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
      guestEmptyText: 'Tik op het hart bij een advertentie. Deze wordt in deze browser opgeslagen en verdwijnt als browsergegevens worden gewist.',
      guestTitle: 'Op dit apparaat opgeslagen',
      guestText: 'U kunt advertenties zonder account opslaan. Maak een account om ze op al uw apparaten te bewaren en berichten, zoekopdrachten en meldingen te gebruiken.',
      createAccount: 'Account maken',
      signIn: 'Inloggen',
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
      guestEmptyText: 'Napauta ilmoituksen sydäntä. Se tallennetaan tähän selaimeen ja poistuu, jos selaintiedot tyhjennetään.',
      guestTitle: 'Tallennettu tähän laitteeseen',
      guestText: 'Voit tallentaa ilmoituksia ilman tiliä. Luo tili, jotta ne säilyvät eri laitteilla ja saat viestit, tallennetut haut ja ilmoitukset.',
      createAccount: 'Luo tili',
      signIn: 'Kirjaudu sisään',
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
      guestEmptyText: 'Tryk på hjertet på en annonce. Den gemmes i denne browser og forsvinder, hvis browserdata slettes.',
      guestTitle: 'Gemt på denne enhed',
      guestText: 'Du kan gemme annoncer uden konto. Opret en konto for at beholde dem på tværs af enheder og få beskeder, gemte søgninger og notifikationer.',
      createAccount: 'Opret konto',
      signIn: 'Log ind',
      searchVehicles: 'Søg køretøjer',
      viewListing: 'Vis annonce',
      privateSeller: 'Privat',
      previousImage: 'Forrige billede',
      nextImage: 'Næste billede',
    },
  }

  return copy[locale] || en
}

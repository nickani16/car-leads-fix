'use client'

import { useEffect, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'

type Copy = {
  title: string
  text: string
  allow: string
  decline: string
  unavailable: string
}

const copyByLocale: Record<PublicLocale, Copy> = {
  sv: {
    title: 'Visa relevanta annonser nära dig?',
    text: 'Autorell kan använda din ungefärliga placering för att lyfta fordon i din kommun och närliggande områden när utbudet växer.',
    allow: 'Dela placering',
    decline: 'Inte nu',
    unavailable: 'Platsdelning stöds inte i din webbläsare.',
  },
  en: {
    title: 'Show relevant listings near you?',
    text: 'Autorell can use your approximate location to highlight vehicles in your area and nearby places as the marketplace grows.',
    allow: 'Share location',
    decline: 'Not now',
    unavailable: 'Location sharing is not supported in your browser.',
  },
  de: {
    title: 'Relevante Anzeigen in Ihrer Nähe anzeigen?',
    text: 'Autorell kann Ihren ungefähren Standort nutzen, um Fahrzeuge in Ihrer Region und Umgebung hervorzuheben, wenn das Angebot wächst.',
    allow: 'Standort teilen',
    decline: 'Nicht jetzt',
    unavailable: 'Standortfreigabe wird in Ihrem Browser nicht unterstützt.',
  },
  at: {
    title: 'Relevante Anzeigen in Ihrer Nähe anzeigen?',
    text: 'Autorell kann Ihren ungefähren Standort nutzen, um Fahrzeuge in Ihrer Region und Umgebung hervorzuheben, wenn das Angebot wächst.',
    allow: 'Standort teilen',
    decline: 'Nicht jetzt',
    unavailable: 'Standortfreigabe wird in Ihrem Browser nicht unterstützt.',
  },
  be: {
    title: 'Relevante advertenties in uw buurt tonen?',
    text: 'Autorell kan uw geschatte locatie gebruiken om voertuigen in uw gemeente en nabijgelegen plaatsen te tonen wanneer het aanbod groeit.',
    allow: 'Locatie delen',
    decline: 'Niet nu',
    unavailable: 'Locatie delen wordt niet ondersteund door uw browser.',
  },
  fr: {
    title: 'Afficher des annonces pertinentes près de vous ?',
    text: 'Autorell peut utiliser votre position approximative pour mettre en avant des véhicules dans votre commune et les zones proches lorsque l’offre augmente.',
    allow: 'Partager ma position',
    decline: 'Pas maintenant',
    unavailable: 'Le partage de position n’est pas pris en charge par votre navigateur.',
  },
  es: {
    title: '¿Mostrar anuncios relevantes cerca de ti?',
    text: 'Autorell puede usar tu ubicación aproximada para destacar vehículos en tu municipio y zonas cercanas a medida que crece la oferta.',
    allow: 'Compartir ubicación',
    decline: 'Ahora no',
    unavailable: 'Tu navegador no admite compartir ubicación.',
  },
  it: {
    title: 'Mostrare annunci pertinenti vicino a te?',
    text: 'Autorell può usare la tua posizione approssimativa per evidenziare veicoli nel tuo comune e nelle zone vicine quando l’offerta cresce.',
    allow: 'Condividi posizione',
    decline: 'Non ora',
    unavailable: 'La condivisione della posizione non è supportata dal browser.',
  },
  pl: {
    title: 'Pokazywać trafne ogłoszenia w pobliżu?',
    text: 'Autorell może użyć Twojej przybliżonej lokalizacji, aby wyróżniać pojazdy w Twojej gminie i okolicy, gdy liczba ogłoszeń wzrośnie.',
    allow: 'Udostępnij lokalizację',
    decline: 'Nie teraz',
    unavailable: 'Twoja przeglądarka nie obsługuje udostępniania lokalizacji.',
  },
  nl: {
    title: 'Relevante advertenties in de buurt tonen?',
    text: 'Autorell kan je geschatte locatie gebruiken om voertuigen in je gemeente en nabije omgeving te tonen zodra het aanbod groeit.',
    allow: 'Locatie delen',
    decline: 'Niet nu',
    unavailable: 'Locatie delen wordt niet ondersteund door je browser.',
  },
  fi: {
    title: 'Näytetäänkö osuvia ilmoituksia lähelläsi?',
    text: 'Autorell voi käyttää likimääräistä sijaintiasi korostaakseen ajoneuvoja kunnassasi ja lähialueilla tarjonnan kasvaessa.',
    allow: 'Jaa sijainti',
    decline: 'Ei nyt',
    unavailable: 'Sijainnin jakamista ei tueta selaimessasi.',
  },
  da: {
    title: 'Vis relevante annoncer tæt på dig?',
    text: 'Autorell kan bruge din omtrentlige placering til at fremhæve køretøjer i din kommune og nærområdet, når udvalget vokser.',
    allow: 'Del placering',
    decline: 'Ikke nu',
    unavailable: 'Placeringsdeling understøttes ikke i din browser.',
  },
}

const storageKey = 'autorell.location-consent.v1'
const positionStorageKey = 'autorell.location-position.v1'

export default function HomeLocationConsentPrompt({ locale }: { locale: PublicLocale }) {
  const copy = copyByLocale[locale] || copyByLocale.en
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey)) return
    } catch {
      return
    }
    const timer = window.setTimeout(() => setVisible(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  function close(value: 'accepted' | 'declined') {
    try {
      window.localStorage.setItem(storageKey, value)
    } catch {
      // Ignore storage failures; the prompt simply may reappear in strict browser modes.
    }
    setVisible(false)
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setMessage(copy.unavailable)
      close('declined')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          window.localStorage.setItem(
            positionStorageKey,
            JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              savedAt: new Date().toISOString(),
            }),
          )
        } catch {
          // The browser permission is still the source of truth if storage is unavailable.
        }
        close('accepted')
      },
      () => close('declined'),
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60 * 24, timeout: 8000 },
    )
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-[420px] rounded-[18px] border border-[#d9e2ef] bg-white/95 p-4 text-[#101828] shadow-[0_18px_50px_rgba(16,24,40,.18)] backdrop-blur sm:bottom-6">
      <button
        type="button"
        onClick={() => close('declined')}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
        aria-label={copy.decline}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-8">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef6ff] text-[#0866ff]">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold leading-5">{copy.title}</h2>
          <p className="mt-1 text-[13px] font-normal leading-5 text-[#526070]">{copy.text}</p>
          {message ? <p className="mt-2 text-[12px] text-[#667085]">{message}</p> : null}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => close('declined')}
          className="h-10 rounded-full border border-[#cfd7e6] bg-white px-4 text-sm font-medium text-[#101828]"
        >
          {copy.decline}
        </button>
        <button
          type="button"
          onClick={requestLocation}
          className="h-10 rounded-full bg-[#0866ff] px-4 text-sm font-semibold text-white"
        >
          {copy.allow}
        </button>
      </div>
    </div>
  )
}
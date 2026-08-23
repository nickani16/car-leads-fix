import SavedListingsClient from '@/app/components/SavedListingsClient'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { headers } from 'next/headers'
import { getRequestLocale } from '@/lib/request-locale'
import { type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-listings')

export default async function SavedListingsPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const copy = savedListingsPageCopy(locale)

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
            {copy.intro}
          </p>
        </div>
      </section>
      <SavedListingsClient locale={locale} marketCode={marketCode} />
      <PublicFooter locale={locale} />
    </main>
  )
}

function savedListingsPageCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Your watchlist',
    title: 'Saved listings',
    intro: 'Keep interesting vehicles in one place and contact the seller when you are ready.',
  }

  const copy: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      eyebrow: 'Din bevakningslista',
      title: 'Sparade annonser',
      intro: 'Samla intressanta fordon på ett ställe och kontakta säljaren när du är redo.',
    },
    de: {
      eyebrow: 'Ihre Merkliste',
      title: 'Gespeicherte Anzeigen',
      intro: 'Sammeln Sie interessante Fahrzeuge an einem Ort und kontaktieren Sie den Verkäufer, wenn Sie bereit sind.',
    },
    at: {
      eyebrow: 'Ihre Merkliste',
      title: 'Gespeicherte Anzeigen',
      intro: 'Sammeln Sie interessante Fahrzeuge an einem Ort und kontaktieren Sie den Verkäufer, wenn Sie bereit sind.',
    },
    be: {
      eyebrow: 'Uw volglijst',
      title: 'Opgeslagen advertenties',
      intro: 'Bewaar interessante voertuigen op één plek en neem contact op met de verkoper wanneer u klaar bent.',
    },
    fr: {
      eyebrow: 'Votre liste de suivi',
      title: 'Annonces enregistrées',
      intro: 'Gardez les véhicules intéressants au même endroit et contactez le vendeur lorsque vous êtes prêt.',
    },
    es: {
      eyebrow: 'Tu lista de seguimiento',
      title: 'Anuncios guardados',
      intro: 'Guarda vehículos interesantes en un solo lugar y contacta con el vendedor cuando estés listo.',
    },
    it: {
      eyebrow: 'La tua lista',
      title: 'Annunci salvati',
      intro: 'Tieni i veicoli interessanti in un unico posto e contatta il venditore quando sei pronto.',
    },
    pl: {
      eyebrow: 'Twoja lista obserwowanych',
      title: 'Zapisane ogłoszenia',
      intro: 'Zachowaj interesujące pojazdy w jednym miejscu i skontaktuj się ze sprzedawcą, gdy będziesz gotowy.',
    },
    nl: {
      eyebrow: 'Uw volglijst',
      title: 'Opgeslagen advertenties',
      intro: 'Bewaar interessante voertuigen op één plek en neem contact op met de verkoper wanneer u klaar bent.',
    },
    fi: {
      eyebrow: 'Seurantalistasi',
      title: 'Tallennetut ilmoitukset',
      intro: 'Säilytä kiinnostavat ajoneuvot yhdessä paikassa ja ota yhteyttä myyjään, kun olet valmis.',
    },
    da: {
      eyebrow: 'Din overvågningsliste',
      title: 'Gemte annoncer',
      intro: 'Saml interessante køretøjer ét sted, og kontakt sælgeren, når du er klar.',
    },
  }

  return copy[locale] || en
}

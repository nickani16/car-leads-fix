import SavedListingsClient from '@/app/components/SavedListingsClient'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'
import { AccountBreadcrumbs } from '@/app/account/AccountBreadcrumbs'

export const generateMetadata = generateAccountMetadata('saved-listings')

export default async function AccountSavedListingsPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const copy = savedListingsCopy(locale)
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
          <AccountBreadcrumbs
            locale={locale}
            items={[{ key: 'account', href: '/account' }, { key: 'savedListings' }]}
            className="mb-5"
          />
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
    </main>
  )
}

function savedListingsCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Your watchlist',
    title: 'Saved listings',
    intro: 'Keep interesting vehicles in one place and return when you are ready to contact the seller.',
  }

  const copy: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      eyebrow: 'Din bevakningslista',
      title: 'Sparade annonser',
      intro: 'Samla intressanta fordon på ett ställe och återvänd när du är redo att kontakta säljaren.',
    },
    de: {
      eyebrow: 'Ihre Merkliste',
      title: 'Gespeicherte Anzeigen',
      intro: 'Sammeln Sie interessante Fahrzeuge an einem Ort und kehren Sie zurück, wenn Sie den Verkäufer kontaktieren möchten.',
    },
    at: {
      eyebrow: 'Ihre Merkliste',
      title: 'Gespeicherte Anzeigen',
      intro: 'Sammeln Sie interessante Fahrzeuge an einem Ort und kehren Sie zurück, wenn Sie den Verkäufer kontaktieren möchten.',
    },
    be: {
      eyebrow: 'Uw volglijst',
      title: 'Opgeslagen advertenties',
      intro: 'Bewaar interessante voertuigen op één plek en kom terug wanneer u de verkoper wilt contacteren.',
    },
    fr: {
      eyebrow: 'Votre liste de suivi',
      title: 'Annonces enregistrées',
      intro: 'Gardez les véhicules intéressants au même endroit et revenez lorsque vous êtes prêt à contacter le vendeur.',
    },
    es: {
      eyebrow: 'Tu lista de seguimiento',
      title: 'Anuncios guardados',
      intro: 'Guarda vehículos interesantes en un solo lugar y vuelve cuando estés listo para contactar con el vendedor.',
    },
    it: {
      eyebrow: 'La tua lista',
      title: 'Annunci salvati',
      intro: 'Tieni i veicoli interessanti in un unico posto e torna quando sei pronto a contattare il venditore.',
    },
    pl: {
      eyebrow: 'Twoja lista obserwowanych',
      title: 'Zapisane ogłoszenia',
      intro: 'Zachowaj interesujące pojazdy w jednym miejscu i wróć, gdy będziesz gotowy skontaktować się ze sprzedawcą.',
    },
    nl: {
      eyebrow: 'Uw volglijst',
      title: 'Opgeslagen advertenties',
      intro: 'Bewaar interessante voertuigen op één plek en kom terug wanneer u de verkoper wilt contacteren.',
    },
    fi: {
      eyebrow: 'Seurantalistasi',
      title: 'Tallennetut ilmoitukset',
      intro: 'Pidä kiinnostavat ajoneuvot yhdessä paikassa ja palaa, kun olet valmis ottamaan yhteyttä myyjään.',
    },
    da: {
      eyebrow: 'Din overvågningsliste',
      title: 'Gemte annoncer',
      intro: 'Saml interessante køretøjer ét sted, og vend tilbage, når du er klar til at kontakte sælgeren.',
    },
  }

  return copy[locale] || en
}

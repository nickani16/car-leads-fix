import SavedSearchesClient from '@/app/components/SavedSearchesClient'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-searches')

export default async function SavedSearchesPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))
  const copy = savedSearchesPageCopy(locale)

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
      <SavedSearchesClient locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}

function savedSearchesPageCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Saved filters',
    title: 'Saved searches',
    intro: 'Save combinations of market, vehicle type, price and technical filters so you can quickly continue monitoring the same selection.',
  }

  const copy: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      eyebrow: 'Dina filter',
      title: 'Sparade sökningar',
      intro: 'Spara kombinationer av marknad, fordonstyp, pris och tekniska filter så att du snabbt kan fortsätta bevaka samma urval.',
    },
    de: {
      eyebrow: 'Gespeicherte Filter',
      title: 'Gespeicherte Suchen',
      intro: 'Speichern Sie Kombinationen aus Markt, Fahrzeugtyp, Preis und technischen Filtern, damit Sie dieselbe Auswahl schnell weiter beobachten können.',
    },
    at: {
      eyebrow: 'Gespeicherte Filter',
      title: 'Gespeicherte Suchen',
      intro: 'Speichern Sie Kombinationen aus Markt, Fahrzeugtyp, Preis und technischen Filtern, damit Sie dieselbe Auswahl schnell weiter beobachten können.',
    },
    be: {
      eyebrow: 'Opgeslagen filters',
      title: 'Opgeslagen zoekopdrachten',
      intro: 'Sla combinaties van markt, voertuigtype, prijs en technische filters op zodat u dezelfde selectie snel kunt blijven volgen.',
    },
    fr: {
      eyebrow: 'Filtres enregistrés',
      title: 'Recherches enregistrées',
      intro: 'Enregistrez des combinaisons de marché, type de véhicule, prix et filtres techniques pour suivre rapidement la même sélection.',
    },
    es: {
      eyebrow: 'Filtros guardados',
      title: 'Búsquedas guardadas',
      intro: 'Guarda combinaciones de mercado, tipo de vehículo, precio y filtros técnicos para seguir rápidamente la misma selección.',
    },
    it: {
      eyebrow: 'Filtri salvati',
      title: 'Ricerche salvate',
      intro: 'Salva combinazioni di mercato, tipo di veicolo, prezzo e filtri tecnici per continuare a monitorare rapidamente la stessa selezione.',
    },
    pl: {
      eyebrow: 'Zapisane filtry',
      title: 'Zapisane wyszukiwania',
      intro: 'Zapisuj kombinacje rynku, typu pojazdu, ceny i filtrów technicznych, aby szybko wrócić do tej samej selekcji.',
    },
    nl: {
      eyebrow: 'Opgeslagen filters',
      title: 'Opgeslagen zoekopdrachten',
      intro: 'Sla combinaties van markt, voertuigtype, prijs en technische filters op zodat u dezelfde selectie snel kunt blijven volgen.',
    },
    fi: {
      eyebrow: 'Tallennetut suodattimet',
      title: 'Tallennetut haut',
      intro: 'Tallenna markkinan, ajoneuvotyypin, hinnan ja teknisten suodattimien yhdistelmiä, jotta voit jatkaa saman valikoiman seuraamista nopeasti.',
    },
    da: {
      eyebrow: 'Gemte filtre',
      title: 'Gemte søgninger',
      intro: 'Gem kombinationer af marked, køretøjstype, pris og tekniske filtre, så du hurtigt kan fortsætte med at følge samme udvalg.',
    },
  }

  return copy[locale] || en
}

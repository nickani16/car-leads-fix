import SavedSearchesClient from '@/app/components/SavedSearchesClient'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-searches')

export default async function AccountSavedSearchesPage() {
  const locale = await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const copy = savedSearchesCopy(locale)
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
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
    </main>
  )
}

function savedSearchesCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Saved filters',
    title: 'Saved searches',
    intro: 'Return to the same market, category, price and vehicle filters without starting from scratch.',
  }

  const copy: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      eyebrow: 'Sparade filter',
      title: 'Sparade sökningar',
      intro: 'Återvänd till samma marknad, kategori, pris och fordonsfilter utan att börja om.',
    },
    de: {
      eyebrow: 'Gespeicherte Filter',
      title: 'Gespeicherte Suchen',
      intro: 'Kehren Sie zu denselben Markt-, Kategorie-, Preis- und Fahrzeugfiltern zurück, ohne neu zu beginnen.',
    },
    at: {
      eyebrow: 'Gespeicherte Filter',
      title: 'Gespeicherte Suchen',
      intro: 'Kehren Sie zu denselben Markt-, Kategorie-, Preis- und Fahrzeugfiltern zurück, ohne neu zu beginnen.',
    },
    be: {
      eyebrow: 'Opgeslagen filters',
      title: 'Opgeslagen zoekopdrachten',
      intro: 'Ga terug naar dezelfde markt-, categorie-, prijs- en voertuigfilters zonder opnieuw te beginnen.',
    },
    fr: {
      eyebrow: 'Filtres enregistrés',
      title: 'Recherches enregistrées',
      intro: 'Retrouvez le même marché, la même catégorie, le même prix et les mêmes filtres véhicule sans repartir de zéro.',
    },
    es: {
      eyebrow: 'Filtros guardados',
      title: 'Búsquedas guardadas',
      intro: 'Vuelve al mismo mercado, categoría, precio y filtros de vehículo sin empezar desde cero.',
    },
    it: {
      eyebrow: 'Filtri salvati',
      title: 'Ricerche salvate',
      intro: 'Torna agli stessi filtri di mercato, categoria, prezzo e veicolo senza ricominciare da capo.',
    },
    pl: {
      eyebrow: 'Zapisane filtry',
      title: 'Zapisane wyszukiwania',
      intro: 'Wróć do tych samych filtrów rynku, kategorii, ceny i pojazdu bez zaczynania od nowa.',
    },
    nl: {
      eyebrow: 'Opgeslagen filters',
      title: 'Opgeslagen zoekopdrachten',
      intro: 'Ga terug naar dezelfde markt-, categorie-, prijs- en voertuigfilters zonder opnieuw te beginnen.',
    },
    fi: {
      eyebrow: 'Tallennetut suodattimet',
      title: 'Tallennetut haut',
      intro: 'Palaa samoihin markkina-, kategoria-, hinta- ja ajoneuvosuodattimiin aloittamatta alusta.',
    },
    da: {
      eyebrow: 'Gemte filtre',
      title: 'Gemte søgninger',
      intro: 'Vend tilbage til samme marked, kategori, pris og køretøjsfiltre uden at starte forfra.',
    },
  }

  return copy[locale] || en
}

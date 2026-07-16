'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PublicNewsArticle, PublicNewsCategory } from '@/lib/content/vehicle-news'

export default function VehicleNewsSearch({ market, categories, articles }: { market: string; categories: PublicNewsCategory[]; articles: PublicNewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const copy = vehicleNewsSearchCopy(market)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter((article) => {
      if (activeCategory !== 'all' && article.category?.id !== activeCategory) return false
      return !needle || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase().includes(needle)
    })
  }, [activeCategory, articles, query])
  const [featured, ...rest] = filtered

  return (
    <section id="article-search" className="w-full min-w-0 max-w-full">
      <div className="sticky top-0 z-20 -mx-5 border-y border-[#dbe4f0] bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-[14px] sm:border sm:px-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveCategory('all')} className={tabClass(activeCategory === 'all')}>
            {copy.all}
          </button>
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={tabClass(activeCategory === category.id)}>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-.02em] text-[#101828]">{copy.heading}</h2>
          <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#667085]">{copy.description}</p>
        </div>
        <label className="relative block w-full max-w-[380px]">
          <span className="sr-only">{copy.search}</span>
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#101828]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="h-12 w-full rounded-[12px] border border-[#cfd8e6] bg-[#f8fafc] pl-4 pr-11 text-sm outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10" />
        </label>
      </div>

      {featured ? (
        <Link href={`/${market}/vehicle-news/${featured.slug}`} className="group mt-8 grid overflow-hidden rounded-[18px] border border-[#d7e1ee] bg-white shadow-[0_18px_55px_rgba(16,24,40,.08)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-[#edf3fb] sm:min-h-[360px]">
            {featured.imageUrl ? <Image src={featured.imageUrl} alt={featured.imageAlt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" /> : null}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{featured.category?.label || copy.guide}</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] text-[#101828] sm:text-4xl">{featured.title}</h3>
            <p className="mt-4 text-base leading-7 text-[#475467]">{featured.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#667085]">
              <time>{new Date(featured.publishedAt).toLocaleDateString(copy.dateLocale)}</time>
              <span>|</span>
              <span>{featured.readingTime} min</span>
            </div>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0866ff]">
              {copy.readGuide}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <NewsCard key={article.id} market={market} article={article} copy={copy} />
        ))}
      </div>
      {!filtered.length ? <div className="mt-8 max-w-full break-words rounded-xl border border-dashed border-[#d9e3f2] p-8 text-center text-sm text-[#667085]">{copy.empty}</div> : null}
    </section>
  )
}

function tabClass(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-[#0866ff] bg-[#0866ff] text-white shadow-[0_10px_26px_rgba(8,102,255,.2)]' : 'border-[#d4deeb] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'}`
}

function NewsCard({ market, article, copy }: { market: string; article: PublicNewsArticle; copy: ReturnType<typeof vehicleNewsSearchCopy> }) {
  return (
    <Link href={`/${market}/vehicle-news/${article.slug}`} className="group overflow-hidden rounded-[16px] border border-[#d8e0ec] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(16,24,40,.08)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#edf3fb]">
        {article.imageUrl ? <Image src={article.imageUrl} alt={article.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" /> : null}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">{article.category?.label || copy.guide}</p>
        <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-tight tracking-[-.02em] text-[#101828] group-hover:text-[#0866ff]">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#475467]">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <span className="text-[#667085]">{article.readingTime} min</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#0866ff]">{copy.readMore}<ArrowRight className="h-4 w-4" /></span>
        </div>
      </div>
    </Link>
  )
}

function vehicleNewsSearchCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { all: 'Alla', heading: 'Senaste fordonsguiderna', description: 'Välj kategori eller sök bland guider om bilar, lastbilar och lantbruksmaskiner.', search: 'Sök artiklar', guide: 'Fordonsguide', readGuide: 'Läs guiden', readMore: 'Läs mer', empty: 'Inga publicerade artiklar matchar sökningen.', dateLocale: 'sv-SE' },
    en: { all: 'All', heading: 'Latest vehicle guides', description: 'Choose a category or search guides for cars, trucks and machinery.', search: 'Search articles', guide: 'Vehicle guide', readGuide: 'Read guide', readMore: 'Read more', empty: 'No published articles match your search.', dateLocale: 'en-GB' },
    de: { all: 'Alle', heading: 'Neueste Fahrzeugratgeber', description: 'Wählen Sie eine Kategorie oder suchen Sie Ratgeber zu Autos, Lkw und Maschinen.', search: 'Artikel suchen', guide: 'Fahrzeugratgeber', readGuide: 'Ratgeber lesen', readMore: 'Mehr lesen', empty: 'Keine veröffentlichten Artikel passen zur Suche.', dateLocale: 'de-DE' },
    fr: { all: 'Tous', heading: 'Derniers guides véhicules', description: 'Choisissez une catégorie ou recherchez des guides sur les voitures, camions et machines.', search: 'Rechercher', guide: 'Guide véhicule', readGuide: 'Lire le guide', readMore: 'Lire plus', empty: 'Aucun article publié ne correspond à votre recherche.', dateLocale: 'fr-FR' },
    es: { all: 'Todo', heading: 'Últimas guías de vehículos', description: 'Elige una categoría o busca guías sobre coches, camiones y maquinaria.', search: 'Buscar artículos', guide: 'Guía de vehículos', readGuide: 'Leer guía', readMore: 'Leer más', empty: 'No hay artículos publicados que coincidan con la búsqueda.', dateLocale: 'es-ES' },
    it: { all: 'Tutti', heading: 'Ultime guide sui veicoli', description: 'Scegli una categoria o cerca guide su auto, camion e macchine.', search: 'Cerca articoli', guide: 'Guida veicoli', readGuide: 'Leggi la guida', readMore: 'Leggi di più', empty: 'Nessun articolo pubblicato corrisponde alla ricerca.', dateLocale: 'it-IT' },
    nl: { all: 'Alles', heading: 'Nieuwste voertuiggidsen', description: 'Kies een categorie of zoek gidsen voor auto’s, vrachtwagens en machines.', search: 'Artikelen zoeken', guide: 'Voertuiggids', readGuide: 'Lees gids', readMore: 'Lees meer', empty: 'Geen gepubliceerde artikelen gevonden.', dateLocale: 'nl-NL' },
    pl: { all: 'Wszystkie', heading: 'Najnowsze poradniki pojazdów', description: 'Wybierz kategorię lub szukaj poradników o samochodach, ciężarówkach i maszynach.', search: 'Szukaj artykułów', guide: 'Poradnik', readGuide: 'Czytaj poradnik', readMore: 'Czytaj więcej', empty: 'Brak opublikowanych artykułów pasujących do wyszukiwania.', dateLocale: 'pl-PL' },
    da: { all: 'Alle', heading: 'Seneste køretøjsguides', description: 'Vælg kategori eller søg i guides om biler, lastbiler og maskiner.', search: 'Søg artikler', guide: 'Køretøjsguide', readGuide: 'Læs guiden', readMore: 'Læs mere', empty: 'Ingen publicerede artikler matcher søgningen.', dateLocale: 'da-DK' },
    fi: { all: 'Kaikki', heading: 'Uusimmat ajoneuvo-oppaat', description: 'Valitse kategoria tai hae oppaita autoista, kuorma-autoista ja koneista.', search: 'Hae artikkeleita', guide: 'Ajoneuvo-opas', readGuide: 'Lue opas', readMore: 'Lue lisää', empty: 'Julkaistuja artikkeleita ei löytynyt haulla.', dateLocale: 'fi-FI' },
  }
  return labels[language]
}

function marketLanguage(market: string): 'sv' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi' {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'de' || normalized === 'at') return 'de'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'es') return 'es'
  if (normalized === 'it') return 'it'
  if (normalized === 'nl' || normalized === 'be') return 'nl'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'dk') return 'da'
  if (normalized === 'fi') return 'fi'
  return 'en'
}

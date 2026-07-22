'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PublicNewsArticle, PublicNewsListing } from '@/lib/content/vehicle-news'

export default function VehicleNewsSearch({
  market,
  initialCategory,
  articles,
  featuredListings,
}: {
  market: string
  initialCategory: string
  articles: PublicNewsArticle[]
  featuredListings: PublicNewsListing[]
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [query, setQuery] = useState('')
  const copy = vehicleNewsSearchCopy(market)

  useEffect(() => {
    setActiveCategory(initialCategory)
  }, [initialCategory])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter((article) => {
      if (activeCategory !== 'all' && article.category?.id !== activeCategory) return false
      return !needle || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase().includes(needle)
    })
  }, [activeCategory, articles, query])

  const [featured, ...rest] = filtered
  const latest = filtered.slice(0, 4)

  return (
    <section id="article-search" className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-.02em] text-[#101828]">{copy.heading}</h2>
          <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#667085]">{copy.description}</p>
        </div>
        <label className="relative block w-full max-w-[380px]">
          <span className="sr-only">{copy.search}</span>
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#101828]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            className="h-12 w-full rounded-[12px] border border-[#cfd8e6] bg-white pl-4 pr-11 text-sm outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          />
        </label>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {featured ? <FeaturedNewsArticle market={market} article={featured} copy={copy} /> : null}

          {rest.length ? (
            <div className="mt-7">
              <h3 className="flex items-center gap-1 text-xl font-semibold tracking-[-.02em] text-[#101828]">
                {copy.current}
                <span className="text-[#0866ff]">↓</span>
              </h3>
              <div className="mt-3 divide-y divide-[#e4eaf3] border-y border-[#e4eaf3]">
                {rest.map((article) => (
                  <CompactNewsArticle key={article.id} market={market} article={article} copy={copy} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="hidden min-w-0 space-y-4 lg:block">
          {latest.length ? (
            <SidebarPanel title={copy.latestArticles}>
              <div className="divide-y divide-[#e4eaf3]">
                {latest.map((article) => (
                  <SidebarArticle key={article.id} market={market} article={article} />
                ))}
              </div>
            </SidebarPanel>
          ) : null}

          {featuredListings.length ? (
            <SidebarPanel title={copy.featuredListings}>
              <div className="space-y-4">
                {featuredListings.map((listing) => (
                  <FeaturedListingCard key={listing.id} listing={listing} copy={copy} />
                ))}
              </div>
            </SidebarPanel>
          ) : null}
        </aside>
      </div>

      {!filtered.length ? (
        <div className="mt-8 max-w-full break-words rounded-xl border border-dashed border-[#d9e3f2] p-8 text-center text-sm text-[#667085]">
          {copy.empty}
        </div>
      ) : null}
    </section>
  )
}

function vehicleNewsArticleHref(market: string, slug: string) {
  return market === 'en' ? `/vehicle-news/${slug}` : `/${market}/vehicle-news/${slug}`
}

function FeaturedNewsArticle({ market, article, copy }: { market: string; article: PublicNewsArticle; copy: ReturnType<typeof vehicleNewsSearchCopy> }) {
  return (
    <article className="min-w-0">
      <Link href={vehicleNewsArticleHref(market, article.slug)} className="group block">
        <ArticleImage article={article} className="aspect-[16/7] rounded-[4px]" sizes="(min-width: 1024px) 760px, 100vw" />
        <h3 className="mt-4 max-w-[820px] break-words text-[30px] font-semibold leading-[1.08] tracking-[-.035em] text-[#101828] [overflow-wrap:anywhere] group-hover:text-[#0866ff] sm:text-[36px]">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 max-w-[780px] break-words text-[15px] leading-6 text-[#344054] [overflow-wrap:anywhere]">{article.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
          <time>{new Date(article.publishedAt).toLocaleDateString(copy.dateLocale)}</time>
          <span>|</span>
          <span>{article.readingTime} min</span>
          {article.category?.label ? <span className="rounded-[4px] border border-[#d8e0ec] px-2 py-1 text-[#475467]">{article.category.label}</span> : null}
        </div>
      </Link>
    </article>
  )
}

function CompactNewsArticle({ market, article, copy }: { market: string; article: PublicNewsArticle; copy: ReturnType<typeof vehicleNewsSearchCopy> }) {
  return (
    <article className="py-4">
      <Link href={vehicleNewsArticleHref(market, article.slug)} className="group grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
        <ArticleImage article={article} className="aspect-[16/10] rounded-[4px] sm:aspect-[4/3]" sizes="112px" />
        <div className="min-w-0">
          <h4 className="line-clamp-2 max-w-full break-words text-xl font-semibold leading-[1.15] tracking-[-.025em] text-[#101828] [overflow-wrap:anywhere] group-hover:text-[#0866ff]">
            {article.title}
          </h4>
          <p className="mt-2 line-clamp-2 max-w-full break-words text-sm leading-5 text-[#475467] [overflow-wrap:anywhere]">{article.excerpt}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-[#667085]">
            {article.category?.label ? <span className="rounded-[4px] border border-[#d8e0ec] px-2 py-1">{article.category.label}</span> : null}
            <span className="rounded-[4px] border border-[#d8e0ec] px-2 py-1">{article.readingTime} min</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[4px] border border-[#d8e0ec] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function SidebarArticle({ market, article }: { market: string; article: PublicNewsArticle }) {
  return (
    <Link href={vehicleNewsArticleHref(market, article.slug)} className="group grid grid-cols-[76px_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
      <ArticleImage article={article} className="aspect-[4/3] rounded-[3px]" sizes="76px" />
      <p className="line-clamp-3 text-[13px] font-normal leading-5 text-[#101828] group-hover:text-[#0866ff]">{article.title}</p>
    </Link>
  )
}

function FeaturedListingCard({ listing, copy }: { listing: PublicNewsListing; copy: ReturnType<typeof vehicleNewsSearchCopy> }) {
  return (
    <Link href={listing.href} className="group block border-b border-[#e4eaf3] pb-4 last:border-b-0 last:pb-0">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-[#edf3fb]">
        {listing.imageUrl ? (
          <Image src={listing.imageUrl} alt={listing.title} fill sizes="320px" className="object-cover transition duration-500 group-hover:scale-[1.025]" />
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-[#101828] group-hover:text-[#0866ff]">{listing.title}</p>
      <p className="mt-1 text-sm font-semibold text-[#101828]">{listing.priceLabel}</p>
      {listing.location || listing.meta ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#667085]">{[listing.location, listing.meta].filter(Boolean).join(' | ')}</p>
      ) : null}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0866ff]">
        {copy.viewListing}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

function ArticleImage({ article, className, sizes }: { article: PublicNewsArticle; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#edf3fb] ${className}`}>
      {article.imageUrl ? (
        <Image src={article.imageUrl} alt={article.imageAlt} fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-[1.025]" />
      ) : null}
    </div>
  )
}

function vehicleNewsSearchCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { heading: 'Senaste fordonsguiderna', description: 'Välj kategori eller sök bland guider om bilar, lastbilar och lantbruksmaskiner.', search: 'Sök artiklar', empty: 'Inga publicerade artiklar matchar sökningen.', current: 'Aktuellt', latestArticles: 'Senaste artiklarna', featuredListings: 'Utvalda annonser', viewListing: 'Se annons', dateLocale: 'sv-SE' },
    en: { heading: 'Latest vehicle guides', description: 'Choose a category or search guides for cars, trucks and machinery.', search: 'Search articles', empty: 'No published articles match your search.', current: 'Latest', latestArticles: 'Latest articles', featuredListings: 'Featured listings', viewListing: 'View listing', dateLocale: 'en-GB' },
    de: { heading: 'Neueste Fahrzeugratgeber', description: 'Wählen Sie eine Kategorie oder suchen Sie Ratgeber zu Autos, Lkw und Maschinen.', search: 'Artikel suchen', empty: 'Keine veröffentlichten Artikel passen zur Suche.', current: 'Aktuell', latestArticles: 'Neueste Artikel', featuredListings: 'Ausgewählte Anzeigen', viewListing: 'Anzeige ansehen', dateLocale: 'de-DE' },
    fr: { heading: 'Derniers guides véhicules', description: 'Choisissez une catégorie ou recherchez des guides sur les voitures, camions et machines.', search: 'Rechercher', empty: 'Aucun article publié ne correspond à votre recherche.', current: 'Actualité', latestArticles: 'Derniers articles', featuredListings: 'Annonces sélectionnées', viewListing: 'Voir l’annonce', dateLocale: 'fr-FR' },
    es: { heading: 'Últimas guías de vehículos', description: 'Elige una categoría o busca guías sobre coches, camiones y maquinaria.', search: 'Buscar artículos', empty: 'No hay artículos publicados que coincidan con la búsqueda.', current: 'Actualidad', latestArticles: 'Últimos artículos', featuredListings: 'Anuncios destacados', viewListing: 'Ver anuncio', dateLocale: 'es-ES' },
    it: { heading: 'Ultime guide sui veicoli', description: 'Scegli una categoria o cerca guide su auto, camion e macchine.', search: 'Cerca articoli', empty: 'Nessun articolo pubblicato corrisponde alla ricerca.', current: 'Attualità', latestArticles: 'Ultimi articoli', featuredListings: 'Annunci in evidenza', viewListing: 'Vedi annuncio', dateLocale: 'it-IT' },
    nl: { heading: 'Nieuwste voertuiggidsen', description: 'Kies een categorie of zoek gidsen voor auto’s, vrachtwagens en machines.', search: 'Artikelen zoeken', empty: 'Geen gepubliceerde artikelen gevonden.', current: 'Actueel', latestArticles: 'Nieuwste artikelen', featuredListings: 'Uitgelichte advertenties', viewListing: 'Bekijk advertentie', dateLocale: 'nl-NL' },
    pl: { heading: 'Najnowsze poradniki pojazdów', description: 'Wybierz kategorię lub szukaj poradników o samochodach, ciężarówkach i maszynach.', search: 'Szukaj artykułów', empty: 'Brak opublikowanych artykułów pasujących do wyszukiwania.', current: 'Aktualne', latestArticles: 'Najnowsze artykuły', featuredListings: 'Wyróżnione ogłoszenia', viewListing: 'Zobacz ogłoszenie', dateLocale: 'pl-PL' },
    da: { heading: 'Seneste køretøjsguides', description: 'Vælg kategori eller søg i guides om biler, lastbiler og maskiner.', search: 'Søg artikler', empty: 'Ingen publicerede artikler matcher søgningen.', current: 'Aktuelt', latestArticles: 'Seneste artikler', featuredListings: 'Udvalgte annoncer', viewListing: 'Se annonce', dateLocale: 'da-DK' },
    fi: { heading: 'Uusimmat ajoneuvo-oppaat', description: 'Valitse kategoria tai hae oppaita autoista, kuorma-autoista ja koneista.', search: 'Hae artikkeleita', empty: 'Julkaistuja artikkeleita ei löytynyt haulla.', current: 'Ajankohtaista', latestArticles: 'Uusimmat artikkelit', featuredListings: 'Nostetut ilmoitukset', viewListing: 'Katso ilmoitus', dateLocale: 'fi-FI' },
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

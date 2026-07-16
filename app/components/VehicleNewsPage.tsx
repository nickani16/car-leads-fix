import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import VehicleNewsSearch from '@/app/components/VehicleNewsSearch'
import type { PublicNewsArticle, PublicNewsCategory } from '@/lib/content/vehicle-news'

export default function VehicleNewsPage({
  market,
  page,
  articles,
  categories,
  count,
  unavailable,
}: {
  market: string
  page: number
  articles: PublicNewsArticle[]
  categories: PublicNewsCategory[]
  count: number
  unavailable: boolean
}) {
  const locale = publicLocale(market)
  const copy = vehicleNewsPageCopy(market)
  const hasNext = page * 12 < count
  const baseHref = vehicleNewsBaseHref(market)
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={market.toUpperCase()} />
      <VehicleNewsSubnav market={market} />
      <section className="w-full max-w-full overflow-hidden border-b border-[#dbe4f0] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]">
        <div className="mx-auto w-full min-w-0 max-w-[var(--autorell-page-max)] px-5 py-12 sm:px-8 sm:py-18 lg:py-20">
          <div className="w-full min-w-0 max-w-[330px] sm:max-w-[860px]">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">Autorell insights</p>
            <h1 className="mt-4 max-w-[330px] break-words text-[34px] font-semibold leading-[1.04] tracking-[-.045em] [overflow-wrap:anywhere] sm:max-w-full sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-[330px] break-words text-[17px] leading-8 text-[#475467] [overflow-wrap:anywhere] sm:max-w-[760px] sm:text-lg">
              {copy.description}
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full min-w-0 max-w-[var(--autorell-page-max)] overflow-hidden px-5 py-10 sm:px-8 sm:py-14">
        {unavailable ? (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>{copy.preparing}</strong>
          </div>
        ) : null}
        <VehicleNewsSearch market={market} categories={categories} articles={articles} />
        <nav className="mt-8 flex items-center justify-between" aria-label="Paginering">
          {page > 1 ? (
            <Link href={`${baseHref}?page=${page - 1}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
              <ArrowLeft className="h-4 w-4" />
              {copy.previous}
            </Link>
          ) : <span />}
          {hasNext ? (
            <Link href={`${baseHref}?page=${page + 1}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
              {copy.next}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </nav>
      </section>
      <NewsletterSignup locale={locale} category="vehicle-news" />
      <PublicFooter locale={locale} />
    </main>
  )
}

function VehicleNewsSubnav({ market }: { market: string }) {
  const baseHref = vehicleNewsBaseHref(market)
  const copy = vehicleNewsSubnavCopy(market)
  const items = [
    { label: copy.market, href: baseHref },
    { label: copy.buySell, href: `${baseHref}#article-search` },
    { label: copy.ownership, href: `${baseHref}#article-search` },
    { label: copy.business, href: `${baseHref}#article-search` },
  ]

  return (
    <nav aria-label={copy.aria} className="w-full max-w-full overflow-hidden border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto flex h-11 w-full max-w-[1920px] items-center gap-9 overflow-x-auto px-5 text-[15px] font-medium text-[#101828] [scrollbar-width:none] sm:px-8 min-[1120px]:h-12 min-[1120px]:px-8 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="shrink-0 whitespace-nowrap transition hover:text-[#0866ff]">
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function vehicleNewsBaseHref(market: string) {
  return market === 'en' ? '/vehicle-news' : `/${market}/vehicle-news`
}

function publicLocale(market: string): 'sv' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi' | 'en' {
  const language = marketLanguage(market)
  return language === 'da' ? 'da' : language
}

function vehicleNewsPageCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { title: 'Fordonsnyheter och guider', description: 'Praktiska artiklar för dig som köper, säljer eller jämför bilar, lastbilar och lantbruksmaskiner i Europa.', preparing: 'Innehållet förbereds.', previous: 'Föregående', next: 'Nästa' },
    en: { title: 'Vehicle news and guides', description: 'Practical articles for buying, selling and comparing cars, trucks and machinery across Europe.', preparing: 'Content is being prepared.', previous: 'Previous', next: 'Next' },
    de: { title: 'Fahrzeugnews und Ratgeber', description: 'Praktische Artikel zum Kaufen, Verkaufen und Vergleichen von Autos, Lkw und Maschinen in Europa.', preparing: 'Inhalte werden vorbereitet.', previous: 'Zurück', next: 'Weiter' },
    fr: { title: 'Actualités et guides véhicules', description: 'Des articles pratiques pour acheter, vendre et comparer voitures, camions et machines en Europe.', preparing: 'Le contenu est en préparation.', previous: 'Précédent', next: 'Suivant' },
    es: { title: 'Noticias y guías de vehículos', description: 'Artículos prácticos para comprar, vender y comparar coches, camiones y maquinaria en Europa.', preparing: 'El contenido se está preparando.', previous: 'Anterior', next: 'Siguiente' },
    it: { title: 'Notizie e guide sui veicoli', description: 'Articoli pratici per comprare, vendere e confrontare auto, camion e macchine in Europa.', preparing: 'Il contenuto è in preparazione.', previous: 'Precedente', next: 'Successivo' },
    nl: { title: 'Voertuignieuws en gidsen', description: 'Praktische artikelen voor kopen, verkopen en vergelijken van auto’s, vrachtwagens en machines in Europa.', preparing: 'Content wordt voorbereid.', previous: 'Vorige', next: 'Volgende' },
    pl: { title: 'Aktualności i poradniki pojazdów', description: 'Praktyczne artykuły o kupnie, sprzedaży i porównywaniu samochodów, ciężarówek i maszyn w Europie.', preparing: 'Treść jest przygotowywana.', previous: 'Poprzednia', next: 'Następna' },
    da: { title: 'Køretøjsnyheder og guides', description: 'Praktiske artikler til køb, salg og sammenligning af biler, lastbiler og maskiner i Europa.', preparing: 'Indholdet forberedes.', previous: 'Forrige', next: 'Næste' },
    fi: { title: 'Ajoneuvouutiset ja oppaat', description: 'Käytännön artikkeleita autojen, kuorma-autojen ja koneiden ostamiseen, myyntiin ja vertailuun Euroopassa.', preparing: 'Sisältöä valmistellaan.', previous: 'Edellinen', next: 'Seuraava' },
  }
  return labels[language]
}

function vehicleNewsSubnavCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { aria: 'Fordonsnyheter meny', market: 'Fordonsmarknaden', buySell: 'Köpa och sälja fordon', ownership: 'Äga och jämföra', business: 'För företag' },
    en: { aria: 'Vehicle news menu', market: 'Vehicle market', buySell: 'Buy and sell vehicles', ownership: 'Own and compare', business: 'For companies' },
    de: { aria: 'Fahrzeugnews-Menü', market: 'Fahrzeugmarkt', buySell: 'Kaufen und verkaufen', ownership: 'Besitzen und vergleichen', business: 'Für Firmen' },
    fr: { aria: 'Menu actualités véhicules', market: 'Marché automobile', buySell: 'Acheter et vendre', ownership: 'Posséder et comparer', business: 'Pour entreprises' },
    es: { aria: 'Menú de noticias de vehículos', market: 'Mercado de vehículos', buySell: 'Comprar y vender', ownership: 'Tener y comparar', business: 'Para empresas' },
    it: { aria: 'Menu notizie veicoli', market: 'Mercato veicoli', buySell: 'Comprare e vendere', ownership: 'Possedere e confrontare', business: 'Per aziende' },
    nl: { aria: 'Voertuignieuws menu', market: 'Voertuigmarkt', buySell: 'Kopen en verkopen', ownership: 'Bezitten en vergelijken', business: 'Voor bedrijven' },
    pl: { aria: 'Menu aktualności pojazdów', market: 'Rynek pojazdów', buySell: 'Kupno i sprzedaż', ownership: 'Posiadanie i porównanie', business: 'Dla firm' },
    da: { aria: 'Køretøjsnyheder menu', market: 'Køretøjsmarkedet', buySell: 'Køb og salg', ownership: 'Eje og sammenligne', business: 'For virksomheder' },
    fi: { aria: 'Ajoneuvouutisten valikko', market: 'Ajoneuvomarkkina', buySell: 'Osta ja myy', ownership: 'Omista ja vertaile', business: 'Yrityksille' },
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

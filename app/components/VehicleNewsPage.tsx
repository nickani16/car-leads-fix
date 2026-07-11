import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bell, CarFront, Clock3, Search, Sparkles } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import VehicleNewsSearch, { type VehicleNewsArticle, type VehicleNewsCategory } from '@/app/components/VehicleNewsSearch'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'

type VehicleNewsPageProps = {
  locale: PublicLocale
  marketCode?: string
}

const categories: VehicleNewsCategory[] = [
  { id: 'all', label: { sv: 'Alla', en: 'All', de: 'Alle' } },
  { id: 'cars', label: { sv: 'Bilar', en: 'Cars', de: 'Autos' } },
  { id: 'vans', label: { sv: 'Transportbilar', en: 'Vans', de: 'Transporter' } },
  { id: 'trucks', label: { sv: 'Lastbilar', en: 'Trucks', de: 'Lkw' } },
  { id: 'motorcycles', label: { sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorrader' } },
  { id: 'leisure', label: { sv: 'Husbilar & husvagnar', en: 'Motorhomes & caravans', de: 'Wohnmobile & Wohnwagen' } },
  { id: 'electric', label: { sv: 'Elfordon', en: 'Electric vehicles', de: 'Elektrofahrzeuge' } },
  { id: 'market', label: { sv: 'Marknad', en: 'Market', de: 'Markt' } },
]

const articles: VehicleNewsArticle[] = [
  {
    id: 'sa-laser-kopare-fordonsannonser',
    category: 'market',
    title: {
      sv: 'Så läser köpare fordonsannonser när flera marknader jämförs',
      en: 'How buyers read vehicle listings across several markets',
      de: 'Wie Käufer Fahrzeuganzeigen über mehrere Märkte vergleichen',
    },
    excerpt: {
      sv: 'Pris, plats, historik och säljarprofil väger tyngre när köparen jämför fordon över landsgränser.',
      en: 'Price, location, history and seller profile matter more when buyers compare vehicles across borders.',
      de: 'Preis, Standort, Historie und Verkäuferprofil werden wichtiger, wenn Käufer grenzüberschreitend vergleichen.',
    },
    image: '/dealer-macbook.webp',
    date: '11 juli 2026',
    readTime: '4 min',
    tags: ['Marknad', 'Köpguide'],
    featured: true,
  },
  {
    id: 'begagnad-elbil-batteri-rackvidd',
    category: 'electric',
    title: {
      sv: 'Begagnad elbil: batteri, räckvidd och laddning att kontrollera',
      en: 'Used electric cars: battery, range and charging checks',
      de: 'Gebrauchte Elektroautos: Batterie, Reichweite und Laden prüfen',
    },
    excerpt: {
      sv: 'En praktisk genomgång av vilka uppgifter som gör en elbilsannons lättare att förstå.',
      en: 'A practical overview of the details that make an electric car listing easier to understand.',
      de: 'Ein praktischer Überblick über Angaben, die eine Elektroauto-Anzeige verständlicher machen.',
    },
    image: '/category-electric-mobility.jpg',
    date: '10 juli 2026',
    readTime: '5 min',
    tags: ['Elfordon', 'Bilar'],
  },
  {
    id: 'transportbil-lastvolym-totalvikt',
    category: 'vans',
    title: {
      sv: 'Transportbil: lastvolym, lastvikt och totalvikt utan missförstånd',
      en: 'Vans: cargo volume, payload and gross weight without confusion',
      de: 'Transporter: Ladevolumen, Nutzlast und Gesamtgewicht verständlich erklärt',
    },
    excerpt: {
      sv: 'De tekniska fälten som gör störst skillnad när företag jämför transportbilar.',
      en: 'The technical fields that matter most when businesses compare vans.',
      de: 'Die technischen Felder, die beim Vergleich von Transportern am wichtigsten sind.',
    },
    image: '/category-vans-hero.jpg',
    date: '9 juli 2026',
    readTime: '3 min',
    tags: ['Transportbilar', 'Företag'],
  },
  {
    id: 'lastbil-euroklass-axlar',
    category: 'trucks',
    title: {
      sv: 'Lastbilar: Euro-klass, axlar och påbyggnad i annonsen',
      en: 'Trucks: Euro class, axles and body type in the listing',
      de: 'Lkw: Euro-Klasse, Achsen und Aufbau in der Anzeige',
    },
    excerpt: {
      sv: 'Så blir tunga fordonsannonser tydliga för både köpare och säljare.',
      en: 'How heavy vehicle listings become clearer for both buyers and sellers.',
      de: 'So werden Nutzfahrzeuganzeigen für Käufer und Verkäufer klarer.',
    },
    image: '/category-trucks-hero.jpg',
    date: '8 juli 2026',
    readTime: '4 min',
    tags: ['Lastbilar', 'Teknik'],
  },
  {
    id: 'motorcykel-cc-effekt-typ',
    category: 'motorcycles',
    title: {
      sv: 'Motorcyklar: cylindervolym, effekt och typ innan du kontaktar säljaren',
      en: 'Motorcycles: displacement, power and type before contacting the seller',
      de: 'Motorräder: Hubraum, Leistung und Typ vor der Kontaktaufnahme',
    },
    excerpt: {
      sv: 'Korta kontroller som hjälper dig förstå motorcykelannonsen snabbare.',
      en: 'Quick checks that help you understand a motorcycle listing faster.',
      de: 'Kurze Checks, mit denen Sie eine Motorrad-Anzeige schneller verstehen.',
    },
    image: '/category-motorcycles-hero.jpg',
    date: '7 juli 2026',
    readTime: '3 min',
    tags: ['Motorcyklar'],
  },
  {
    id: 'husbil-husvagn-vikt-sovplatser',
    category: 'leisure',
    title: {
      sv: 'Husbil eller husvagn: vikt, längd och sovplatser att ha koll på',
      en: 'Motorhome or caravan: weight, length and berths to check',
      de: 'Wohnmobil oder Wohnwagen: Gewicht, Länge und Schlafplätze prüfen',
    },
    excerpt: {
      sv: 'Det viktigaste i fritidsfordonsannonser när planlösning och körbarhet ska jämföras.',
      en: 'The key listing details when layout and drivability need to be compared.',
      de: 'Die wichtigsten Angaben, wenn Grundriss und Fahrbarkeit verglichen werden.',
    },
    image: '/category-motorhomes-hero.jpg',
    date: '6 juli 2026',
    readTime: '4 min',
    tags: ['Husbilar', 'Husvagnar'],
  },
]

export default function VehicleNewsPage({ locale, marketCode }: VehicleNewsPageProps) {
  const featured = articles.find((article) => article.featured) || articles[0]
  const sidebarArticles = articles.filter((article) => article.id !== featured.id).slice(0, 4)

  const t = (sv: string, en: string, de: string) => {
    if (locale === 'sv') return sv
    if (locale === 'de') return de
    if (locale === 'en') return en
    return translatePublic(locale, en)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <nav className="border-b border-[#e5eaf2] bg-white">
        <div className="mx-auto flex max-w-[1060px] items-center justify-center gap-5 overflow-x-auto px-5 py-3 text-[14px] font-[400] text-[#344054] sm:px-8">
          {categories.slice(1, 6).map((category) => (
            <a key={category.id} href={`#${category.id}`} className="shrink-0 transition hover:text-[#0866ff]">
              {localizeCategoryLabel(category, locale)}
            </a>
          ))}
          <a href="#article-search" className="inline-flex shrink-0 items-center gap-2 text-[#101828] transition hover:text-[#0866ff]">
            <Search className="h-4 w-4" />
            {t('Sök artiklar', 'Search articles', 'Artikel suchen')}
          </a>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-[var(--autorell-page-max)] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
        <div className="w-full min-w-0 max-w-[calc(100vw-40px)] sm:max-w-none">
          <p className="text-xs font-[500] uppercase tracking-[0.18em] text-[#0866ff]">
            Autorell {t('kunskap', 'insights', 'Wissen')}
          </p>
          <h1 className="mt-4 max-w-full break-words text-[40px] font-[500] leading-[1.02] tracking-[-0.04em] sm:text-[64px]">
            {t('Fordonsnyheter', 'Vehicle news', 'Fahrzeugnews')}
          </h1>
          <p className="mt-5 max-w-[680px] break-words text-[18px] leading-8 text-[#344054]">
            {t(
              'Här samlar vi guider, marknadsnyheter och praktiska artiklar för dig som köper, säljer eller jämför fordon i Europa.',
              'Guides, market updates and practical articles for buying, selling and comparing vehicles in Europe.',
              'Ratgeber, Marktupdates und praktische Artikel zum Kaufen, Verkaufen und Vergleichen von Fahrzeugen in Europa.',
            )}
          </p>

          <Link href={localizePublicHref(locale, '/marketplace')} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-[14px] font-[500] text-white transition hover:bg-[#075ce5]">
            {t('Sök fordon', 'Search vehicles', 'Fahrzeuge suchen')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <aside className="rounded-[8px] border border-[#d9e3f2] bg-[#f8fbff] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white text-[#0866ff] shadow-sm">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-[600]">{t('Följ marknaden', 'Follow the market', 'Markt verfolgen')}</p>
              <p className="mt-1 text-[13px] leading-5 text-[#667085]">
                {t('Nya guider och uppdateringar samlas här.', 'New guides and updates are collected here.', 'Neue Ratgeber und Updates finden Sie hier.')}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto grid w-full max-w-[var(--autorell-page-max)] gap-8 px-5 pb-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="w-full min-w-0 max-w-[calc(100vw-40px)] sm:max-w-none">
          <article className="w-full max-w-full overflow-hidden rounded-[8px] border border-[#d9e3f2] bg-white">
            <div className="relative aspect-[16/7] min-h-[260px] overflow-hidden bg-[#edf3fb]">
              <Image src={featured.image} alt="" fill sizes="(min-width: 1120px) 820px, 100vw" className="object-cover" priority />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-[500] text-[#667085]">
                <span>{featured.date}</span>
                <span>•</span>
                <span>{featured.readTime}</span>
              </div>
              <h2 className="mt-3 max-w-[820px] break-words text-[26px] font-[500] leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
                {localizeArticleText(featured.title, locale)}
              </h2>
              <p className="mt-3 max-w-[780px] break-words text-[15px] leading-7 text-[#344054]">
                {localizeArticleText(featured.excerpt, locale)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <span key={tag} className="rounded-[6px] bg-[#eef4ff] px-2.5 py-1 text-[12px] font-[500] text-[#0866ff]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <VehicleNewsSearch
            locale={locale}
            categories={categories}
            articles={articles.filter((article) => article.id !== featured.id)}
          />
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-[8px] border border-[#d9e3f2] bg-white p-4">
            <h2 className="text-[15px] font-[600]">{t('Senaste artiklarna', 'Latest articles', 'Neueste Artikel')}</h2>
            <div className="mt-4 grid gap-3">
              {sidebarArticles.map((article) => (
                <article key={article.id} className="grid grid-cols-[72px_1fr] gap-3 border-b border-[#edf1f6] pb-3 last:border-b-0 last:pb-0">
                  <div className="relative h-16 overflow-hidden rounded-[6px] bg-[#edf3fb]">
                    <Image src={article.image} alt="" fill sizes="72px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-[13px] font-[500] leading-5">
                      {localizeArticleText(article.title, locale)}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#667085]">{article.date}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#d9e3f2] bg-[#101828] p-5 text-white">
            <Sparkles className="h-5 w-5 text-[#93c5fd]" />
            <h2 className="mt-4 text-[18px] font-[500]">
              {t('Guider för bättre fordonsbeslut', 'Guides for better vehicle decisions', 'Ratgeber für bessere Fahrzeugentscheidungen')}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-[#cbd5e1]">
              {t('Artiklarna är skrivna för att göra annonser, teknik och marknader lättare att jämföra.', 'Articles are written to make listings, technical data and markets easier to compare.', 'Die Artikel helfen, Anzeigen, technische Daten und Märkte leichter zu vergleichen.')}
            </p>
          </section>
        </aside>
      </section>

      <section className="border-y border-[#e5eaf2] bg-[#f8fbff]">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-4 px-5 py-8 sm:px-8 md:grid-cols-3">
          {[
            [CarFront, t('Fordonstyper', 'Vehicle types', 'Fahrzeugtypen'), t('Bilar, transportbilar, lastbilar och fritidsfordon.', 'Cars, vans, trucks and leisure vehicles.', 'Autos, Transporter, Lkw und Freizeitfahrzeuge.')],
            [Clock3, t('Aktuellt', 'Current', 'Aktuell'), t('Nyheter när marknaden eller köpbeteendet ändras.', 'Updates when the market or buyer behaviour changes.', 'Updates, wenn Markt oder Kaufverhalten sich ändern.')],
            [Search, t('Sökbart', 'Searchable', 'Durchsuchbar'), t('Filtrera artiklar efter kategori eller sökord.', 'Filter articles by category or keyword.', 'Artikel nach Kategorie oder Suchwort filtern.')],
          ].map(([Icon, title, text]) => (
            <article key={title as string} className="rounded-[8px] border border-[#d9e3f2] bg-white p-5">
              <Icon className="h-5 w-5 text-[#0866ff]" />
              <h3 className="mt-4 text-[17px] font-[600]">{title as string}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#667085]">{text as string}</p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function localizeCategoryLabel(category: VehicleNewsCategory, locale: PublicLocale) {
  if (locale === 'sv') return category.label.sv
  if (locale === 'de') return category.label.de
  if (locale === 'en') return category.label.en
  return translatePublic(locale, category.label.en)
}

function localizeArticleText(value: VehicleNewsArticle['title'], locale: PublicLocale) {
  if (locale === 'sv') return value.sv
  if (locale === 'de') return value.de
  if (locale === 'en') return value.en
  return translatePublic(locale, value.en)
}

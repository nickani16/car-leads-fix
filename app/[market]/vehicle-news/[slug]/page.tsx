import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import { articleBodyBlocks, getVehicleNewsArticle, type PublicNewsBodyBlock } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; slug: string }>
  searchParams: Promise<{ preview?: string }>
}): Promise<Metadata> {
  const { market, slug } = await params
  const preview = (await searchParams).preview
  const result = await getVehicleNewsArticle(market, slug, preview)
  if (!result) return {}
  const { article } = result
  return {
    title: article.seoTitle || `${article.title} | Autorell`,
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: article.canonicalUrl || `https://www.autorell.com/${market}/vehicle-news/${slug}` },
    openGraph: { images: article.imageUrl ? [article.imageUrl] : [] },
    robots: result.preview ? { index: false, follow: false, noarchive: true } : undefined,
  }
}

export default async function VehicleNewsArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { market, slug } = await params
  const preview = (await searchParams).preview
  const result = await getVehicleNewsArticle(market, slug, preview)
  if (!result) notFound()
  const { article } = result
  const bodyBlocks = articleBodyBlocks(article.body)
  const locale = publicLocale(market)
  const copy = articlePageCopy(market)
  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={market.toUpperCase()} />
      {result.preview ? (
        <div className="bg-amber-100 px-4 py-3 text-center text-sm font-bold text-amber-900">{copy.preview}</div>
      ) : null}
      <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-8 sm:py-16">
        <nav className="text-sm text-[#667085]" aria-label={copy.breadcrumbLabel}>
          <Link href={`/${market}/vehicle-news`} className="hover:text-[#0866ff]">{copy.news}</Link>
          {article.category ? <> / <span>{article.category.label}</span></> : null}
        </nav>
        {article.category ? <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{article.category.label}</p> : null}
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">{article.title}</h1>
        <p className="mt-6 text-xl leading-8 text-[#475467]">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#667085]">
          <span>{article.author}</span>
          <span>|</span>
          <time>{new Date(article.publishedAt).toLocaleDateString(copy.dateLocale)}</time>
          <span>|</span>
          <span>{article.readingTime} {copy.minutes}</span>
        </div>
        {article.imageUrl ? (
          <figure className="mt-9">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#edf3fb]">
              <Image src={article.imageUrl} alt={article.imageAlt} fill priority sizes="(min-width: 900px) 900px, 100vw" className="object-cover" />
            </div>
            {article.imageCaption ? <figcaption className="mt-3 text-sm text-[#667085]">{article.imageCaption}</figcaption> : null}
          </figure>
        ) : null}
        <div className="mt-10 max-w-none text-[#344054]">
          {bodyBlocks.map((block, index) => <ArticleBodyBlock key={`${index}-${block.text.slice(0, 20)}`} block={block} />)}
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => <span key={tag} className="rounded-full bg-[#f2f4f7] px-3 py-1.5 text-sm">{tag}</span>)}
        </div>
      </article>
      <NewsletterSignup locale={locale} category="vehicle-news" />
      <PublicFooter locale={locale} />
    </main>
  )
}

function ArticleBodyBlock({ block }: { block: PublicNewsBodyBlock }) {
  const content = block.bold ? <strong className="font-semibold text-[#101828]">{block.text}</strong> : block.text
  if (block.type !== 'heading') return <p className="mb-6 text-lg leading-8">{content}</p>

  const className = {
    1: 'mb-6 mt-10 text-4xl font-semibold leading-tight tracking-[-.03em] text-[#101828] sm:text-5xl',
    2: 'mb-5 mt-10 text-3xl font-semibold leading-tight tracking-[-.02em] text-[#101828] sm:text-4xl',
    3: 'mb-4 mt-9 text-2xl font-semibold leading-tight text-[#101828] sm:text-3xl',
    4: 'mb-3 mt-8 text-xl font-semibold leading-tight text-[#101828] sm:text-2xl',
    5: 'mb-3 mt-7 text-lg font-semibold leading-tight text-[#101828]',
    6: 'mb-3 mt-6 text-base font-semibold uppercase tracking-[.12em] text-[#667085]',
  }[block.level]

  if (block.level === 1) return <h1 className={className}>{content}</h1>
  if (block.level === 2) return <h2 className={className}>{content}</h2>
  if (block.level === 3) return <h3 className={className}>{content}</h3>
  if (block.level === 4) return <h4 className={className}>{content}</h4>
  if (block.level === 5) return <h5 className={className}>{content}</h5>
  return <h6 className={className}>{content}</h6>
}

function articlePageCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { news: 'Fordonsnyheter', breadcrumbLabel: 'Brödsmulor', preview: 'Säker förhandsvisning - sidan indexeras inte.', minutes: 'min läsning', dateLocale: 'sv-SE' },
    en: { news: 'Vehicle news', breadcrumbLabel: 'Breadcrumb', preview: 'Secure preview - this page is not indexed.', minutes: 'min read', dateLocale: 'en-GB' },
    de: { news: 'Fahrzeugnews', breadcrumbLabel: 'Breadcrumb', preview: 'Sichere Vorschau - diese Seite wird nicht indexiert.', minutes: 'Min. Lesezeit', dateLocale: 'de-DE' },
    fr: { news: 'Actualités véhicules', breadcrumbLabel: 'Fil d’Ariane', preview: 'Aperçu sécurisé - cette page n’est pas indexée.', minutes: 'min de lecture', dateLocale: 'fr-FR' },
    es: { news: 'Noticias de vehículos', breadcrumbLabel: 'Ruta de navegación', preview: 'Vista previa segura - esta página no se indexa.', minutes: 'min de lectura', dateLocale: 'es-ES' },
    it: { news: 'Notizie veicoli', breadcrumbLabel: 'Percorso', preview: 'Anteprima sicura - questa pagina non viene indicizzata.', minutes: 'min di lettura', dateLocale: 'it-IT' },
    nl: { news: 'Voertuignieuws', breadcrumbLabel: 'Broodkruimel', preview: 'Veilige preview - deze pagina wordt niet geïndexeerd.', minutes: 'min lezen', dateLocale: 'nl-NL' },
    pl: { news: 'Aktualności pojazdów', breadcrumbLabel: 'Nawigacja okruszkowa', preview: 'Bezpieczny podgląd - ta strona nie jest indeksowana.', minutes: 'min czytania', dateLocale: 'pl-PL' },
    da: { news: 'Køretøjsnyheder', breadcrumbLabel: 'Brødkrumme', preview: 'Sikker forhåndsvisning - siden indekseres ikke.', minutes: 'min læsning', dateLocale: 'da-DK' },
    fi: { news: 'Ajoneuvouutiset', breadcrumbLabel: 'Murupolku', preview: 'Turvallinen esikatselu - sivua ei indeksoida.', minutes: 'min lukuaika', dateLocale: 'fi-FI' },
  }
  return labels[language]
}

function publicLocale(market: string): 'sv' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi' | 'en' {
  const language = marketLanguage(market)
  return language === 'da' ? 'da' : language
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

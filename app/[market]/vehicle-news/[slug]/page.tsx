import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import { articleBodyText, getVehicleNewsArticle } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params, searchParams }: { params: Promise<{ market: string; slug: string }>; searchParams: Promise<{ preview?: string }> }): Promise<Metadata> {
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

export default async function VehicleNewsArticlePage({ params, searchParams }: { params: Promise<{ market: string; slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { market, slug } = await params
  const preview = (await searchParams).preview
  const result = await getVehicleNewsArticle(market, slug, preview)
  if (!result) notFound()
  const { article } = result
  const paragraphs = articleBodyText(article.body)
  const locale = market === 'se' ? 'sv' : market === 'de' ? 'de' : 'en'
  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={market.toUpperCase()} />
      {result.preview ? <div className="bg-amber-100 px-4 py-3 text-center text-sm font-bold text-amber-900">Säker förhandsvisning – sidan indexeras inte.</div> : null}
      <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-8 sm:py-16">
        <nav className="text-sm text-[#667085]" aria-label="Brödsmulor">
          <Link href={`/${market}/vehicle-news`} className="hover:text-[#0866ff]">Fordonsnyheter</Link>
          {article.category ? <> / <span>{article.category.label}</span></> : null}
        </nav>
        {article.category ? <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{article.category.label}</p> : null}
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">{article.title}</h1>
        <p className="mt-6 text-xl leading-8 text-[#475467]">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#667085]"><span>{article.author}</span><span>•</span><time>{new Date(article.publishedAt).toLocaleDateString('sv-SE')}</time><span>•</span><span>{article.readingTime} min läsning</span></div>
        {article.imageUrl ? <figure className="mt-9"><div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#edf3fb]"><Image src={article.imageUrl} alt={article.imageAlt} fill priority sizes="(min-width: 900px) 900px, 100vw" className="object-cover" /></div>{article.imageCaption ? <figcaption className="mt-3 text-sm text-[#667085]">{article.imageCaption}</figcaption> : null}</figure> : null}
        <div className="prose prose-lg mt-10 max-w-none text-[#344054]">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`} className="mb-6 text-lg leading-8">{paragraph}</p>)}</div>
        <div className="mt-10 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-[#f2f4f7] px-3 py-1.5 text-sm">{tag}</span>)}</div>
      </article>
      <NewsletterSignup locale={locale} category="vehicle-news" />
      <PublicFooter locale={locale} />
    </main>
  )
}

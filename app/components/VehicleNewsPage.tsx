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
  const locale = market === 'se' ? 'sv' : market === 'de' ? 'de' : 'en'
  const swedish = locale === 'sv'
  const hasNext = page * 12 < count
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={market.toUpperCase()} />
      <section className="border-b border-[#dbe4f0] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]">
        <div className="mx-auto w-full min-w-0 max-w-[var(--autorell-page-max)] px-5 py-12 sm:px-8 sm:py-18 lg:py-20">
          <div className="max-w-[860px]">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">Autorell insights</p>
            <h1 className="mt-4 break-words text-4xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl">
              {swedish ? 'Fordonsnyheter och guider' : 'Vehicle news and guides'}
            </h1>
            <p className="mt-5 max-w-[760px] break-words text-lg leading-8 text-[#475467]">
              {swedish
                ? 'Praktiska artiklar för dig som köper, säljer eller jämför bilar, lastbilar och lantbruksmaskiner i Europa.'
                : 'Practical articles for buying, selling and comparing cars, trucks and machinery across Europe.'}
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full min-w-0 max-w-[min(var(--autorell-page-max),calc(100vw-40px))] py-10 sm:max-w-[var(--autorell-page-max)] sm:px-8 sm:py-14">
        {unavailable ? (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>{swedish ? 'Innehållet förbereds.' : 'Content is being prepared.'}</strong>
          </div>
        ) : null}
        <VehicleNewsSearch market={market} categories={categories} articles={articles} />
        <nav className="mt-8 flex items-center justify-between" aria-label="Paginering">
          {page > 1 ? (
            <Link href={`/${market}/vehicle-news?page=${page - 1}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
              <ArrowLeft className="h-4 w-4" />
              {swedish ? 'Föregående' : 'Previous'}
            </Link>
          ) : <span />}
          {hasNext ? (
            <Link href={`/${market}/vehicle-news?page=${page + 1}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
              {swedish ? 'Nästa' : 'Next'}
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

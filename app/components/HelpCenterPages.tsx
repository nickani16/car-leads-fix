import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import {
  getCategoryArticles,
  getHelpCenterCategory,
  getPricingRows,
  getRelatedArticles,
  helpCenterArticles,
  helpCenterCategories,
  helpCenterHref,
  localizedText,
  type HelpCenterArticle,
} from '@/lib/help-center'
import { normalizeBillingMarket, type BillingMarket } from '@/lib/billing/product-catalog'
import type { PublicLocale } from '@/lib/public-i18n'

type PageProps = {
  locale: PublicLocale
  marketCode?: string
}

export function HelpCenterCategory({ locale, categorySlug }: PageProps & { categorySlug: string }) {
  const category = getHelpCenterCategory(categorySlug)
  if (!category) return null
  const articles = getCategoryArticles(category.id)
  const title = localizedText(locale, category.title)

  return (
    <div className="mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8 sm:py-14">
      <HelpBreadcrumbs
        locale={locale}
        items={[
          { label: t(locale, 'Hjälpcenter', 'Help center', 'Hilfe'), href: helpCenterHref(locale) },
          { label: title },
        ]}
      />
      <HelpSearch locale={locale} />
      <div className="mt-8 max-w-3xl">
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.035em] text-[#101828] sm:text-[48px]">{title}</h1>
        <p className="mt-3 text-base leading-7 text-[#566174]">{localizedText(locale, category.description)}</p>
      </div>
      <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} locale={locale} article={article} />
        ))}
      </div>
    </div>
  )
}

export function HelpCenterArticlePage({
  locale,
  marketCode,
  categorySlug,
  articleSlug,
}: PageProps & { categorySlug: string; articleSlug: string }) {
  const category = getHelpCenterCategory(categorySlug)
  const article = category ? helpCenterArticles.find((item) => item.category === category.id && item.slug === articleSlug) : null
  if (!category || !article) return null
  const market = normalizeBillingMarket(marketCode)
  const title = localizedText(locale, article.title)
  const related = getRelatedArticles(article)

  return (
    <div className="mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 sm:py-12">
      <HelpBreadcrumbs
        locale={locale}
        items={[
          { label: t(locale, 'Hjälpcenter', 'Help center', 'Hilfe'), href: helpCenterHref(locale) },
          { label: localizedText(locale, category.title), href: helpCenterHref(locale, category.slug) },
          { label: title },
        ]}
      />
      <HelpSearch locale={locale} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,760px)_280px] lg:items-start">
        <article className="min-w-0">
          <Link href={helpCenterHref(locale, category.slug)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0866ff]">
            <ArrowLeft className="h-4 w-4" /> {localizedText(locale, category.title)}
          </Link>
          <h1 className="mt-5 text-[34px] font-semibold leading-tight tracking-[-0.04em] text-[#101828] sm:text-[48px]">{title}</h1>
          <p className="mt-4 text-lg leading-8 text-[#475467]">{localizedText(locale, article.summary)}</p>

          <div className="mt-8 space-y-5 text-[15px] leading-8 text-[#344054]">
            {article.body.map((paragraph) => (
              <p key={paragraph.en}>{localizedText(locale, paragraph)}</p>
            ))}
          </div>

          {article.pricingTable ? <PrivatePricingTable locale={locale} market={market} /> : null}
        </article>

        <aside className="rounded-[10px] border border-[#e0e7f1] bg-white p-5 shadow-[0_14px_34px_rgba(16,24,40,.045)]">
          <h2 className="text-base font-semibold text-[#101828]">{t(locale, 'Relaterade artiklar', 'Related articles', 'Ähnliche Artikel')}</h2>
          <div className="mt-4 grid gap-3">
            {related.map((item) => {
              const relatedCategory = helpCenterCategories.find((candidate) => candidate.id === item.category)
              if (!relatedCategory) return null
              return (
                <Link key={item.slug} href={helpCenterHref(locale, relatedCategory.slug, item.slug)} className="text-sm font-medium leading-6 text-[#0866ff] hover:underline">
                  {localizedText(locale, item.title)}
                </Link>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ArticleCard({ locale, article }: { locale: PublicLocale; article: HelpCenterArticle }) {
  const category = helpCenterCategories.find((item) => item.id === article.category)
  if (!category) return null
  return (
    <Link
      href={helpCenterHref(locale, category.slug, article.slug)}
      className="group flex min-h-[148px] flex-col justify-between rounded-[8px] border border-[#dfe6f2] bg-white p-5 transition hover:border-[#0866ff] hover:shadow-[0_14px_32px_rgba(16,24,40,.06)]"
    >
      <span>
        <span className="text-sm font-semibold text-[#101828]">{localizedText(locale, article.title)}</span>
        <span className="mt-2 block text-sm leading-6 text-[#667085]">{localizedText(locale, article.summary)}</span>
      </span>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0866ff]">
        {t(locale, 'Läs mer', 'Read more', 'Mehr lesen')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function PrivatePricingTable({ locale, market }: { locale: PublicLocale; market: BillingMarket }) {
  const rows = getPricingRows(market, locale)
  return (
    <div className="mt-9 overflow-x-auto rounded-[10px] border border-[#d9e2ef] bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc] text-xs uppercase tracking-[.12em] text-[#667085]">
          <tr>
            <th className="px-4 py-3 font-semibold">{t(locale, 'Kategori', 'Category', 'Kategorie')}</th>
            <th className="px-4 py-3 font-semibold">Start</th>
            <th className="px-4 py-3 font-semibold">Standard</th>
            <th className="px-4 py-3 font-semibold">Premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.category} className="border-t border-[#edf1f7]">
              <th className="px-4 py-3 font-semibold text-[#101828]">{row.label}</th>
              <td className="px-4 py-3 font-semibold text-[#15803d]">{row.start}</td>
              <td className="px-4 py-3">{row.standard}</td>
              <td className="px-4 py-3 font-semibold">{row.premium}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HelpSearch({ locale }: { locale: PublicLocale }) {
  return (
    <form className="mt-6 flex max-w-[900px] items-center gap-3 rounded-[8px] border border-[#cfd8e7] bg-white px-4 focus-within:border-[#0866ff]">
      <Search className="h-5 w-5 shrink-0 text-[#667085]" />
      <input
        name="q"
        placeholder={t(locale, 'Sök bland frågor...', 'Search questions...', 'Fragen durchsuchen...')}
        className="h-12 w-full bg-transparent text-[#101828] outline-none placeholder:!text-[#98a2b3]"
      />
      <button type="submit" className="hidden min-h-9 rounded-[8px] bg-[#0866ff] px-5 text-xs font-semibold text-white sm:inline-flex sm:items-center">
        {t(locale, 'Sök', 'Search', 'Suchen')}
      </button>
    </form>
  )
}

function HelpBreadcrumbs({ items }: { locale: PublicLocale; items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#667085]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">›</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#0866ff] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[#344054]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function t(locale: PublicLocale, sv: string, en: string, de: string) {
  return localizedText(locale, { sv, en, de })
}

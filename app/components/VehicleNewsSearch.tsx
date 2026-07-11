'use client'

import Image from 'next/image'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'

export type VehicleNewsCategory = {
  id: string
  label: {
    sv: string
    en: string
    de: string
  }
}

export type VehicleNewsArticle = {
  id: string
  category: string
  title: {
    sv: string
    en: string
    de: string
  }
  excerpt: {
    sv: string
    en: string
    de: string
  }
  image: string
  date: string
  readTime: string
  tags: string[]
  featured?: boolean
}

type VehicleNewsSearchProps = {
  locale: PublicLocale
  categories: VehicleNewsCategory[]
  articles: VehicleNewsArticle[]
}

export default function VehicleNewsSearch({ locale, categories, articles }: VehicleNewsSearchProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const t = (sv: string, en: string, de: string) => {
    if (locale === 'sv') return sv
    if (locale === 'de') return de
    if (locale === 'en') return en
    return translatePublic(locale, en)
  }

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return articles.filter((article) => {
      const categoryMatches = activeCategory === 'all' || article.category === activeCategory
      if (!categoryMatches) return false
      if (!normalizedQuery) return true
      const haystack = [
        localizeArticleText(article.title, locale),
        localizeArticleText(article.excerpt, locale),
        ...article.tags,
      ].join(' ').toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [activeCategory, articles, locale, query])

  return (
    <section id="article-search" className="mt-9">
      <div className="flex flex-col gap-4 border-b border-[#d9e3f2] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[24px] font-[500] tracking-[-0.03em]">
            {t('Aktuellt', 'Latest', 'Aktuell')}
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-[#667085]">
            {t('Filtrera efter kategori eller sök bland artiklarna.', 'Filter by category or search the articles.', 'Nach Kategorie filtern oder Artikel durchsuchen.')}
          </p>
        </div>
        <label className="relative block w-full max-w-[360px]">
          <span className="sr-only">{t('Sök artiklar', 'Search articles', 'Artikel suchen')}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('Sök artiklar', 'Search articles', 'Artikel suchen')}
            className="h-11 w-full rounded-[8px] border border-[#cfd8e6] bg-white pl-9 pr-3 text-[14px] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          />
        </label>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const active = category.id === activeCategory
          return (
            <button
              key={category.id}
              id={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-[500] transition ${
                active
                  ? 'border-[#0866ff] bg-[#0866ff] text-white'
                  : 'border-[#d4deeb] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
              }`}
            >
              {localizeCategoryLabel(category, locale)}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-5">
        {filteredArticles.length ? (
          filteredArticles.map((article) => (
            <article key={article.id} className="grid w-full min-w-0 max-w-full gap-4 border-b border-[#e5eaf2] pb-5 last:border-b-0 md:grid-cols-[220px_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-[#edf3fb] md:aspect-auto md:min-h-[140px]">
                <Image src={article.image} alt="" fill sizes="(min-width: 768px) 220px, 100vw" className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-[500] text-[#667085]">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="mt-2 break-words text-[22px] font-[500] leading-[1.15] tracking-[-0.03em]">
                  {localizeArticleText(article.title, locale)}
                </h3>
                <p className="mt-2 max-w-[680px] break-words text-[14px] leading-6 text-[#475467]">
                  {localizeArticleText(article.excerpt, locale)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-[6px] bg-[#f2f4f7] px-2.5 py-1 text-[12px] font-[500] text-[#344054]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[8px] border border-[#d9e3f2] bg-[#f8fbff] p-6 text-[14px] text-[#475467]">
            {t('Inga artiklar matchar din sökning.', 'No articles match your search.', 'Keine Artikel passen zu Ihrer Suche.')}
          </div>
        )}
      </div>
    </section>
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

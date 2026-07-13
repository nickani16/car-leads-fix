'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PublicNewsArticle, PublicNewsCategory } from '@/lib/content/vehicle-news'

export default function VehicleNewsSearch({ market, categories, articles }: { market: string; categories: PublicNewsCategory[]; articles: PublicNewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const swedish = market === 'se'
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter((article) => {
      if (activeCategory !== 'all' && article.category?.id !== activeCategory) return false
      return !needle || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase().includes(needle)
    })
  }, [activeCategory, articles, query])

  return (
    <section id="article-search" className="mt-10 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 border-b border-[#d9e3f2] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="text-2xl font-semibold">{swedish ? 'Senaste artiklar' : 'Latest articles'}</h2><p className="mt-1 text-sm text-[#667085]">{swedish ? 'Filtrera efter kategori eller sök bland artiklarna.' : 'Filter by category or search all articles.'}</p></div>
        <label className="relative block w-full max-w-[360px]"><span className="sr-only">Sök artiklar</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={swedish ? 'Sök artiklar' : 'Search articles'} className="h-11 w-full rounded-lg border border-[#cfd8e6] pl-9 pr-3 text-sm outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10" /></label>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setActiveCategory('all')} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${activeCategory === 'all' ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d4deeb]'}`}>{swedish ? 'Alla' : 'All'}</button>
        {categories.map((category) => <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${activeCategory === category.id ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d4deeb]'}`}>{category.label}</button>)}
      </div>
      <div className="mt-7 grid gap-6">
        {filtered.map((article) => (
          <Link key={article.id} href={`/${market}/vehicle-news/${article.slug}`} className="group grid gap-4 border-b border-[#e5eaf2] pb-6 md:grid-cols-[220px_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#edf3fb] md:aspect-auto md:min-h-[145px]">{article.imageUrl ? <Image src={article.imageUrl} alt={article.imageAlt} fill sizes="(min-width: 768px) 220px, 100vw" className="object-cover transition group-hover:scale-[1.02]" /> : null}</div>
            <div><p className="text-xs text-[#667085]">{new Date(article.publishedAt).toLocaleDateString(swedish ? 'sv-SE' : 'en-GB')} · {article.readingTime} min</p><h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-.02em] group-hover:text-[#0866ff]">{article.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#475467]">{article.excerpt}</p><div className="mt-3 flex flex-wrap gap-2">{article.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-md bg-[#f2f4f7] px-2.5 py-1 text-xs">{tag}</span>)}</div></div>
          </Link>
        ))}
        {!filtered.length ? <div className="max-w-full break-words rounded-xl border border-dashed border-[#d9e3f2] p-8 text-center text-sm text-[#667085]">{swedish ? 'Inga publicerade artiklar matchar sökningen.' : 'No published articles match your search.'}</div> : null}
      </div>
    </section>
  )
}

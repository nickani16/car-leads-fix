'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Building2, ChevronDown, CreditCard, Megaphone, Search, ShieldCheck, Truck, UserRound } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  getCategoryArticles,
  helpCenterArticles,
  helpCenterCategories,
  helpCenterFilters,
  helpCenterHref,
  localizedText,
  type HelpCenterFilterId,
} from '@/lib/help-center'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

const categoryIcons = {
  advertising: Megaphone,
  account: UserRound,
  payment: CreditCard,
  business: Building2,
  safety: ShieldCheck,
  export: Truck,
}

const popularSearches = [
  { label: { sv: 'Skapa annons', en: 'Create listing', de: 'Anzeige erstellen' }, href: helpCenterHref('sv', 'advertising', 'create-listing'), filter: 'listings' },
  { label: { sv: 'Betalning', en: 'Payment', de: 'Zahlung' }, href: helpCenterHref('sv', 'payment'), filter: 'pricing' },
  { label: { sv: 'Verifiering', en: 'Verification', de: 'Verifizierung' }, href: helpCenterHref('sv', 'safety', 'business-verification'), filter: 'safety' },
  { label: { sv: 'Export', en: 'Export', de: 'Export' }, href: helpCenterHref('sv', 'export-transport'), filter: 'export' },
] as const

const filterToCategory = {
  all: null,
  account: 'account',
  listings: 'advertising',
  buying: 'safety',
  export: 'export',
  pricing: 'payment',
  messages: 'safety',
  safety: 'safety',
  business: 'business',
  language: 'account',
} as const

export default function FaqPageClient({ locale: providedLocale }: { locale?: PublicLocale }) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const [filter, setFilter] = useState<HelpCenterFilterId>('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>('passwordless-login')
  const translate = (sv: string, en = sv, de = en) => localizedText(locale, { sv, en, de })

  const query = search.trim().toLocaleLowerCase(locale === 'sv' ? 'sv' : 'en')
  const filteredArticles = useMemo(() => {
    const category = filterToCategory[filter]
    return helpCenterArticles.filter((article) => {
      const categoryMatch = !category || article.category === category
      const articleText = [
        localizedText(locale, article.title),
        localizedText(locale, article.summary),
        article.keywords.join(' '),
      ].join(' ')
      const searchMatch = !query || articleText.toLocaleLowerCase(locale === 'sv' ? 'sv' : 'en').includes(query)
      return categoryMatch && searchMatch
    })
  }, [filter, locale, query])

  const selectFilter = (nextFilter: HelpCenterFilterId) => {
    setFilter(nextFilter)
    setSearch('')
    const category = filterToCategory[nextFilter]
    setOpen(category ? getCategoryArticles(category)[0]?.slug || null : helpCenterArticles[0]?.slug || null)
  }

  return (
    <>
      <section className="mx-auto max-w-[900px]">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#101828] sm:text-4xl">
          {translate('Hej, vad kan vi hjälpa dig med?', 'Hi, what can we help you with?', 'Hallo, womit können wir helfen?')}
        </h1>

        <form
          id="faq-search"
          className="mt-5 flex scroll-mt-28 items-center gap-3 rounded-[8px] border border-[#cfd8e7] bg-white px-4 focus-within:border-[#0866ff]"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search className="h-5 w-5 shrink-0 text-[#667085]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={translate('Sök bland frågor...', 'Search questions...', 'Fragen durchsuchen...')}
            className="h-13 w-full min-w-0 bg-transparent text-[#101828] outline-none placeholder:!text-[#98a2b3] [&::placeholder]:!text-[#98a2b3]"
          />
          <button type="submit" className="hidden min-h-9 rounded-[8px] bg-[#0866ff] px-5 text-xs font-semibold text-white transition hover:bg-[#0054d8] sm:inline-flex sm:items-center">
            {translate('Sök', 'Search', 'Suchen')}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-[#344054]">{translate('Många söker på', 'Many search for', 'Häufig gesucht')}</span>
          {popularSearches.map((item) => (
            <button
              key={item.label.en}
              type="button"
              onClick={() => selectFilter(item.filter)}
              className="rounded-[8px] border border-[#d8d7e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {localizedText(locale, item.label)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {helpCenterCategories.map((category) => {
            const Icon = categoryIcons[category.id]
            const isSelected = filterToCategory[filter] === category.id
            return (
              <Link
                key={category.id}
                href={helpCenterHref(locale, category.slug)}
                className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-[8px] border px-4 text-center transition ${
                  isSelected ? 'border-[#0866ff] bg-[#f1f6ff]' : 'border-[#dfe6f2] bg-white hover:border-[#0866ff]'
                }`}
              >
                <Icon className="h-6 w-6 text-[#0866ff]" />
                <span className="text-sm font-semibold text-[#101828]">{localizedText(locale, category.title)}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {helpCenterFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectFilter(item.id)}
            className={`shrink-0 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition ${
              filter === item.id ? 'bg-[#0866ff] text-white' : 'border border-[#d8d7e1] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
            }`}
          >
            {localizedText(locale, item.title)}
          </button>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-[#101828]">{translate('Det här undrar folk ofta över:', 'People often ask about this:', 'Das fragen Nutzer häufig:')}</h2>
        <span className="text-xs font-semibold text-[#667085]">{filteredArticles.length} / {helpCenterArticles.length}</span>
      </div>

      <div className="mt-3 grid gap-2">
        {filteredArticles.map((article) => {
          const question = localizedText(locale, article.title)
          const isOpen = open === article.slug
          const category = helpCenterCategories.find((item) => item.id === article.category)
          return (
            <div key={article.slug} className="rounded-[8px] border border-[#e5ebf3] bg-[#f7f8fa]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : article.slug)}
                className="flex w-full items-center justify-between gap-5 px-4 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold leading-6 text-[#101828]">{question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="border-t border-white px-4 pb-5 pt-3">
                    <p className="text-sm leading-7 text-[#566174]">{localizedText(locale, article.summary)}</p>
                    {category ? (
                      <Link href={helpCenterHref(locale, category.slug, article.slug)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0866ff]">
                        {translate('Läs hela artikeln', 'Read the full article', 'Ganzen Artikel lesen')} <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="mt-8 rounded-[8px] border border-[#dfe6f2] py-14 text-center">
          <p className="text-[#626d76]">{translate('Vi hittade ingen fråga som matchade din sökning.', 'No question matched your search.', 'Keine Frage passt zu Ihrer Suche.')}</p>
        </div>
      )}

      <div className="mt-10 overflow-hidden rounded-[12px] border border-[#b8cdfd] bg-[#fbfdff] p-6 sm:p-8">
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 md:max-w-[560px]">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#101828]">{translate('Behöver du fortfarande hjälp?', 'Still need help?', 'Brauchen Sie noch Hilfe?')}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#566174]">
              {translate('Skicka in problemet med annons-ID, betalningsreferens eller den e-postadress kontot gäller.', 'Send the issue with listing ID, payment reference or the email address for the account.', 'Senden Sie das Problem mit Anzeigen-ID, Zahlungsreferenz oder der E-Mail-Adresse des Kontos.')}
            </p>
            <Link href={localizePublicHref(locale, '/report')} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#0054d8] sm:w-auto sm:justify-start">
              {translate('Rapportera problem', 'Report a problem', 'Problem melden')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex shrink-0 justify-center md:w-[260px] lg:w-[300px]">
            <Image
              src="/help-center-towing.svg"
              alt=""
              width={280}
              height={180}
              className="h-auto w-full max-w-[220px] sm:max-w-[250px] md:max-w-[280px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </>
  )
}

function localeFromPathname(pathname: string): PublicLocale {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first === 'se') return 'sv'
  if (first === 'de') return 'de'
  if (first === 'at') return 'at'
  if (first === 'be') return 'be'
  if (first === 'pl' || first === 'fr' || first === 'es' || first === 'it' || first === 'nl' || first === 'fi') return first
  if (first === 'dk') return 'da'
  return 'en'
}

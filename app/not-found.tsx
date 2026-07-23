import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  CarFront,
  Home,
  Search,
  Truck,
} from 'lucide-react'
import PublicFooter from './components/PublicFooter'
import PublicHeader from './components/PublicHeader'
import {
  getNotFoundCopy,
  type NotFoundLanguage,
} from '@/lib/not-found-copy'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'

export const metadata: Metadata = {
  title: 'Page not found | Autorell',
  robots: {
    index: false,
    follow: false,
  },
}

const popularRoutes = [
  { key: 'cars', href: '/marketplace/cars', icon: CarFront },
  { key: 'vans', href: '/marketplace/vans', icon: Truck },
  { key: 'motorcycles', href: '/marketplace/motorcycles', icon: CarFront },
  { key: 'companies', href: '/business', icon: Building2 },
  { key: 'sell', href: '/account/listings/new', icon: ArrowRight },
] as const

const localeByPathPrefix: Record<string, PublicLocale> = {
  se: 'sv',
  de: 'de',
  at: 'at',
  be: 'be',
  fr: 'fr',
  es: 'es',
  it: 'it',
  pl: 'pl',
  nl: 'nl',
  fi: 'fi',
  dk: 'da',
}

const marketCodeByLocale: Record<PublicLocale, string> = {
  en: 'EU',
  sv: 'SE',
  de: 'DE',
  at: 'AT',
  be: 'BE',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
  pl: 'PL',
  nl: 'NL',
  fi: 'FI',
  da: 'DK',
}

function getLocaleFromPathname(pathname: string | null): PublicLocale | null {
  if (!pathname) return null
  let parsedPathname = pathname
  try {
    parsedPathname = new URL(pathname).pathname
  } catch {
    // Header already contains a pathname.
  }
  const prefix = parsedPathname.split('/').filter(Boolean)[0]
  return prefix ? localeByPathPrefix[prefix] || null : null
}

function getHeaderPathLocale(requestHeaders: Headers): PublicLocale | null {
  const candidates = [
    requestHeaders.get('x-autorell-pathname'),
    requestHeaders.get('x-invoke-path'),
    requestHeaders.get('x-matched-path'),
    requestHeaders.get('x-next-url'),
    requestHeaders.get('next-url'),
    requestHeaders.get('x-original-url'),
    requestHeaders.get('x-rewrite-url'),
    requestHeaders.get('referer'),
  ]

  for (const candidate of candidates) {
    const locale = getLocaleFromPathname(candidate)
    if (locale) return locale
  }

  return null
}

export default async function NotFound() {
  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const headerPathLocale = getHeaderPathLocale(requestHeaders)
  const cookieLanguage = cookieStore.get('autorell-language')?.value
  const cookieMarket = cookieStore.get('autorell-market')?.value
  const fallbackLanguage: NotFoundLanguage = hostname.endsWith('autorell.de')
    ? 'de'
    : hostname.endsWith('autorell.com')
      ? 'en'
      : 'sv'
  const locale: PublicLocale =
    requestedLanguage && isPublicLanguage(requestedLanguage)
      ? requestedLanguage
      : headerPathLocale
        ? headerPathLocale
      : cookieLanguage === 'sv' || cookieLanguage === 'de' || isPublicLanguage(cookieLanguage || '')
        ? (cookieLanguage as PublicLocale)
        : cookieMarket === 'sv'
          ? 'sv'
          : cookieMarket === 'de'
            ? 'de'
            : fallbackLanguage
  const copy = getNotFoundCopy(locale)

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#111827]">
      <PublicHeader locale={locale} marketCode={marketCodeByLocale[locale]} />

      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-16">
        <div className="overflow-hidden rounded-[24px] border border-[#dbe4f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,.07)]">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0866ff]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,5.75rem)] font-semibold leading-[.98] tracking-[-.055em] text-[#101828]">
                {copy.heading}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#536176] sm:text-lg">
                {copy.description}
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <Link
                  href={localizePublicHref(locale, '/marketplace')}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(8,102,255,.22)]"
                >
                  <Search className="h-5 w-5" />
                  {copy.marketplace}
                </Link>
                <Link
                  href={localizePublicHref(locale, '/')}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[14px] border border-[#cfd8e8] bg-white px-6 text-sm font-semibold text-[#122033]"
                >
                  <Home className="h-5 w-5" />
                  {copy.home}
                </Link>
                <Link
                  href={localizePublicHref(locale, '/account')}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[14px] border border-[#cfd8e8] bg-white px-6 text-sm font-semibold text-[#122033]"
                >
                  {copy.account}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="flex items-start lg:justify-end">
              <div className="rounded-[22px] border border-[#dce7f7] bg-[#f0f6ff] p-5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#0866ff] shadow-sm">
                  <Search className="h-6 w-6" />
                </span>
                <strong className="mt-5 block text-5xl font-semibold tracking-[-.07em]">
                  404
                </strong>
                <p className="mt-2 text-sm font-medium text-[#64748b]">
                  {copy.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[24px] border border-[#dbe4f0] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,.05)] sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-.03em]">
            {copy.popularTitle}
          </h2>
          <div className="mt-4 grid gap-2">
            {popularRoutes.map((route) => {
              const Icon = route.icon
              const label = copy[route.key]
              return (
                <Link
                  key={route.href}
                  href={localizePublicHref(locale, route.href)}
                  className="group flex min-h-14 items-center justify-between rounded-[14px] border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#122033] transition hover:border-[#0866ff] hover:bg-[#f8fbff]"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5ff] text-[#0866ff]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#94a3b8] transition group-hover:text-[#0866ff]" />
                </Link>
              )
            })}
          </div>
        </aside>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

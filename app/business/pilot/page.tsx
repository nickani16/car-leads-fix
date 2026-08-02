import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  Store,
  Wrench,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import BusinessPilotApplicationForm from './BusinessPilotApplicationForm'
import { getBusinessPilotCopy } from '@/lib/business-pilot-i18n'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { ACTIVE_MARKET_COUNTRIES, getEuCountryName } from '@/lib/eu-countries'
import { defaultSearchCountryForLocale, marketForLocale } from '@/lib/market-locale'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getBusinessPilotCopy(locale).pilotPage
  const canonicalPath = headerStore.get('x-autorell-pathname') || '/business/pilot'

  return {
    title: { absolute: cleanSeoText(copy.metaTitle, 65) },
    description: cleanSeoText(copy.metaDescription, 155),
    alternates: { canonical: `https://www.autorell.com${canonicalPath}` },
  }
}

export default async function BusinessPilotPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
} = {}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const market = marketForLocale(locale)
  const marketCode = String(
    marketCodeOverride || headerStore.get('x-autorell-market') || market.pathCode || 'en',
  ).toLowerCase()

  if (!await isBusinessFeatureEnabled('business_pilot_program', { marketCode })) notFound()

  const copy = getBusinessPilotCopy(locale)
  const applicationHref = '#application'
  const inventoryHref = localizePublicHref(locale, '/business/inventory-import')
  const privacyHref = localizePublicHref(locale, '/privacy')
  const countries = ACTIVE_MARKET_COUNTRIES
    .map(([value]) => ({ value, label: getEuCountryName(value, locale) }))
    .sort((left, right) => left.label.localeCompare(right.label, locale))

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode.toUpperCase()} />

      <section className="relative isolate min-h-[520px] overflow-hidden border-b border-[#d9e4f1] bg-[#eaf2fb] px-5 py-12 sm:px-8 sm:py-14">
        <Image
          src="/business-responsive-mockup.webp"
          alt=""
          width={1920}
          height={1080}
          priority
          className="pointer-events-none absolute bottom-[-40px] right-[-330px] -z-10 w-[950px] max-w-none opacity-20 sm:right-[-260px] sm:w-[1100px] sm:opacity-45 lg:right-[-380px] lg:w-[1250px] lg:opacity-55"
        />
        <div className="mx-auto flex min-h-[390px] w-full max-w-[1120px] items-center">
          <div className="max-w-[660px]">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">{copy.pilotPage.heroEyebrow}</p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[1.06] text-[#101828] sm:text-[64px]">
              {copy.pilotPage.heroTitle}
            </h1>
            <p className="mt-6 max-w-[610px] text-lg leading-8 text-[#344054]">{copy.pilotPage.heroIntro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={applicationHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#0057df]"
              >
                {copy.pilotPage.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={inventoryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#667085] bg-white px-6 text-sm font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.pilotPage.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="max-w-[680px]">
            <h2 className="text-[34px] font-semibold leading-tight text-[#101828] sm:text-5xl">{copy.pilotPage.includedTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#667085]">{copy.pilotPage.includedIntro}</p>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-[8px] border border-[#dce4ee] bg-[#dce4ee] sm:grid-cols-2 lg:grid-cols-3">
            {copy.pilotPage.included.map((item, index) => {
              const Icon = [Store, Wrench, RefreshCw, FileCheck2, BarChart3, ShieldCheck][index % 6]
              return (
                <li key={item} className="min-h-[150px] bg-white p-6">
                  <Icon className="h-6 w-6 text-[#0866ff]" strokeWidth={1.8} aria-hidden="true" />
                  <p className="mt-5 text-base font-semibold leading-6 text-[#344054]">{item}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#e2e8f0] bg-[#f7f9fc] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-[1120px]">
          <h2 className="text-[34px] font-semibold leading-tight text-[#101828] sm:text-5xl">{copy.pilotPage.stepsTitle}</h2>
          <ol className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-5">
            {copy.pilotPage.steps.map((step, index) => (
              <li key={step.title} className="border-t-2 border-[#0866ff] pt-5">
                <span className="font-mono text-sm font-semibold text-[#0866ff]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-lg font-semibold leading-6 text-[#101828]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-[8px] bg-[#eaf7ef] text-[#16794a]">
            <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[34px] font-semibold leading-tight text-[#101828] sm:text-5xl">{copy.pilotPage.afterTitle}</h2>
            <p className="mt-5 text-lg font-semibold leading-8 text-[#344054]">{copy.pilotPage.afterLead}</p>
            <p className="mt-4 text-base leading-7 text-[#667085]">{copy.pilotPage.afterBody}</p>
            <p className="mt-5 flex items-start gap-3 rounded-[8px] border border-[#b7dfc6] bg-[#f0fbf4] p-4 text-sm font-semibold leading-6 text-[#245b3d]">
              <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {copy.pilotPage.afterNote}
            </p>
          </div>
        </div>
      </section>

      <section id="application" className="scroll-mt-20 border-y border-[#e2e8f0] bg-[#f4f7fb] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-[920px]">
          <BusinessPilotApplicationForm
            copy={copy.form}
            locale={locale}
            marketCode={marketCode}
            countries={countries}
            defaultCountry={defaultSearchCountryForLocale(locale)}
            privacyHref={privacyHref}
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-[920px]">
          <h2 className="text-[34px] font-semibold leading-tight text-[#101828] sm:text-5xl">{copy.pilotPage.faqTitle}</h2>
          <div className="mt-10 divide-y divide-[#d0d5dd] border-y border-[#d0d5dd]">
            {copy.pilotPage.faqs.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-lg font-semibold text-[#101828]">
                  <span>{item.question}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#98a2b3] text-[#475467] group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-[760px] pb-7 text-base leading-7 text-[#667085]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'en'
}

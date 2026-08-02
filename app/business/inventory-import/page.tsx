import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, Check, Code2, Database, FileSpreadsheet, Globe2, ServerCog, ShieldCheck } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { getInventoryImportCopy } from '@/lib/inventory-import-i18n'
import { marketForLocale } from '@/lib/market-locale'
import { cleanSeoText } from '@/lib/market-seo'
import { isPublicLanguage, localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getInventoryImportCopy(locale).publicPage
  const canonicalPath = headerStore.get('x-autorell-pathname') || '/business/inventory-import'
  return {
    title: { absolute: cleanSeoText(copy.metaTitle, 65) },
    description: cleanSeoText(copy.metaDescription, 155),
    alternates: { canonical: `https://www.autorell.com${canonicalPath}` },
  }
}

export default async function InventoryImportPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
} = {}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const market = marketForLocale(locale)
  const marketCode = String(marketCodeOverride || headerStore.get('x-autorell-market') || market.pathCode || 'en').toLowerCase()
  if (!await isBusinessFeatureEnabled('business_pilot_program', { marketCode })) notFound()

  const copy = getInventoryImportCopy(locale).publicPage
  const pilotHref = `${localizePublicHref(locale, '/business/pilot')}#application`
  const contactHref = localizePublicHref(locale, '/contact')
  const methodIcons = [Globe2, Database, FileSpreadsheet, Code2, ServerCog]

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode.toUpperCase()} />

      <section className="relative isolate min-h-[520px] overflow-hidden border-b border-[#d7e0eb] bg-[#edf3f9] px-5 py-12 sm:px-8 sm:py-14">
        <Image src="/dealer-macbook.webp" alt="" width={1600} height={1000} priority className="pointer-events-none absolute bottom-[-55px] right-[-350px] -z-10 w-[1020px] max-w-none opacity-20 sm:right-[-250px] sm:opacity-45 lg:right-[-300px] lg:w-[1120px] lg:opacity-60" />
        <div className="mx-auto flex min-h-[390px] w-full max-w-[1120px] items-center">
          <div className="max-w-[670px]">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[1.06] text-[#101828] sm:text-[64px]">{copy.title}</h1>
            <p className="mt-6 max-w-[640px] text-lg leading-8 text-[#344054]">{copy.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={pilotHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#0057df]">
                {copy.primaryCta}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={contactHref} className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#667085] bg-white px-6 text-sm font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="max-w-[720px]">
            <h2 className="text-[34px] font-semibold leading-tight sm:text-5xl">{copy.methodsTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#667085]">{copy.methodsIntro}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[8px] border border-[#dce4ee] bg-[#dce4ee] md:grid-cols-2 lg:grid-cols-5">
            {copy.methods.map((method, index) => {
              const Icon = methodIcons[index]
              return (
                <article key={method.key} className="min-h-[260px] bg-white p-6">
                  <Icon className="h-7 w-7 text-[#0866ff]" strokeWidth={1.8} aria-hidden="true" />
                  {method.status ? <p className="mt-6 text-xs font-semibold uppercase tracking-[.1em] text-[#475467]">{method.status}</p> : null}
                  <h3 className="mt-2 text-lg font-semibold">{method.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667085]">{method.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e2e8f0] bg-[#f7f9fc] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid w-full max-w-[1120px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <h2 className="text-[34px] font-semibold leading-tight sm:text-5xl">{copy.syncTitle}</h2>
            <p className="mt-5 text-base leading-7 text-[#667085]">{copy.syncIntro}</p>
          </div>
          <ul className="divide-y divide-[#d7e0eb] border-y border-[#d7e0eb]">
            {copy.syncRules.map((rule) => (
              <li key={rule} className="flex min-h-[74px] items-center gap-3 py-4 text-sm font-semibold leading-6 text-[#344054]">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eaf7ef] text-[#16794a]"><Check className="h-4 w-4" aria-hidden="true" /></span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto flex w-full max-w-[920px] flex-col items-start gap-6 border-l-4 border-[#0866ff] pl-6 sm:flex-row sm:items-center sm:pl-8">
          <ShieldCheck className="h-10 w-10 shrink-0 text-[#0866ff]" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{copy.safetyTitle}</h2>
            <p className="mt-3 text-base leading-7 text-[#667085]">{copy.safetyBody}</p>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested) ? requested : 'en'
}

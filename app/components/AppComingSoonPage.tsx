import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BellRing, CarFront, MapPin, Smartphone, Sparkles } from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import { getAppDownloadCopy } from '@/lib/app-download'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

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

export default function AppComingSoonPage({
  locale,
  marketCode,
}: {
  locale: PublicLocale
  marketCode?: string
}) {
  const copy = getAppDownloadCopy(locale)

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode || marketCodeByLocale[locale]} />

      <section className="mx-auto grid max-w-[1220px] gap-5 px-5 py-6 sm:gap-6 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch lg:px-10 lg:py-16">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e5f5] bg-white shadow-[0_24px_80px_rgba(15,23,42,.06)]">
          <div className="relative bg-[#eff6ff] p-6 sm:min-h-[520px] sm:p-10 lg:p-12">
            <div className="absolute -left-20 top-20 h-64 w-64 rounded-full border-[42px] border-[#cfe2ff]/70" />
            <div className="absolute -right-16 bottom-10 h-56 w-56 rounded-full border-[36px] border-[#dcecff]/75" />

            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-[#0866ff]">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[#cce0ff] bg-white text-[#0866ff]">
                  <Sparkles className="h-4 w-4" />
                </span>
                {copy.pageEyebrow}
              </p>

              <h1 className="mt-6 max-w-3xl text-[clamp(2.45rem,6vw,5.4rem)] font-semibold leading-[.98] tracking-[-.055em]">
                {copy.pageTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#475467] sm:text-lg sm:leading-8">
                {copy.pageDescription}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={localizePublicHref(locale, '/marketplace')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#075ce6] active:scale-[.99]"
                >
                  {copy.marketplaceCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={localizePublicHref(locale, '/')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#cbd7e8] bg-white px-5 text-sm font-semibold text-[#122033] transition hover:border-[#0866ff] hover:text-[#0866ff]"
                >
                  {copy.homeCta}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[24px] border border-[#d9e5f5] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,.05)] sm:p-8">
          <div className="autorell-app-visual mx-auto">
            <div className="autorell-app-phone">
              <div className="autorell-app-phone-top" />
              <div className="autorell-app-road">
                <span className="autorell-app-pin">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="autorell-app-car">
                  <CarFront className="h-7 w-7" />
                </span>
              </div>
              <div className="autorell-app-panel">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[18px] border border-[#dce7f7] bg-[#f8fbff] p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#0866ff] shadow-sm">
                <BellRing className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">
                  {copy.statusLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#475467]">
                  {copy.statusText}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-[#101828]">{copy.footerLabel}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Image src="/app-store.svg" alt={copy.appStoreAlt} width={120} height={41} className="h-[40px] w-auto" />
              <Image src="/google-play.svg" alt={copy.googlePlayAlt} width={120} height={41} className="h-[40px] w-auto" />
            </div>
          </div>

          <div className="pointer-events-none absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-full bg-[#eef6ff] text-[#0866ff]">
            <Smartphone className="h-5 w-5" />
          </div>
        </aside>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

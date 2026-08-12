import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

      <section className="mx-auto flex min-h-[62vh] w-full max-w-[900px] items-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="w-full border-y border-[#dbe4f0] py-12 sm:py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0866ff]">
            {copy.pageEyebrow}
          </p>
          <h1 className="mt-5 max-w-[760px] text-[38px] font-semibold leading-[1.04] text-[#101828] sm:text-[58px]">
            {copy.pageTitle}
          </h1>
          <p className="mt-6 max-w-[680px] text-[16px] leading-8 text-[#475467] sm:text-[18px]">
            {copy.pageDescription}
          </p>
          <p className="mt-7 max-w-[680px] text-[15px] font-medium leading-7 text-[#344054]">
            <span className="text-[#0866ff]">{copy.statusLabel}:</span>{' '}
            {copy.statusText}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={localizePublicHref(locale, '/marketplace')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#075be5]"
            >
              {copy.marketplaceCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={localizePublicHref(locale, '/')}
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#b8c5d8] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {copy.homeCta}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

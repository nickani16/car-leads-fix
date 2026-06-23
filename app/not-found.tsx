import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import BrandLogo from './components/BrandLogo'
import {
  getNotFoundCopy,
  type NotFoundLanguage,
} from '@/lib/not-found-copy'
import { isPublicLanguage } from '@/lib/public-i18n'

export default async function NotFound() {
  const requestHeaders = await headers()
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
  const fallbackLanguage: NotFoundLanguage = hostname.endsWith('autorell.de')
    ? 'de'
    : hostname.endsWith('autorell.com')
      ? 'en'
      : 'sv'
  const language =
    requestedLanguage &&
    isPublicLanguage(requestedLanguage)
      ? (requestedLanguage as NotFoundLanguage)
      : fallbackLanguage
  const copy = getNotFoundCopy(language)
  const actionHref = '/cars'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f4ef] text-[#202124]">
      <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border-[70px] border-[#B4D9EF]/55" />
      <div className="absolute -bottom-48 -left-32 h-[460px] w-[460px] rounded-full border-[75px] border-white" />

      <header className="relative z-10 mx-auto flex h-24 max-w-[1320px] items-center px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label={copy.homeAria}>
          <BrandLogo />
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-[1320px] content-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#66747d]">
            Error 404
          </p>
          <h1 className="mt-6 max-w-3xl text-[52px] leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[92px]">
            {copy.heading}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#5d6c74] sm:text-lg sm:leading-8">
            {copy.description}
          </p>
          <div className="mt-9 grid gap-3 sm:flex">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#242424] px-7 text-white sm:rounded-full"
            >
              <ArrowLeft size={18} />
              {copy.home}
            </Link>
            <Link
              href={actionHref}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#B4D9EF] px-7 text-[#242424] sm:rounded-full"
            >
              {copy.action}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center">
          <div className="absolute inset-0 rounded-full bg-white shadow-[0_35px_90px_rgba(32,33,36,.09)]" />
          <div className="absolute inset-[13%] rounded-full border border-[#d9e8f1]" />
          <div className="relative text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#B4D9EF]">
              <Search size={26} />
            </span>
            <strong className="mt-6 block text-[88px] leading-none tracking-[-0.08em]">
              404
            </strong>
            <span className="mt-3 block text-sm text-[#6b7479]">
              {copy.label}
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

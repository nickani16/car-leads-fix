import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Check,
  ChevronDown,
  Globe2,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import LocalizedVehicleForm from './LocalizedVehicleForm'
import SocialIcons from './SocialIcons'
import {
  customerHref,
  customerLocales,
  getCustomerCopy,
  type CustomerLocale,
  type CustomerPageKey,
} from '@/lib/customer-i18n'

export default function LocalizedCustomerSite({
  locale,
  page,
}: {
  locale: CustomerLocale
  page?: CustomerPageKey
}) {
  const copy = getCustomerCopy(locale)

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f3] text-[#202124]">
      <header className="border-b border-[#deddd8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[88px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <Link href={customerHref(locale, '')} aria-label="Autorell">
            <BrandLogo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink locale={locale} page="sell-car" label={copy.nav[0]} />
            <NavLink locale={locale} page="how-it-works" label={copy.nav[1]} />
            <NavLink locale={locale} page="about" label={copy.nav[2]} />
            <NavLink locale={locale} page="faq" label={copy.nav[3]} />
            <NavLink locale={locale} page="contact" label={copy.nav[4]} />
          </nav>
          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7deda] bg-white px-4 text-sm [&::-webkit-details-marker]:hidden">
              <Globe2 className="h-4 w-4" />
              {copy.language}
              <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-50 w-[min(720px,calc(100vw-24px))] pt-3">
              <div className="grid max-h-[70vh] gap-1 overflow-y-auto rounded-[22px] border border-[#dfe5e8] bg-white p-4 shadow-[0_30px_80px_rgba(32,33,36,.16)] sm:grid-cols-2 lg:grid-cols-3">
                <a href="https://www.autorell.se/" className="rounded-xl px-3 py-2.5 hover:bg-[#f2f6f7]">Svenska</a>
                <a href="https://www.autorell.de/" className="rounded-xl px-3 py-2.5 hover:bg-[#f2f6f7]">Deutsch</a>
                {customerLocales.map((item) => (
                  <a
                    key={item}
                    href={`${customerHref(item, page || '')}?language=${item}`}
                    className={`rounded-xl px-3 py-2.5 hover:bg-[#f2f6f7] ${item === locale ? 'bg-[#edf6fa]' : ''}`}
                  >
                    {getCustomerCopy(item).language}
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-[#eceae5] px-4 py-2 lg:hidden">
          <NavLink locale={locale} page="sell-car" label={copy.nav[0]} />
          <NavLink locale={locale} page="how-it-works" label={copy.nav[1]} />
          <NavLink locale={locale} page="about" label={copy.nav[2]} />
          <NavLink locale={locale} page="faq" label={copy.nav[3]} />
          <NavLink locale={locale} page="contact" label={copy.nav[4]} />
        </nav>
      </header>

      {!page ? <Home locale={locale} /> : <Page locale={locale} page={page} />}

      <footer className="border-t border-[#d9d7d0] bg-[#f3f2ee]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <BrandLogo />
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#666864]">{copy.footer}</p>
            </div>
            <div className="grid content-start gap-3 text-sm">
              <NavLink locale={locale} page="sell-car" label={copy.nav[0]} />
              <NavLink locale={locale} page="how-it-works" label={copy.nav[1]} />
              <NavLink locale={locale} page="about" label={copy.nav[2]} />
              <NavLink locale={locale} page="contact" label={copy.nav[4]} />
            </div>
            <div className="grid content-start gap-3 text-sm">
              <NavLink locale={locale} page="privacy" label={copy.pages.privacy[0]} />
              <NavLink locale={locale} page="cookies" label={copy.pages.cookies[0]} />
              <NavLink locale={locale} page="terms" label={copy.pages.terms[0]} />
              <NavLink locale={locale} page="gdpr" label={copy.pages.gdpr[0]} />
              <SocialIcons className="pt-3" />
            </div>
          </div>
          <p className="mt-10 border-t border-[#d9d7d0] pt-6 text-xs text-[#858681]">
            © {new Date().getFullYear()} Autorell AB
          </p>
        </div>
      </footer>
    </main>
  )
}

function NavLink({
  locale,
  page,
  label,
}: {
  locale: CustomerLocale
  page: CustomerPageKey
  label: string
}) {
  return (
    <Link
      href={customerHref(locale, page)}
      className="shrink-0 rounded-full px-4 py-3 text-sm transition hover:bg-white/70"
    >
      {label}
    </Link>
  )
}

function Home({ locale }: { locale: CustomerLocale }) {
  const copy = getCustomerCopy(locale)
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#dce5e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_58%,#dcecf3_100%)]">
        <div className="absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full border-[72px] border-white/50" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#547382]">{copy.hero[0]}</p>
          <h1 className="mt-7 max-w-5xl text-[48px] leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[86px]">{copy.hero[1]}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#58707c]">{copy.hero[2]}</p>
          <Link href={customerHref(locale, 'sell-car')} className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white">
            {copy.nav[0]} <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {copy.trust.map((item) => <p key={item} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 p-4 text-sm"><Check className="h-4 w-4 text-[#4f8298]" />{item}</p>)}
          </div>
        </div>
      </section>
      <Process locale={locale} />
    </>
  )
}

function Process({ locale }: { locale: CustomerLocale }) {
  const copy = getCustomerCopy(locale)
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
        <h2 className="max-w-3xl text-4xl tracking-[-0.05em] sm:text-5xl">{copy.pages['how-it-works'][0]}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.process.map((item, index) => (
            <article key={item} className="rounded-[22px] border border-[#e0e6e8] bg-[#fafbf9] p-6">
              <span className="text-xs text-[#6d8b98]">0{index + 1}</span>
              <h3 className="mt-8 text-xl tracking-[-0.03em]">{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Page({ locale, page }: { locale: CustomerLocale; page: CustomerPageKey }) {
  const copy = getCustomerCopy(locale)
  const [title, intro] = copy.pages[page]
  const isLegal = page === 'privacy' || page === 'cookies' || page === 'terms' || page === 'gdpr'

  return (
    <>
      <section className="border-b border-[#dce5e8] bg-[linear-gradient(145deg,#fbf8f1,#e7f2f6)]">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <h1 className="max-w-4xl text-[46px] leading-[1] tracking-[-0.055em] sm:text-7xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#58707c]">{intro}</p>
        </div>
      </section>

      {page === 'sell-car' ? (
        <section className="mx-auto max-w-[980px] px-5 py-16 sm:px-8 sm:py-24"><LocalizedVehicleForm locale={locale} /></section>
      ) : page === 'how-it-works' ? (
        <Process locale={locale} />
      ) : page === 'faq' ? (
        <section className="mx-auto max-w-[980px] space-y-3 px-5 py-16 sm:px-8 sm:py-24">
          {copy.faq.map(([question, answer]) => <details key={question} className="rounded-[18px] border border-[#deddd7] bg-white p-6"><summary className="cursor-pointer text-xl font-medium">{question}</summary><p className="mt-4 leading-7 text-[#68767c]">{answer}</p></details>)}
        </section>
      ) : page === 'contact' ? (
        <section className="mx-auto max-w-[900px] px-5 py-20 text-center sm:px-8">
          <Mail className="mx-auto h-8 w-8 text-[#4f8298]" />
          <a href="mailto:info@autorell.com" className="mt-6 block text-3xl tracking-[-0.04em]">info@autorell.com</a>
        </section>
      ) : isLegal ? (
        <section className="mx-auto max-w-[980px] space-y-4 px-5 py-16 sm:px-8 sm:py-24">
          {copy.legal.map((paragraph, index) => <article key={paragraph} className="rounded-[20px] border border-[#deddd7] bg-white p-7"><div className="flex gap-4"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#4f8298]" /><p className="leading-7 text-[#5f6e75]">{paragraph}</p></div><span className="mt-5 block text-xs text-[#9aa3a6]">0{index + 1}</span></article>)}
        </section>
      ) : (
        <section className="mx-auto grid max-w-[1100px] gap-4 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-3">
          {[BadgeCheck, CarFront, ShieldCheck].map((Icon, index) => <article key={index} className="rounded-[22px] border border-[#deddd7] bg-white p-7"><Icon className="h-6 w-6 text-[#4f8298]" /><h2 className="mt-7 text-xl">{copy.trust[index]}</h2><p className="mt-4 text-sm leading-7 text-[#68767c]">{copy.hero[2]}</p></article>)}
        </section>
      )}
    </>
  )
}

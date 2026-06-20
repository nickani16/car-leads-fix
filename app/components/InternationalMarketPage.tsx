import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  CircleHelp,
  FileCheck2,
  Gauge,
  Gavel,
  Globe2,
  Mail,
  Route,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import {
  InternationalPublicFooter,
  InternationalPublicHeader,
} from './InternationalPublicShell'
import {
  getInternationalSite,
  type InternationalPageKey,
} from '@/lib/international-public-site'

const featureIcons = [CarFront, Gauge, FileCheck2, BadgeCheck]
const processIcons = [Building2, Gavel, ShieldCheck, Truck]

export default function InternationalMarketPage({
  marketCode,
  page,
}: {
  marketCode: string
  page?: InternationalPageKey
}) {
  const site = getInternationalSite(marketCode)
  if (!site) return null

  return (
    <main className="w-full min-w-0 max-w-full overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <InternationalPublicHeader marketCode={marketCode} />
      {page
        ? <InternationalContentPage site={site} page={page} />
        : <InternationalHome site={site} />}
      <InternationalPublicFooter marketCode={marketCode} />
    </main>
  )
}

function InternationalHome({
  site,
}: {
  site: NonNullable<ReturnType<typeof getInternationalSite>>
}) {
  const { market, copy, href } = site

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-[#d9d8d2] bg-[#f4f1ea]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt={`${copy.vehicleTitle} ${market.countryLocal}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[84%_bottom] sm:object-[76%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,247,242,.97)_0%,rgba(249,247,242,.91)_42%,rgba(249,247,242,.48)_70%,rgba(238,238,233,.15)_100%)] sm:bg-[linear-gradient(90deg,#faf8f3_0%,rgba(250,248,243,.98)_34%,rgba(250,248,243,.8)_52%,rgba(250,248,243,.18)_78%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_58%,rgba(180,217,239,.28),transparent_36%),linear-gradient(0deg,rgba(31,36,39,.18)_0%,transparent_34%)]" />

        <div className="relative mx-auto grid min-h-[760px] w-full min-w-0 max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.65fr)] lg:px-12 xl:px-16">
          <div className="relative z-10 min-w-0 max-w-[780px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7dc] bg-white/82 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f7181]">
              <Globe2 className="h-4 w-4" />
              {market.flag} {market.countryLocal}
            </span>
            <h1 className="mt-8 max-w-full break-words text-[43px] leading-[.94] tracking-[-0.055em] [overflow-wrap:anywhere] sm:text-7xl sm:tracking-[-0.065em] lg:text-[84px]">
              {market.homeTitle || copy.countryTitle(market.countryLocal)}
            </h1>
            <p className="mt-7 max-w-full break-words text-[17px] leading-8 text-[#536a75] [overflow-wrap:anywhere] sm:max-w-[680px] sm:text-xl sm:leading-9">
              {copy.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] pl-7 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)]"
              >
                {copy.apply}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b4d9ef] text-[#242424]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={href('vehicles')}
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#c7c8c3] bg-white/75 px-7 text-sm font-medium"
              >
                {site.navigation.vehicles}
              </Link>
            </div>
          </div>

          <div className="relative z-10 overflow-hidden rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-[0_28px_80px_rgba(23,31,35,.2)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#dfe4e5] pb-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#6d8995]">
                  Autorell Market Intelligence
                </p>
                <h2 className="mt-2 text-2xl tracking-[-0.04em]">
                  {copy.dealerDemand}
                </h2>
              </div>
              <span className="rounded-full bg-[#edf7f1] px-3 py-2 text-[10px] text-[#567164]">
                {copy.liveMarket}
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {market.demand.map((label, index) => {
                const values = [86, 74, 67]
                return (
                  <div key={label}>
                    <div className="flex justify-between gap-4 text-sm">
                      <span>{label}</span>
                      <strong>{values[index]}%</strong>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edef]">
                      <span
                        className="block h-full rounded-full bg-[#83c3df]"
                        style={{ width: `${values[index]}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#dfe4e5] pt-5">
              <div className="rounded-[16px] bg-[#f4f7f7] p-4">
                <span className="text-xl">{market.flag}</span>
                <strong className="mt-3 block">{market.countryLocal}</strong>
              </div>
              <div className="rounded-[16px] bg-[#eaf5fa] p-4">
                <span className="text-xl">🇸🇪</span>
                <strong className="mt-3 block">Autorell</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid w-full min-w-0 max-w-[1440px] grid-cols-[repeat(2,minmax(0,1fr))] border-t border-[#d8dddc] bg-white/58 backdrop-blur lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {copy.standards.map((standard, index) => {
            const Icon = featureIcons[index]
            return (
              <div key={standard} className="min-w-0 min-h-[130px] border-r border-[#d8dddc] p-6">
                <Icon className="h-5 w-5 text-[#4e8197]" />
                <strong className="mt-7 block break-words text-lg [overflow-wrap:anywhere]">{standard}</strong>
              </div>
            )
          })}
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid w-full min-w-0 max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              Autorell B2B
            </p>
            <h2 className="mt-5 text-[42px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {copy.whyTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[#66767c]">{copy.whyText}</p>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {copy.stepTitles.map((title, index) => {
              const Icon = processIcons[index]
              return (
                <article key={title} className="min-h-[220px] rounded-[26px] border border-[#deddd7] bg-white p-7">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-[#4e7f94]" />
                    <span className="text-[10px] text-[#9aa3a6]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-16 text-2xl tracking-[-0.04em]">{title}</h3>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

function InternationalContentPage({
  site,
  page,
}: {
  site: NonNullable<ReturnType<typeof getInternationalSite>>
  page: InternationalPageKey
}) {
  const { copy, navigation, market } = site
  const content = getPageContent(site, page)
  const isFaq = page === 'faq'
  const isContact = page === 'contact'

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#dce5e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_52%,#dcecf3_100%)]">
        <div className="absolute -right-36 -top-52 h-[540px] w-[540px] rounded-full border-[70px] border-white/55" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7dce5] bg-white/75 px-4 py-2 text-xs font-medium text-[#4d6d7c]">
            <Globe2 className="h-4 w-4" />
            {market.flag} {market.countryLocal}
          </span>
          <h1 className="mt-7 max-w-5xl break-words text-[40px] leading-[1] tracking-[-0.05em] [overflow-wrap:anywhere] sm:text-6xl sm:tracking-[-0.055em] lg:text-[74px]">
            {content.heading}
          </h1>
          <p className="mt-7 max-w-3xl text-[17px] leading-8 text-[#58707c] sm:text-xl">
            {content.intro}
          </p>
          {!isContact && (
            <Link
              href="/dealer-apply"
              className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white"
            >
              {copy.apply}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {isContact ? (
        <section className="py-20">
          <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:px-8 lg:grid-cols-2">
            <div className="rounded-[28px] bg-[#20272b] p-8 text-white">
              <Mail className="h-6 w-6 text-[#b4d9ef]" />
              <h2 className="mt-8 text-3xl">{navigation.contact}</h2>
              <a href="mailto:info@autorell.com" className="mt-5 block text-xl">info@autorell.com</a>
            </div>
            <div className="rounded-[28px] border border-[#dfe4e5] bg-white p-8">
              <StoreCard title={copy.apply} text={copy.intro} href="/dealer-apply" />
              <StoreCard title={copy.login} text={copy.dealerOnly} href="/login" />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 sm:py-24">
          <div className={`mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12 ${isFaq ? 'columns-1 gap-4 md:columns-2' : 'grid gap-4 md:grid-cols-2'}`}>
            {content.sections.map(([title, text], index) => {
              const icons = [CarFront, Route, BadgeCheck, ShieldCheck, FileCheck2, CircleHelp]
              const Icon = icons[index % icons.length]
              return isFaq ? (
                <details key={title} className="group mb-4 inline-block w-full break-inside-avoid rounded-[20px] border border-[#deddd7] bg-white p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-xl font-semibold">
                    {title}
                    <CircleHelp className="h-5 w-5 text-[#66899a]" />
                  </summary>
                  <p className="mt-5 text-sm leading-7 text-[#68767c]">{text}</p>
                </details>
              ) : (
                <article key={title} className="min-h-[245px] rounded-[22px] border border-[#deddd7] bg-white p-7">
                  <Icon className="h-5 w-5 text-[#4e8197]" />
                  <h2 className="mt-10 text-2xl tracking-[-0.035em]">{title}</h2>
                  <p className="mt-4 text-sm leading-7 text-[#68767c]">{text}</p>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

function StoreCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between border-b border-[#e1e4e3] py-6 last:border-0">
      <span>
        <strong className="block text-xl">{title}</strong>
        <span className="mt-2 block max-w-md text-sm leading-6 text-[#68767c]">{text}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" />
    </Link>
  )
}

function getPageContent(
  site: NonNullable<ReturnType<typeof getInternationalSite>>,
  page: InternationalPageKey,
) {
  const { copy, navigation } = site
  const pageContent = {
    vehicles: {
      heading: copy.vehicleTitle,
      intro: copy.vehicleText,
      sections: copy.standards.map((title, index) => [title, copy.faq[index]?.[1] || copy.whyText]),
    },
    'how-it-works': {
      heading: copy.processTitle,
      intro: copy.intro,
      sections: copy.stepTitles.map((title, index) => [title, copy.faq[index]?.[1] || copy.whyText]),
    },
    'dealer-benefits': {
      heading: copy.whyTitle,
      intro: copy.whyText,
      sections: copy.standards.map((title, index) => [title, copy.faq[index]?.[1] || copy.vehicleText]),
    },
    about: {
      heading: navigation.about,
      intro: copy.intro,
      sections: [
        [copy.verified, copy.whyText],
        [copy.dealerOnly, copy.vehicleText],
        [copy.inspected, copy.intro],
        [copy.allMarkets, copy.footer],
      ],
    },
    faq: {
      heading: copy.faqTitle,
      intro: copy.whyText,
      sections: copy.faq,
    },
    contact: {
      heading: navigation.contact,
      intro: copy.intro,
      sections: [],
    },
    privacy: {
      heading: navigation.privacy,
      intro: copy.footer,
      sections: [
        [navigation.company, copy.intro],
        [copy.verified, copy.whyText],
        [navigation.contact, 'info@autorell.com'],
      ],
    },
    cookies: {
      heading: navigation.cookies,
      intro: copy.footer,
      sections: [
        [navigation.cookies, copy.verified],
        [navigation.privacy, copy.whyText],
        [navigation.contact, 'info@autorell.com'],
      ],
    },
    terms: {
      heading: navigation.terms,
      intro: copy.footer,
      sections: [
        [copy.dealerOnly, copy.intro],
        [copy.verified, copy.whyText],
        [copy.inspected, copy.vehicleText],
      ],
    },
  } satisfies Record<InternationalPageKey, {
    heading: string
    intro: string
    sections: string[][]
  }>

  return pageContent[page]
}

import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  ChevronDown,
  CircleHelp,
  Headphones,
  LogIn,
  Menu,
  Route,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
import SiteSearch from './SiteSearch'
import SocialIcons from './SocialIcons'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  getInternationalSite,
  type InternationalPageKey,
} from '@/lib/international-public-site'

const primaryPages: InternationalPageKey[] = [
  'vehicles',
  'how-it-works',
  'dealer-benefits',
]

const companyPages: InternationalPageKey[] = ['about', 'faq', 'contact']

const vehiclePurchaseLabels: Record<string, string> = {
  en: 'Buy cars',
  de: 'Fahrzeuge kaufen',
  pl: 'Kup pojazdy',
  nl: 'Voertuigen kopen',
  fr: 'Acheter des véhicules',
  es: 'Comprar vehículos',
  it: 'Acquista veicoli',
  pt: 'Comprar veículos',
  da: 'Køb køretøjer',
  fi: 'Osta ajoneuvoja',
  cs: 'Koupit vozidla',
  sk: 'Kúpiť vozidlá',
  hu: 'Járművásárlás',
  ro: 'Cumpără vehicule',
  bg: 'Купи автомобили',
  el: 'Αγορά οχημάτων',
  hr: 'Kupi vozila',
  sl: 'Kupi vozila',
  et: 'Osta sõidukeid',
  lv: 'Pirkt transportlīdzekļus',
  lt: 'Pirkti automobilius',
}

function pageLabel(
  page: InternationalPageKey,
  navigation: NonNullable<ReturnType<typeof getInternationalSite>>['navigation'],
  language?: string,
) {
  if (page === 'vehicles' && language) {
    return vehiclePurchaseLabels[language] || navigation.vehicles
  }
  const key = page === 'how-it-works'
    ? 'process'
    : page === 'dealer-benefits'
      ? 'benefits'
      : page

  return navigation[key]
}

export function InternationalPublicHeader({
  marketCode,
}: {
  marketCode: string
}) {
  const site = getInternationalSite(marketCode)
  if (!site) return null

  const { market, copy, navigation, href } = site

  return (
    <header className="relative z-50 w-full min-w-0 max-w-full overflow-x-clip border-b border-[#deddd8] bg-white/95 text-[#202124] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[88px] w-full min-w-0 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:min-h-[108px] lg:px-12 xl:px-16">
        <Link href={href('')} aria-label="Autorell">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={navigation.navigation}>
          <ShellMenu
            title={navigation.platform}
            pages={primaryPages}
            site={site}
            icon={CarFront}
          />
          <ShellMenu
            title={navigation.company}
            pages={companyPages}
            site={site}
            icon={Building2}
          />
          <Link
            href={href('contact')}
            className="rounded-full px-4 py-3 text-sm transition hover:bg-[#f2f5f5]"
          >
            {navigation.contact}
          </Link>
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <div className="relative hidden lg:block">
            <SiteSearch locale={market.language} marketCode={market.code} />
          </div>
          <details className="group/market relative hidden sm:block">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7deda] bg-white px-3 text-sm [&::-webkit-details-marker]:hidden">
              <CountryFlag code={market.code} className="h-[18px] w-[27px]" />
              <span>{market.countryLocal}</span>
              <ChevronDown className="h-3.5 w-3.5 transition group-open/market:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full w-[min(680px,calc(100vw-32px))] pt-3">
              <div className="rounded-[22px] border border-[#dfe5e8] bg-white p-4 shadow-[0_30px_80px_rgba(32,33,36,.16)]">
                <p className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78868c]">
                  {navigation.allMarkets}
                </p>
                <div className="grid max-h-[390px] gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                  {euBuyerMarkets.map((item) => (
                    <a
                      key={item.code}
                      href={`https://www.autorell.com/${item.code}?market=${item.code}`}
                      className={`flex items-center gap-3 rounded-[13px] px-3 py-2.5 transition hover:bg-[#f2f6f7] ${
                        item.code === market.code ? 'bg-[#edf6fa]' : ''
                      }`}
                    >
                      <CountryFlag
                        code={item.code}
                        className="h-[20px] w-[30px] shrink-0"
                      />
                      <span className="min-w-0">
                        <strong className="block truncate text-sm font-medium">
                          {item.countryLocal}
                        </strong>
                        <span className="block truncate text-[10px] text-[#7a878d]">
                          {item.country}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <Link
            href="/login"
            className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm md:flex"
          >
            <LogIn className="h-4 w-4" />
            {copy.login}
          </Link>
          <Link
            href="/dealer-apply"
            className="hidden min-h-11 items-center gap-2 rounded-full bg-[#242424] px-5 text-sm font-medium text-white sm:inline-flex"
          >
            <span>{copy.apply}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <details className="group/mobile relative lg:hidden">
            <summary
              className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-[#d7deda] [&::-webkit-details-marker]:hidden"
              aria-label={navigation.navigation}
            >
              <Menu className="h-5 w-5" />
            </summary>
            <div className="fixed inset-x-0 top-[88px] max-h-[calc(100dvh-88px)] overflow-y-auto border-t border-[#deddd8] bg-[#f6f4ef] p-5 shadow-[0_24px_60px_rgba(32,33,36,.14)]">
              <SiteSearch locale={market.language} marketCode={market.code} mobile />
              <div className="mb-5 mt-5 grid gap-2">
                <Link
                  href="/dealer-apply"
                  className="flex min-h-13 items-center justify-between rounded-[14px] bg-[#242424] px-5 text-sm font-medium text-white"
                >
                  {copy.apply}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex min-h-13 items-center justify-between rounded-[14px] border border-[#dcdad3] bg-white px-5 text-sm font-medium"
                >
                  {copy.login}
                  <LogIn className="h-4 w-4" />
                </Link>
              </div>
              {[...primaryPages, ...companyPages].map((page) => (
                <Link
                  key={page}
                  href={href(page)}
                  className="flex items-center justify-between border-b border-[#dcdad3] py-4 text-xl font-medium"
                >
                  {pageLabel(page, navigation, market.language)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {euBuyerMarkets.map((item) => (
                  <a
                    key={item.code}
                    href={`https://www.autorell.com/${item.code}?market=${item.code}`}
                    className="flex min-h-12 items-center gap-2 rounded-[12px] border border-[#dcdad3] bg-white px-3 text-sm"
                  >
                    <CountryFlag
                      code={item.code}
                      className="h-[17px] w-[26px] shrink-0"
                    />
                    <span className="truncate">{item.countryLocal}</span>
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}

function ShellMenu({
  title,
  pages,
  site,
  icon: Icon,
}: {
  title: string
  pages: InternationalPageKey[]
  site: NonNullable<ReturnType<typeof getInternationalSite>>
  icon: typeof CarFront
}) {
  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full px-4 text-sm transition hover:bg-[#f2f5f5] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
      </summary>
      <div className="absolute left-1/2 top-full w-[680px] -translate-x-1/2 pt-3">
        <div className="grid grid-cols-[.9fr_1.1fr] overflow-hidden rounded-[22px] border border-[#dfe5e8] bg-white shadow-[0_30px_80px_rgba(32,33,36,.16)]">
          <div className="bg-[#eef6fa] p-7">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#b4d9ef]">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68808e]">
              Autorell Europe
            </p>
            <h3 className="mt-3 text-2xl tracking-[-0.04em]">{title}</h3>
            <p className="mt-4 text-sm leading-6 text-[#5c707b]">{site.copy.intro}</p>
          </div>
          <div className="p-4">
            {pages.map((page, index) => {
              const icons = [CarFront, Route, BadgeCheck, Building2, CircleHelp, Headphones]
              const PageIcon = icons[index % icons.length]
              return (
                <Link
                  key={page}
                  href={site.href(page)}
                  className="flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dce1e3]">
                    <PageIcon className="h-4 w-4" />
                  </span>
                  <strong className="text-sm font-medium">
                    {pageLabel(page, site.navigation, site.market.language)}
                  </strong>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </details>
  )
}

export function InternationalPublicFooter({
  marketCode,
}: {
  marketCode: string
}) {
  const site = getInternationalSite(marketCode)
  if (!site) return null

  const { copy, navigation, href } = site

  return (
    <footer className="relative w-full min-w-0 max-w-full overflow-hidden bg-[#f3f2ee] text-[#202124]">
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[270px] w-[270px] rounded-full border-[30px] border-[#b4d9ef]/50" />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-8 border-b border-[#d9d7d0] py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={href('')}><BrandLogo /></Link>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#666864]">
              {copy.footer}
            </p>
          </div>
          <Link
            href="/dealer-apply"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-[#242424] px-6 text-sm text-white"
          >
            {copy.apply}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <p className="max-w-sm text-2xl leading-9 tracking-[-0.025em]">
            {copy.whyTitle}
          </p>
          <FooterGroup title={navigation.platform} links={primaryPages.map((page) => [pageLabel(page, navigation, site.market.language), href(page)])} />
          <FooterGroup title={navigation.company} links={companyPages.map((page) => [pageLabel(page, navigation, site.market.language), href(page)])} />
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
              {navigation.contact}
            </h3>
            <div className="mt-6 flex flex-col items-start gap-4 text-sm">
              <a href="mailto:info@autorell.com">info@autorell.com</a>
              <Link href={href('contact')}>{navigation.contact}</Link>
              <SocialIcons className="pt-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#d9d7d0] py-7 text-xs text-[#858681] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Autorell AB</p>
          <div className="flex flex-wrap gap-5">
            <Link href={href('privacy')}>{navigation.privacy}</Link>
            <Link href={href('cookies')}>{navigation.cookies}</Link>
            <Link href={href('terms')}>{navigation.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterGroup({
  title,
  links,
}: {
  title: string
  links: string[][]
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
        {title}
      </h3>
      <nav className="mt-6 flex flex-col items-start gap-4 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="transition hover:opacity-55">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

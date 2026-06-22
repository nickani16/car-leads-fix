import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BusFront,
  CarFront,
  Construction,
  Globe2,
  Leaf,
  ShieldCheck,
  Store,
  Tractor,
  Truck,
  Warehouse,
} from 'lucide-react'
import MarketplaceSearch from './MarketplaceSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

const categories = [
  { label: 'Bilar', href: '/find-cars', icon: CarFront, tone: 'bg-[#eaf1ff]' },
  { label: 'Transportbilar', href: '/marketplace/vans', icon: BusFront, tone: 'bg-[#f2edff]' },
  { label: 'Motorcyklar', href: '/marketplace/bikes', icon: Bike, tone: 'bg-[#fff0e8]' },
  { label: 'Husbilar', href: '/marketplace/motorhomes', icon: BusFront, tone: 'bg-[#e9f7f2]' },
  { label: 'Husvagnar', href: '/marketplace/caravans', icon: Warehouse, tone: 'bg-[#fff5d9]' },
  { label: 'Lastbilar', href: '/marketplace/trucks', icon: Truck, tone: 'bg-[#edf2f4]' },
  { label: 'Lantbruk', href: '/marketplace/farm', icon: Tractor, tone: 'bg-[#eef7e5]' },
  { label: 'Entreprenad', href: '/marketplace/plant', icon: Construction, tone: 'bg-[#f6eee7]' },
  { label: 'Elcyklar', href: '/marketplace/electric-bikes', icon: Leaf, tone: 'bg-[#e7f8ef]' },
] as const

export default function BusinessMarketplaceHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <PublicHeader />

      <section className="bg-white px-4 pb-16 pt-5 sm:px-7 sm:pb-20 sm:pt-7 lg:px-10">
        <div className="relative mx-auto max-w-[1220px]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] bg-[#e9edf0] sm:min-h-[510px] lg:min-h-[560px]">
            <Image
              src="/autorell-volvo-hero.jpg"
              alt="Elbil på Autorells europeiska fordonsmarknad"
              fill
              preload
              className="object-cover object-[72%_center]"
              sizes="(max-width: 1280px) 100vw, 1220px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,102,255,.96)_0%,rgba(8,102,255,.86)_32%,rgba(8,102,255,.18)_64%,rgba(8,102,255,0)_82%)]" />
            <div className="relative flex min-h-[420px] w-full min-w-0 max-w-[690px] flex-col justify-center px-7 pb-24 pt-12 text-white sm:min-h-[510px] sm:px-12 sm:pb-28 lg:min-h-[560px] lg:px-16">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-2 text-xs font-semibold backdrop-blur">
                <Globe2 className="h-4 w-4" />
                Fordon från hela Europa
              </span>
              <h1 className="mt-6 max-w-[300px] text-[40px] leading-[.98] tracking-[-0.055em] sm:hidden">
                Alla fordon. På ett ställe.
              </h1>
              <h1 className="mt-6 hidden max-w-full break-words text-6xl leading-[.96] tracking-[-0.06em] sm:block lg:text-[72px]">
                Hela fordonsmarknaden. På ett ställe.
              </h1>
              <p className="mt-5 max-w-[300px] text-base leading-7 text-white/88 sm:max-w-[560px] sm:text-lg">
                Sök, jämför, köp och sälj bilar, maskiner och andra fordon över
                hela EU. En modern marknadsplats byggd för både människor och företag.
              </p>
            </div>
          </div>

          <div className="relative z-10 min-w-0 -mt-[76px] px-3 sm:-mt-[54px] sm:px-8 lg:px-14">
            <MarketplaceSearch />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e7eb] bg-[#f7f8fa] py-14 sm:py-20">
        <div className="mx-auto max-w-[1220px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0866ff]">
                Utforska marknaden
              </p>
              <h2 className="mt-3 text-3xl tracking-[-0.045em] sm:text-5xl">
                Alla typer av fordon.
              </h2>
            </div>
            <Link href="/find-cars" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0866ff]">
              Visa hela marknaden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ label, href, icon: Icon, tone }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-[18px] border border-[#e1e4e8] bg-white p-4 shadow-[0_7px_24px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:border-[#0866ff]/35 hover:shadow-[0_16px_38px_rgba(8,102,255,.10)] sm:p-5"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-[13px] ${tone} text-[#0866ff]`}>
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <span className="mt-6 flex items-center justify-between gap-2 text-sm font-semibold sm:text-base">
                  {label}
                  <ArrowRight className="h-4 w-4 text-[#0866ff] transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1220px] gap-6 px-5 sm:px-8 lg:grid-cols-[1.08fr_.92fr]">
          <article className="overflow-hidden rounded-[28px] bg-[#0866ff] p-8 text-white sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Autorell marketplace</p>
            <h2 className="mt-4 max-w-2xl text-4xl leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Blocket 2.0 för Europas fordonsmarknad.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/78">
              Ett gemensamt hem för personbilar, transport, fritidsfordon,
              lantbruk och entreprenad. Tydligare sökning, verifierade aktörer
              och gränsöverskridande handel.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[['27', 'EU-marknader'], ['9', 'fordonskategorier'], ['1', 'gemensamt konto']].map(([value, label]) => (
                <div key={label} className="rounded-[17px] bg-white/11 p-4 backdrop-blur">
                  <strong className="block text-2xl">{value}</strong>
                  <span className="mt-1 block text-xs text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[28px] border border-[#e0e4e8] bg-[#f8fafc] p-8">
              <Store className="h-7 w-7 text-[#0866ff]" />
              <h2 className="mt-6 text-2xl tracking-[-0.035em]">Sälj som privatperson eller företag.</h2>
              <p className="mt-3 leading-7 text-[#667085]">
                Nå köpare i Sverige och resten av EU med en tydlig annons och ett tryggt digitalt flöde.
              </p>
              <Link href="/salj-bil" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0866ff]">
                Börja sälja
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
            <article className="rounded-[28px] border border-[#e0e4e8] bg-white p-8">
              <div className="flex gap-3 text-[#0866ff]">
                <ShieldCheck className="h-7 w-7" />
                <BadgeCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl tracking-[-0.035em]">Byggd för tryggare affärer.</h2>
              <p className="mt-3 leading-7 text-[#667085]">
                Verifierade konton, strukturerade fordonsdata och stöd för professionell handel över landsgränser.
              </p>
            </article>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

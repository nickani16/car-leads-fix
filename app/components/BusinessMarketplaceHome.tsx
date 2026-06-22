import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Bike,
  BusFront,
  CarFront,
  Construction,
  Leaf,
  Store,
  Tractor,
  Truck,
  Warehouse,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

const categories = [
  { label: 'Cars', href: '/find-cars', icon: CarFront },
  { label: 'Vans', href: '/marketplace/vans', icon: BusFront },
  { label: 'Bikes', href: '/marketplace/bikes', icon: Bike },
  { label: 'Motorhomes', href: '/marketplace/motorhomes', icon: BusFront },
  { label: 'Caravans', href: '/marketplace/caravans', icon: Warehouse },
  { label: 'Trucks', href: '/marketplace/trucks', icon: Truck },
  { label: 'Farm', href: '/marketplace/farm', icon: Tractor },
  { label: 'Plant', href: '/marketplace/plant', icon: Construction },
  {
    label: 'Electric bikes',
    href: '/marketplace/electric-bikes',
    icon: Leaf,
  },
]

export default function BusinessMarketplaceHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#202124]">
      <PublicHeader />

      <section className="relative isolate min-h-[680px] overflow-hidden border-b border-[#deddd8] bg-[#f5f3ed]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt="Fordon för professionell handel"
          fill
          priority
          className="object-cover object-[78%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,249,246,.99)_0%,rgba(250,249,246,.96)_38%,rgba(250,249,246,.62)_62%,rgba(250,249,246,.1)_100%)]" />

        <div className="relative mx-auto flex min-h-[680px] max-w-[1440px] items-center px-5 py-20 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-[760px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#607985]">
              Marketplace för företag
            </p>
            <h1 className="mt-6 text-[48px] leading-[.96] tracking-[-0.06em] sm:text-7xl lg:text-[82px]">
              Professionella objekt.
              <span className="block text-[#536f7d]">
                En marknad för företag.
              </span>
            </h1>
            <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#536970]">
              Autorell samlar fordon, maskiner och mobilitetsprodukter från
              verifierade företag. Företag listar. Professionella köpare hittar,
              jämför och handlar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/find-cars"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-semibold text-white transition hover:bg-black"
              >
                Utforska marknaden
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dealer-apply"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#bbbdb9] bg-white/80 px-7 text-sm font-semibold backdrop-blur transition hover:bg-white"
              >
                Lista som företag
                <Store className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-5 text-xs text-[#68767b]">
              Endast registrerade företag kan publicera annonser.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e2e1dc] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7b82]">
                Autorell marketplace
              </p>
              <h2 className="mt-3 text-3xl tracking-[-0.045em] sm:text-5xl">
                Hitta rätt marknad.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#657177]">
              En gemensam plattform för professionell handel inom flera
              fordons- och maskinkategorier.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 border-l border-t border-[#deddd8] sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group min-h-36 border-b border-r border-[#deddd8] p-5 transition hover:bg-[#f3f7f8]"
              >
                <Icon className="h-6 w-6 text-[#526b76]" strokeWidth={1.6} />
                <span className="mt-10 flex items-center justify-between gap-3 font-semibold">
                  {label}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f2ee] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-6 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <article className="rounded-[26px] bg-[#242424] p-8 text-white sm:p-11">
            <Store className="h-8 w-8 text-[#B4D9EF]" />
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
              För säljande företag
            </p>
            <h2 className="mt-3 text-3xl tracking-[-0.045em] sm:text-4xl">
              Publicera ert lager på en professionell marknad.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/65">
              Handlare, återförsäljare, flottägare och andra verifierade företag
              kan lista objekt. Privatannonser accepteras inte.
            </p>
            <Link
              href="/dealer-apply"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#202124]"
            >
              Ansök om företagskonto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-[26px] border border-[#d9d8d2] bg-white p-8 sm:p-11">
            <Warehouse className="h-8 w-8 text-[#526b76]" />
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#607985]">
              För professionella köpare
            </p>
            <h2 className="mt-3 text-3xl tracking-[-0.045em] sm:text-4xl">
              Ett konto. Flera marknader.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#657177]">
              Sök bland företagslistade objekt, jämför underlag och hantera
              affärer i ett tydligt B2B-flöde.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#bfc2bf] px-6 py-3.5 text-sm font-semibold"
            >
              Logga in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

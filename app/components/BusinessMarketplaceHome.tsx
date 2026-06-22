import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BriefcaseBusiness,
  BusFront,
  CarFront,
  Check,
  Construction,
  Globe2,
  Handshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Tractor,
  Truck,
  UserRound,
  Warehouse,
} from 'lucide-react'
import MarketplaceSearch from './MarketplaceSearch'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

const categories = [
  { label: 'Bilar', href: '/find-cars', icon: CarFront },
  { label: 'Transportbilar', href: '/marketplace/vans', icon: BusFront },
  { label: 'Motorcyklar', href: '/marketplace/bikes', icon: Bike },
  { label: 'Husbilar', href: '/marketplace/motorhomes', icon: BusFront },
  { label: 'Husvagnar', href: '/marketplace/caravans', icon: Warehouse },
  { label: 'Lastbilar', href: '/marketplace/trucks', icon: Truck },
  { label: 'Lantbruk', href: '/marketplace/farm', icon: Tractor },
  { label: 'Entreprenad', href: '/marketplace/plant', icon: Construction },
  { label: 'Elcyklar', href: '/marketplace/electric-bikes', icon: Leaf },
] as const

const assurances = [
  'Verifierade konton',
  'Handel över hela EU',
  'Strukturerad fordonsdata',
] as const

export default function BusinessMarketplaceHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader />

      <section className="px-4 pb-20 pt-7 sm:px-7 sm:pb-24 sm:pt-9 lg:px-10">
        <div className="relative mx-auto max-w-[1340px]">
          <div className="relative min-h-[480px] overflow-hidden rounded-[30px] bg-[#101828] sm:min-h-[570px]">
            <Image
              src="/autorell-volvo-hero.jpg"
              alt="Europeisk fordonsmarknad för privatpersoner och företag"
              fill
              preload
              className="object-cover object-[72%_center]"
              sizes="(max-width: 1400px) 100vw, 1340px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,35,82,.98)_0%,rgba(8,102,255,.9)_34%,rgba(8,102,255,.22)_67%,rgba(8,102,255,0)_86%)]" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#071a3b]/65 to-transparent" />

            <div className="relative flex min-h-[480px] max-w-[720px] flex-col justify-center px-7 pb-28 pt-12 text-white sm:min-h-[570px] sm:px-14 sm:pb-32 lg:px-20">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Europas marknadsplats för fordon
              </span>
              <h1 className="mt-7 max-w-[300px] text-[38px] leading-[.98] tracking-[-0.055em] sm:max-w-[610px] sm:text-6xl sm:leading-[.97] sm:tracking-[-0.06em] lg:text-[74px]">
                Köp och sälj fordon över hela Europa.
              </h1>
              <p className="mt-6 max-w-[300px] text-base leading-7 text-white/82 sm:max-w-[580px] sm:text-lg sm:leading-8">
                En sammanhållen marknadsplats för privatpersoner och företag.
                Hitta rätt fordon, nå fler köpare och genomför tryggare affärer
                över landsgränser.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                {assurances.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
                    <Check className="h-4 w-4 text-[#9cc2ff]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-[78px] min-w-0 px-3 sm:-mt-[52px] sm:px-8 lg:px-16">
            <MarketplaceSearch />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-[#475467]">
              <Link href="/salj-bil" className="inline-flex items-center gap-2 transition hover:text-[#0866ff]">
                Sälj ett fordon
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/foretag" className="inline-flex items-center gap-2 transition hover:text-[#0866ff]">
                Lösningar för företag
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e4e7ec] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                En marknad för all mobilitet
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                Från vardagsbil till tung utrustning.
              </h2>
            </div>
            <Link href="/find-cars" className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]">
              Utforska hela marknaden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-[26px] border border-[#e4e7ec] bg-[#f9fafb] sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ label, href, icon: Icon }, index) => (
              <Link
                key={label}
                href={href}
                className={`group min-h-36 border-[#e4e7ec] bg-white p-5 transition hover:z-10 hover:bg-[#f4f7ff] ${
                  index % 2 === 0 ? 'border-r' : ''
                } ${index < 5 ? 'border-b' : ''} sm:border-r ${
                  index === categories.length - 1 ? 'lg:col-span-2' : ''
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[#dce6ff] bg-[#eef4ff] text-[#0866ff] transition group-hover:scale-105 group-hover:bg-[#0866ff] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="mt-7 flex items-center justify-between gap-2 font-semibold">
                  {label}
                  <ArrowRight className="h-4 w-4 text-[#0866ff] transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fb] py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              Byggd för hela marknaden
            </p>
            <h2 className="mt-4 text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">
              En plattform. Olika behov. Samma höga standard.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[30px] border border-[#dde3ef] bg-white p-8 shadow-[0_18px_55px_rgba(16,24,40,.06)] sm:p-11">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#eaf1ff]" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#0866ff] text-white">
                  <UserRound className="h-6 w-6" />
                </span>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#667085]">
                  För privatpersoner
                </p>
                <h3 className="mt-3 max-w-lg text-3xl leading-[1.08] tracking-[-0.04em]">
                  Köp smartare. Sälj till en större marknad.
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-[#667085]">
                  Hitta fordon i flera europeiska marknader eller skapa en tydlig
                  försäljning med räckvidd bortom din lokala marknad.
                </p>
                <Link href="/salj-bil" className="mt-8 inline-flex items-center gap-2 font-bold text-[#0866ff]">
                  Sälj ditt fordon
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[30px] bg-[#0b1830] p-8 text-white shadow-[0_24px_65px_rgba(11,24,48,.18)] sm:p-11">
              <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full border-[44px] border-[#0866ff]/35" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-white/12 text-[#8fb8ff]">
                  <BriefcaseBusiness className="h-6 w-6" />
                </span>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  För företag
                </p>
                <h3 className="mt-3 max-w-lg text-3xl leading-[1.08] tracking-[-0.04em]">
                  Hantera lager, volymer och affärer i Europa.
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-white/65">
                  Publicera fordon, nå professionella köpare och samla
                  gränsöverskridande handel i ett strukturerat arbetsflöde.
                </p>
                <Link href="/foretag" className="mt-8 inline-flex items-center gap-2 font-bold text-[#8fb8ff]">
                  Upptäck företagslösningen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(125deg,#0866ff_0%,#064fc5_55%,#092a66_100%)] text-white">
            <div className="grid lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-8 sm:p-12 lg:p-14">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-white/65">
                  <Globe2 className="h-4 w-4" />
                  Europeisk räckvidd
                </span>
                <h2 className="mt-5 max-w-xl text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">
                  Fler möjligheter på varje sida av affären.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-white/70">
                  Autorell för samman utbud och efterfrågan mellan europeiska
                  marknader — med tydligare information och tryggare motparter.
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-white/15 lg:border-l lg:border-t-0">
                {[
                  ['27', 'EU-marknader'],
                  ['9', 'fordonskategorier'],
                  ['1', 'sammanhållen marknad'],
                  ['EU', 'gränsöverskridande räckvidd'],
                ].map(([value, label]) => (
                  <div key={label} className="border-b border-r border-white/15 p-7 sm:p-9">
                    <strong className="block text-3xl tracking-[-0.04em]">{value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-white/60">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: 'Verifierade aktörer',
                text: 'Tydligare identitet och professionella konton skapar bättre förutsättningar för varje affär.',
              },
              {
                icon: ShieldCheck,
                title: 'Tryggare process',
                text: 'Strukturerad information och tydliga steg minskar osäkerheten mellan köpare och säljare.',
              },
              {
                icon: Handshake,
                title: 'Enklare över gränser',
                text: 'En gemensam marknad gör det lättare att hitta rätt motpart i Sverige och resten av Europa.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-[24px] border border-[#e4e7ec] bg-[#f9fafb] p-7">
                <Icon className="h-6 w-6 text-[#0866ff]" />
                <h3 className="mt-6 text-xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

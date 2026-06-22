import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  Bike,
  BusFront,
  CarFront,
  Check,
  Construction,
  Zap,
  Tractor,
  Truck,
  Warehouse,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createPublicMetadata } from '@/lib/public-seo'
import { formatListingPrice, marketplaceCategories } from '@/lib/marketplace-pricing'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'

export const metadata = createPublicMetadata({
  title: 'Sälj fordon i Sverige och Europa | Autorell',
  description:
    'Välj fordonskategori, skapa en annons och nå köpare i Sverige och resten av Europa. Annonspaket köps per publicerat objekt.',
  path: '/salj-fordon',
})

const categories = [
  { slug: 'cars', label: 'Bilar', icon: CarFront },
  { slug: 'vans', label: 'Transportbilar', icon: BusFront },
  { slug: 'bikes', label: 'Motorcyklar', icon: Bike },
  { slug: 'motorhomes', label: 'Husbilar', icon: BusFront },
  { slug: 'caravans', label: 'Husvagnar', icon: Warehouse },
  { slug: 'trucks', label: 'Lastbilar', icon: Truck },
  { slug: 'farm', label: 'Lantbruk', icon: Tractor },
  { slug: 'plant', label: 'Entreprenad', icon: Construction },
  { slug: 'electric-bikes', label: 'Elcyklar', icon: Bike },
  { slug: 'e-scooters', label: 'Elsparkcyklar', icon: Zap },
] as const

export default async function SellVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'sv'

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
            Publicera på Autorell
          </span>
          <h1 className="mt-4 max-w-[330px] text-[42px] leading-[.98] tracking-[-0.055em] sm:max-w-3xl sm:text-6xl">
            Sälj ett fordon till en större marknad.
          </h1>
          <p className="mt-6 max-w-[330px] text-base leading-7 text-[#667085] sm:max-w-2xl sm:text-lg sm:leading-8">
            Privatpersoner och företag publicerar per objekt. Välj kategori,
            skicka in underlaget och välj annonspaket när objektet är godkänt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#475467]">
            {['Betala per annons', 'Ingen prenumeration krävs', 'Europeisk räckvidd'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-[12px] bg-[#f0f4ff] px-4 py-2">
                <Check className="h-4 w-4 text-[#0866ff]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map(({ slug, label, icon: Icon }) => {
              const isSelected = category === slug
              const href = `/konto/annonser/ny?category=${slug}`
              return (
                <Link
                  key={slug}
                  href={href}
                  className={`group rounded-[20px] border bg-white p-5 transition hover:-translate-y-1 hover:border-[#0866ff]/40 hover:shadow-[0_18px_45px_rgba(16,24,40,.08)] ${
                    isSelected ? 'border-[#0866ff] ring-4 ring-[#0866ff]/8' : 'border-[#e1e5ec]'
                  }`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef4ff] text-[#0866ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <strong className="mt-6 block">{label}</strong>
                  <span className="mt-2 block text-xs leading-5 text-[#667085]">
                    Skapa annons direkt
                  </span>
                  <ArrowRight className="mt-5 h-4 w-4 text-[#0866ff] transition group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <article className="rounded-[28px] border border-[#dce3f2] bg-white p-8 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0866ff]">
                Så fungerar publiceringen
              </p>
              <ol className="mt-7 grid gap-5">
                {[
                  ['01', 'Skicka in fordonet', 'Lägg till kategori, fordonsdata, plats och bilder.'],
                  ['02', 'Välj annonspaket', 'Betala per publicerat objekt efter att underlaget har godkänts.'],
                  ['03', 'Nå rätt köpare', 'Annonsen blir sökbar på relevanta marknader i Europa.'],
                ].map(([number, title, text]) => (
                  <li key={number} className="flex gap-4 border-b border-[#eaecf0] pb-5 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-[#0866ff]">{number}</span>
                    <span>
                      <strong className="block">{title}</strong>
                      <span className="mt-1 block text-sm leading-6 text-[#667085]">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </article>
            <article className="relative overflow-hidden rounded-[28px] bg-[#eef4ff] p-8 sm:p-10">
              <div className="market-blob absolute -right-20 -top-24 h-64 w-64 bg-white/65" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0866ff]">
                  Annonspaket
                </p>
                <h2 className="mt-4 text-3xl tracking-[-0.045em]">
                  Betala bara för objekten du publicerar.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#667085]">
                  Inga fasta abonnemang krävs. Standard- och premiumpaket väljs
                  separat för varje godkänt fordon.
                </p>
                <Link href="/kontakt" className="mt-7 inline-flex items-center gap-2 font-bold text-[#0866ff]">
                  Frågor om större volymer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="priser" className="scroll-mt-28 border-y border-[#e4e7ec] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Prissättning per annons</p>
          <h2 className="mt-4 text-4xl tracking-[-.045em]">Tydligt pris för varje kategori.</h2>
          <p className="mt-3 max-w-2xl text-[#667085]">Samma tydliga kategoripris gäller för privatpersoner och företag. Alla priser visas inklusive tillämplig moms före betalning.</p>
          <div className="mt-8 overflow-x-auto rounded-[22px] border border-[#e1e5ec]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[#f4f7ff]"><tr><th className="p-4">Kategori</th><th className="p-4">7 dagar</th><th className="p-4">15 dagar</th><th className="p-4">Premium 30 dagar</th></tr></thead>
              <tbody>{marketplaceCategories.map((item) => <tr key={item.slug} className="border-t border-[#e7eaf0]"><th className="p-4">{item.label}</th><td className="p-4 font-bold text-emerald-700">Gratis</td><td className="p-4 font-semibold">{formatListingPrice(item.standard)}</td><td className="p-4 font-semibold">{formatListingPrice(item.premium)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, Store } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'

const categories = {
  vans: 'Vans',
  bikes: 'Bikes',
  motorhomes: 'Motorhomes',
  caravans: 'Caravans',
  trucks: 'Trucks',
  farm: 'Farm',
  plant: 'Plant',
  'electric-bikes': 'Electric bikes',
} as const

export default async function MarketplaceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const label = categories[category as keyof typeof categories]
  if (!label) notFound()

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#202124]">
      <PublicHeader />
      <section className="border-b border-[#deddd8] bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#607985]">
            Autorell marketplace
          </p>
          <h1 className="mt-5 text-5xl tracking-[-0.055em] sm:text-7xl">
            {label}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#617178]">
            Den här professionella marknaden öppnas för utbud från verifierade
            företag. Privatpersoner kan inte publicera annonser.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dealer-apply"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-semibold text-white"
            >
              Lista {label.toLowerCase()} som företag
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#bbbdb9] bg-white px-7 text-sm font-semibold"
            >
              Logga in
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1200px] gap-5 px-5 py-14 sm:px-8 md:grid-cols-2">
        <article className="rounded-[24px] border border-[#d9d8d2] bg-white p-7">
          <Store className="h-7 w-7 text-[#526b76]" />
          <h2 className="mt-6 text-2xl font-semibold">Endast företagsutbud</h2>
          <p className="mt-3 leading-7 text-[#68757a]">
            Varje säljare ansöker med företagsuppgifter innan objekt kan
            publiceras.
          </p>
        </article>
        <article className="rounded-[24px] border border-[#d9d8d2] bg-white p-7">
          <BadgeCheck className="h-7 w-7 text-[#526b76]" />
          <h2 className="mt-6 text-2xl font-semibold">Professionellt underlag</h2>
          <p className="mt-3 leading-7 text-[#68757a]">
            Marknaden byggs för strukturerade annonser, tydliga motparter och
            effektiva B2B-affärer.
          </p>
        </article>
      </section>
      <PublicFooter />
    </main>
  )
}

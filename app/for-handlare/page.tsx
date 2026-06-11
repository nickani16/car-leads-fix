import Link from 'next/link'
import { createPublicMetadata } from '@/lib/public-seo'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  FileCheck2,
  Gavel,
  Globe2,
  Route,
  ShieldCheck,
} from 'lucide-react'
import PublicBreadcrumbs from '../components/PublicBreadcrumbs'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata = createPublicMetadata({
  title: 'Köp svenska bilar som bilhandlare | Autorell',
  description:
    'Köp kvalificerade svenska fordon genom strukturerad fordonsdata, fokuserad budgivning och ett tydligt exportflöde.',
  path: '/for-handlare',
})

const benefits = [
  {
    icon: CarFront,
    title: 'Utvalda svenska fordon',
    text: 'Ett fokuserat inflöde från privatpersoner, inbyten, leasingreturer och fordonsflottor.',
  },
  {
    icon: FileCheck2,
    title: 'Strukturerad fordonsdata',
    text: 'Skick, historik, bilder, utrustning och kända fel presenteras i samma format inför bud.',
  },
  {
    icon: Gavel,
    title: 'Tydliga budregler',
    text: 'Aktiva budfönster, dokumenterad budhistorik och villkor som är tillgängliga före deltagande.',
  },
  {
    icon: ShieldCheck,
    title: 'Verifierade parter',
    text: 'Handlarkonton granskas och varje affär följer identitets-, avtals- och fordonskontroller.',
  },
  {
    icon: Route,
    title: 'Export och transport',
    text: 'Status för betalning, upphämtning, dokumentation och leverans samlas i ett gemensamt flöde.',
  },
  {
    icon: Globe2,
    title: 'Byggt för europeisk handel',
    text: 'En svensk ursprungsmarknad med professionella köpare på flera europeiska marknader.',
  },
]

export default function ForDealersPage() {
  return (
    <main className="overflow-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#dce5e8] bg-[linear-gradient(145deg,#f9f5ed_0%,#edf5f8_58%,#dfeef4_100%)]">
        <div className="absolute -right-40 -top-56 h-[580px] w-[580px] rounded-full border-[72px] border-white/45" />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-20 pt-6 sm:px-8 sm:pb-28 lg:px-12">
          <PublicBreadcrumbs items={[{ label: 'För bilhandlare' }]} />
          <div className="max-w-4xl pt-14 sm:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#647b86]">
              Autorell Dealer Network
            </p>
            <h1 className="mt-5 text-[44px] leading-[1.01] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Rätt fordon. Tydligare beslut. Europeisk räckvidd.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#58707c]">
              Autorell ger professionella köpare tillgång till kvalificerade
              svenska fordon och ett arbetsflöde byggt för gränsöverskridande handel.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white"
              >
                Ansök om handlaråtkomst
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dealer-terms"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#bfd1d9] bg-white/70 px-7 text-sm font-medium"
              >
                Läs handlarvillkoren
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-[22px] border border-[#deddd7] bg-white p-7 shadow-[0_18px_55px_rgba(32,33,36,.05)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dceefa] text-[#294b5c]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-7 text-2xl tracking-[-0.035em]">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#68767c]">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 rounded-[24px] bg-[#242424] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[#b4d9ef]">
                <BadgeCheck className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.18em]">
                  Verifierad handlaråtkomst
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-2xl tracking-[-0.03em]">
                Se budregler, avgifter och fordonsunderlag innan du deltar.
              </p>
            </div>
            <Link
              href="/dealer-apply"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#b4d9ef] px-6 text-sm font-medium text-[#242424]"
            >
              Bli partner
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

import Link from 'next/link'
import Image from 'next/image'
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

const dealerExperienceTiles = [
  {
    title: 'Granska',
    label: 'Vehicle access',
    text: 'Utvalda svenska fordon med tydliga bilder, data och nästa steg.',
    href: '/dealer-apply',
    src: '/dealer-handtag.webp',
    alt: 'Närbild på bildörrhandtag för utvalda Autorell-fordon',
  },
  {
    title: 'Analysera',
    label: 'Dealer dashboard',
    text: 'Se marknadssignaler, bud och fordonsprofiler innan ni tar beslut.',
    href: '/dealer-apply',
    src: '/dealer-macbook.webp',
    alt: 'Autorell dealer dashboard på en laptop',
  },
  {
    title: 'Budsystem',
    label: 'Enkelt budflöde',
    text: 'Lägg bud, se avgifter och förstå totalsumman innan ni skickar in.',
    href: '/dealer-apply',
    src: '/dealer-samsung.webp',
    alt: 'Autorell enkelt budsystem med budvy och köpsammanfattning',
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
        </div>
      </section>

      <section className="bg-white">
        <div className="grid w-full bg-[#202427] lg:grid-cols-2">
          <div className="grid lg:min-h-[760px] lg:grid-rows-2">
            {dealerExperienceTiles.slice(1).map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="group relative isolate min-h-[330px] overflow-hidden bg-[#dbe9f1] text-[#202124] outline-none sm:min-h-[430px] lg:min-h-0"
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.72)_0%,rgba(255,255,255,.16)_42%,rgba(32,36,39,.36)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,.58)_0%,rgba(255,255,255,.08)_42%,rgba(32,36,39,.48)_100%)]" />
                <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-5 sm:left-8 sm:right-8 sm:top-8">
                  <div>
                    <p className="text-[12px] font-medium tracking-[0.02em]">{tile.label}</p>
                    <h2 className="mt-3 text-[34px] leading-none tracking-[-0.045em] sm:text-5xl">
                      {tile.title}
                    </h2>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#202124]/15 bg-white/35 shadow-[0_18px_45px_rgba(32,33,36,.18)] backdrop-blur transition group-hover:translate-x-1 group-hover:bg-white/70">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
                <p className="absolute bottom-6 left-5 right-5 max-w-xl text-[15px] leading-7 text-white drop-shadow-[0_2px_14px_rgba(0,0,0,.5)] sm:left-8 sm:right-8 sm:text-base">
                  {tile.text}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href={dealerExperienceTiles[0].href}
            className="group relative isolate min-h-[520px] overflow-hidden bg-[#dcecf3] text-[#202124] outline-none sm:min-h-[640px] lg:min-h-[760px]"
          >
            <Image
              src={dealerExperienceTiles[0].src}
              alt={dealerExperienceTiles[0].alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,240,231,.84)_0%,rgba(244,240,231,.42)_28%,rgba(32,36,39,.08)_62%,rgba(32,36,39,.34)_100%)] transition duration-500 group-hover:bg-[linear-gradient(90deg,rgba(244,240,231,.72)_0%,rgba(244,240,231,.3)_28%,rgba(32,36,39,.05)_62%,rgba(32,36,39,.44)_100%)]" />
            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-5 sm:left-8 sm:right-8 sm:top-8">
              <div>
                <p className="text-[12px] font-medium tracking-[0.02em]">{dealerExperienceTiles[0].label}</p>
                <h2 className="mt-3 text-[38px] leading-none tracking-[-0.045em] sm:text-6xl">
                  {dealerExperienceTiles[0].title}
                </h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#202124]/15 bg-white/35 shadow-[0_18px_45px_rgba(32,33,36,.18)] backdrop-blur transition group-hover:translate-x-1 group-hover:bg-white/70">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <p className="absolute bottom-6 left-5 right-5 max-w-xl text-[15px] leading-7 text-white drop-shadow-[0_2px_14px_rgba(0,0,0,.5)] sm:left-8 sm:right-8 sm:text-base lg:text-[#202124] lg:drop-shadow-none">
              {dealerExperienceTiles[0].text}
            </p>
          </Link>
        </div>
      </section>

      <section className="py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
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

import { Globe2, Layers3, ShieldCheck, UsersRound } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Om Autorell | Europeisk fordonsmarknadsplats',
  description:
    'Autorell är en EU-baserad marknadsplats där privatpersoner och företag kan hitta och annonsera fordon.',
  path: '/om-oss',
})

export default function AboutPage() {
  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader />
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f8faff,#e8f1ff)]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Om Autorell</p>
          <h1 className="mt-5 max-w-5xl text-5xl leading-[1] tracking-[-.055em] sm:text-7xl">
            En sammanhållen marknadsplats för Europas fordonsmarknad.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
            Autorell utvecklar teknik för att göra fordon lättare att hitta,
            jämföra och annonsera över landsgränser. Vi köper inte fordon och
            agerar inte som bilhandlare eller exportör.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1240px] gap-5 px-5 py-16 sm:px-8 md:grid-cols-2">
        {[
          [Globe2, 'Byggd för EU', 'Lokala språk, relevanta valutor och landbaserad sökning gör marknaden användbar i hela unionen.'],
          [Layers3, 'Många kategorier', 'Från bilar och motorcyklar till fritidsfordon, transport, lantbruk, entreprenad och elektrisk mobilitet.'],
          [UsersRound, 'För privatpersoner och företag', 'Samma plattform stödjer enstaka privata annonser och återkommande företagslager.'],
          [ShieldCheck, 'Tydliga roller', 'Säljaren ansvarar för annonsen och affären. Autorell tillhandahåller marknadsplatsen, kontot och kommunikationen.'],
        ].map(([Icon, title, text]) => {
          const FeatureIcon = Icon as typeof Globe2
          return <article key={title as string} className="rounded-[24px] border border-[#e1e5ec] bg-white p-7"><FeatureIcon className="h-6 w-6 text-[#0866ff]" /><h2 className="mt-6 text-2xl">{title as string}</h2><p className="mt-3 leading-7 text-[#667085]">{text as string}</p></article>
        })}
      </section>
      <PublicFooter />
    </main>
  )
}

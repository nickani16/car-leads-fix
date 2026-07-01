import { FileCheck2, MessageCircle, ShieldCheck, UserCheck } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Tryggare fordonsaffärer | Autorell',
  description:
    'Så stödjer Autorell tydliga annonser, konton, meddelanden och rapportering på den europeiska fordonsmarknadsplatsen.',
  path: '/trygg-affar',
})

export default function SafeMarketplacePage() {
  const items = [
    [UserCheck, 'Tydligare konton', 'Privat- och företagskonton skiljs åt så att köpare kan förstå vilken typ av säljare de kontaktar.'],
    [FileCheck2, 'Strukturerade annonser', 'Pris, valuta, plats, skick och fordonsdata presenteras i ett jämförbart format.'],
    [MessageCircle, 'Kommunikation i plattformen', 'Registrerade användare kan kontakta säljaren och behålla konversationen kopplad till annonsen.'],
    [ShieldCheck, 'Rapportering och moderation', 'Misstänkta annonser, identitetsmissbruk och olämpliga meddelanden kan rapporteras för granskning.'],
  ] as const
  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader />
      <section className="border-b border-[#dce3ef] bg-white">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Tryggare marketplace</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1] tracking-[-.055em] sm:text-7xl">Bättre information före första kontakten.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
            Autorell skapar tydligare förutsättningar för kontakt mellan köpare
            och säljare. Parterna ansvarar själva för kontroll, avtal, betalning,
            transport och ägarbyte.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-5 px-5 py-16 sm:px-8 md:grid-cols-2">
        {items.map(([Icon, title, text]) => <article key={title} className="rounded-[24px] border border-[#e1e5ec] bg-white p-7"><Icon className="h-6 w-6 text-[#0866ff]" /><h2 className="mt-6 text-2xl">{title}</h2><p className="mt-3 leading-7 text-[#667085]">{text}</p></article>)}
      </section>
      <PublicFooter />
    </main>
  )
}

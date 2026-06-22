import { CircleHelp, MessageCircle, ShieldCheck } from 'lucide-react'
import { createPublicMetadata } from '@/lib/public-seo'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'
import FaqPageClient from './FaqPageClient'

export const metadata = createPublicMetadata({
  title: 'Hjälpcenter för Autorell marketplace',
  description:
    'Svar om konton, annonser, fasta priser, meddelanden, trygghet, företag och rapportering på Autorell.',
  path: '/hjalpcenter',
})

export default function FaqPage() {
  return (
    <main className="bg-[#f7f9fc] text-[#101828]">
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-[#e1e6ef] bg-white">
        <div className="market-blob absolute -right-24 -top-36 h-[420px] w-[420px] bg-[#e8f0ff]" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
                Autorell hjälpcenter
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl leading-[1] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
                Hjälp för köp, försäljning och tryggare affärer.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#667085]">
                Sök bland tydliga svar om konton, identitetskontroller, annonser,
                fasta priser, meddelanden och vad du gör om något verkar fel.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [ShieldCheck, 'Trygghet', 'Rapportera misstänkt bedrägeri och identitetsmissbruk.'],
                [MessageCircle, 'Meddelanden', 'Kontakta säljare och behåll kommunikationen i kontot.'],
                [CircleHelp, 'Support', 'Få hjälp med konto, annons, betalning eller granskning.'],
              ].map(([Icon, title, text]) => (
                <article key={String(title)} className="flex gap-4 rounded-[16px] border border-[#dde4ef] bg-[#f8faff] p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-[#0866ff] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <strong className="text-sm">{String(title)}</strong>
                    <p className="mt-1 text-xs leading-5 text-[#667085]">{String(text)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <FaqPageClient />
        </div>
      </section>
      <PublicFooter />
    </main>
  )
}

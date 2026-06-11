import { createPublicMetadata } from '@/lib/public-seo'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'
import FaqPageClient from './FaqPageClient'

export const metadata = createPublicMetadata({
  title: 'Vanliga frågor om att sälja bil | Autorell',
  description:
    'Svar om fordonskriterier, 24 timmars budgivning, kontroll, betalning, hämtning och export från Sverige.',
  path: '/vanliga-fragor',
})

export default function FaqPage() {
  return (
    <main className="bg-[#faf9f5] text-[#202124]">
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-[#e3e1da] py-20 sm:py-28">
        <div className="absolute -right-32 -top-44 h-[440px] w-[440px] rounded-full border-[58px] border-[#B4D9EF]/45" />
        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#59636c]">Hjälpcenter</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-[76px]">
            Vad undrar du över?
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#626e78]">
            Här hittar du svar om fordonskriterier, 24 timmars budgivning,
            kontroll, betalning, hämtning och export från Sverige.
          </p>
          <FaqPageClient />
        </div>
      </section>
      <PublicFooter />
    </main>
  )
}

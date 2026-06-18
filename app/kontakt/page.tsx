import { createPublicMetadata } from '@/lib/public-seo'
import PublicContactPage from '@/app/components/PublicContactPage'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'

export const metadata = createPublicMetadata({
  title: 'Kontakta Autorell | Säljare, företag och handlare',
  description:
    'Kontakta Autorell om att sälja bil, ett pågående ärende, företagslösningar, handlaråtkomst eller teknisk support.',
  path: '/kontakt',
})

export default function ContactPage() {
  return (
    <main className="overflow-hidden bg-[#f5f3ee] text-[#202124]">
      <PublicHeader />
      <PublicContactPage />
      <PublicFooter />
    </main>
  )
}

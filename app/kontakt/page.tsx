import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock3, Mail, MessageCircle, Store } from 'lucide-react'
import ContactForm from '../components/ContactForm'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata: Metadata = {
  title: 'Kontakta Autorell',
  description: 'Kontakta Autorell om bilvärdering, ett pågående ärende eller dealer-portalen.',
}

export default function ContactPage() {
  return (
    <main className="bg-[#faf9f5] text-[#202124]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#e3e1da] py-20 sm:py-28">
        <div className="absolute -right-28 -top-40 h-[420px] w-[420px] rounded-full border-[55px] border-[#B4D9EF]/45" />
        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#59636c]">Kontakt</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-[76px]">
            Hur kan vi hjälpa dig?
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#626e78]">
            Oavsett om du vill sälja en bil, har ett pågående ärende eller representerar en bilhandlare hjälper vi dig vidare.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
          <aside className="space-y-5">
            <ContactCard icon={Mail} title="E-post" text="info@autorell.com" href="mailto:info@autorell.com" />
            <ContactCard icon={Clock3} title="Svarstid" text="Vi återkommer normalt inom en arbetsdag." />
            <ContactCard icon={Store} title="Bilhandlare" text="Vill ni få tillgång till Autorell Dealer Network?" href="/dealer-apply" linkText="Ansök som handlare" />

            <div className="rounded-[22px] bg-[#B4D9EF] p-7 sm:p-8">
              <MessageCircle className="h-6 w-6" />
              <h2 className="mt-8 text-2xl tracking-[-0.03em]">Kanske finns svaret redan.</h2>
              <p className="mt-3 text-sm leading-7 text-[#4d5962]">
                Läs svar på de vanligaste frågorna om värdering, bud och försäljning.
              </p>
              <Link href="/vanliga-fragor" className="mt-7 inline-flex items-center gap-2 border-b border-[#242424] pb-1 text-sm">
                Se vanliga frågor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[24px] border border-[#e0ded7] shadow-[0_24px_70px_rgba(32,33,36,.08)]">
            <ContactForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

function ContactCard({
  icon: Icon,
  title,
  text,
  href,
  linkText,
}: {
  icon: typeof Mail
  title: string
  text: string
  href?: string
  linkText?: string
}) {
  return (
    <div className="rounded-[22px] border border-[#e0ded7] bg-white p-7 sm:p-8">
      <Icon className="h-5 w-5 text-[#242424]" />
      <h2 className="mt-7 text-sm uppercase tracking-[0.16em] text-[#858984]">{title}</h2>
      <p className="mt-3 leading-7 text-[#34383b]">{text}</p>
      {href && (
        <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
          {linkText || text} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

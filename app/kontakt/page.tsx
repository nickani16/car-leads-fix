import Link from 'next/link'
import { createPublicMetadata } from '@/lib/public-seo'
import {
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MessageCircle,
  Store,
  type LucideIcon,
} from 'lucide-react'
import ContactForm from '../components/ContactForm'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata = createPublicMetadata({
  title: 'Kontakta Autorell | Säljare, företag och handlare',
  description:
    'Kontakta Autorell om att sälja bil, ett pågående ärende, företagslösningar, handlaråtkomst eller teknisk support.',
  path: '/kontakt',
})

const contactPaths = [
  'Privat säljare',
  'Företagsfordon',
  'Bilhandlare',
  'Pågående ärende',
]

export default function ContactPage() {
  return (
    <main className="bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden border-b border-[#dde5e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_58%,#dcecf3_100%)]">
        <div className="absolute -right-44 -top-56 h-[560px] w-[560px] rounded-full border-[72px] border-white/55" />
        <div className="absolute -left-28 bottom-[-170px] h-[360px] w-[360px] rounded-full bg-[#b4d9ef]/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#547382]">
              Kontakt
            </p>
            <h1 className="mt-6 max-w-4xl text-[46px] leading-[.98] tracking-[-0.058em] sm:text-6xl lg:text-[78px]">
              Rätt kontakt direkt.
              <span className="block text-[#4f7181]">
                Vi hjälper dig vidare.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-8 text-[#536a75] sm:text-xl sm:leading-9">
              Välj ärende i formuläret så hamnar frågan rätt från början.
              Vi hjälper säljare, företag och godkända handlare med nästa steg.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {contactPaths.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white bg-white/72 px-4 py-2 text-xs font-medium text-[#4d6570] shadow-[0_12px_30px_rgba(60,84,96,.06)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#20272b] p-7 text-white shadow-[0_28px_80px_rgba(32,39,43,.22)] sm:p-9">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full border-[38px] border-[#B4D9EF]/15" />
            <Headphones className="relative h-7 w-7 text-[#B4D9EF]" />
            <p className="relative mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
              Autorell support
            </p>
            <h2 className="relative mt-3 text-3xl tracking-[-0.045em]">
              En kontaktväg. Tydligare svar.
            </h2>
            <p className="relative mt-4 text-sm leading-7 text-white/68">
              Skriv kort vad ärendet gäller. Vi återkopplar normalt inom en
              arbetsdag och kopplar in rätt person när ärendet kräver det.
            </p>
            <a
              href="mailto:info@autorell.com"
              className="relative mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              info@autorell.com <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:px-12">
          <aside className="grid gap-5 self-start">
            <ContactCard
              icon={Mail}
              title="E-post"
              text="info@autorell.com"
              href="mailto:info@autorell.com"
            />
            <ContactCard
              icon={Clock3}
              title="Svarstid"
              text="Vi återkommer normalt inom en arbetsdag."
            />
            <ContactCard
              icon={Store}
              title="Bilhandlare"
              text="Vill ni få tillgång till Autorell Dealer Network?"
              href="/dealer-apply"
              linkText="Ansök som handlare"
            />

            <div className="relative overflow-hidden rounded-[24px] bg-[#B4D9EF] p-7 shadow-[0_18px_55px_rgba(70,105,122,.13)] sm:p-8">
              <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full border-[22px] border-white/28" />
              <MessageCircle className="relative h-6 w-6" />
              <h2 className="relative mt-8 text-2xl tracking-[-0.035em]">
                Kanske finns svaret redan.
              </h2>
              <p className="relative mt-3 text-sm leading-7 text-[#445761]">
                Läs svar på vanliga frågor om värdering, bud, kontroll och
                försäljning.
              </p>
              <Link
                href="/vanliga-fragor"
                className="relative mt-7 inline-flex items-center gap-2 border-b border-[#242424] pb-1 text-sm font-semibold"
              >
                Se vanliga frågor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_28px_80px_rgba(32,33,36,.1)] ring-1 ring-[#dce6ea]">
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
  icon: LucideIcon
  title: string
  text: string
  href?: string
  linkText?: string
}) {
  return (
    <div className="group rounded-[24px] border border-[#dfe4e5] bg-white/88 p-7 shadow-[0_16px_45px_rgba(60,84,96,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(60,84,96,.09)] sm:p-8">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef7fb] text-[#315f74]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#7e8a8e]">
        {title}
      </h2>
      <p className="mt-3 leading-7 text-[#2f373b]">{text}</p>
      {href && (
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#315f74] underline-offset-4 hover:underline"
        >
          {linkText || text} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

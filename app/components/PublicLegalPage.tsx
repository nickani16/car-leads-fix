import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}

export default function PublicLegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <main className="bg-[#faf9f5] text-[#202124]">
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-[#e3e1da] bg-white py-20 sm:py-28">
        <div className="absolute -right-32 -top-44 h-[440px] w-[440px] rounded-full border-[58px] border-[#B4D9EF]/45" />
        <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#59636c]">
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-[72px]">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#626e78]">
            {intro}
          </p>
          <p className="mt-6 text-sm text-[#858a8c]">
            Senast uppdaterad: 22 juni 2026
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-12">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="rounded-[20px] border border-[#deddd7] bg-white p-3 shadow-[0_12px_40px_rgba(32,33,36,.05)]">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-[12px] px-4 py-3 text-sm text-[#62686c] transition hover:bg-[#eff8fd] hover:text-[#242424]"
                >
                  {section.title}
                  <ArrowRight size={14} />
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_12px_40px_rgba(32,33,36,.04)] sm:p-8"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#B4D9EF] text-sm font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl tracking-[-0.025em]">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-7 text-[#555d61]">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <CheckCircle2
                            size={17}
                            className="mt-1.5 shrink-0 text-[#6ea9ca]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}

            <div className="rounded-[22px] bg-[#242424] p-7 text-white sm:p-9">
              <ShieldCheck className="text-[#B4D9EF]" size={28} />
              <h2 className="mt-5 text-2xl">Frågor om dina uppgifter?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                Kontakta oss om du vill förstå hur ett ärende hanteras eller
                använda dina dataskyddsrättigheter.
              </p>
              <Link
                href="/kontakt"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#B4D9EF] px-5 py-3 text-sm text-[#242424]"
              >
                Kontakta Autorell
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  )
}

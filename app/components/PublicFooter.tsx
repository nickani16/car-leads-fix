import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BrandLogo from './BrandLogo'

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#f3f2ee] text-[#202124]">
      <div
        className="pointer-events-none absolute -bottom-36 -right-32 h-[360px] w-[360px] rounded-full border-[48px] border-[#242424]/[0.045] sm:-bottom-44 sm:-right-36 sm:h-[460px] sm:w-[460px] sm:border-[62px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-[210px] w-[210px] rounded-full border-[24px] border-[#B4D9EF]/50 sm:-bottom-24 sm:-right-20 sm:h-[270px] sm:w-[270px] sm:border-[30px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-10 border-b border-[#d9d7d0] py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div>
            <BrandLogo />
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#666864]">
              En enklare och tryggare väg mellan bilägare och professionella köpare.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <p className="max-w-xs text-sm leading-6 text-[#666864]">
              Nyfiken på vad din bil kan vara värd?
            </p>
            <Link
              href="/salj-bil"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-normal text-white transition hover:bg-[#111111]"
            >
              Starta värderingen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.7fr_.9fr] lg:gap-16">
          <p className="max-w-sm text-2xl leading-9 tracking-[-0.025em] text-[#2b2b2a]">
            Bilaffärer med större räckvidd och mindre krångel.
          </p>

          <FooterColumn
            title="Sälja bil"
            links={[
              ['Värdera din bil', '/salj-bil'],
              ['Så fungerar det', '/#sa-fungerar-det'],
              ['Vanliga frågor', '/vanliga-fragor'],
            ]}
          />
          <FooterColumn
            title="Handlare"
            links={[
              ['Bli partner', '/dealer-apply'],
              ['Dealer login', '/login'],
            ]}
          />

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
              Kontakt
            </h3>
            <div className="mt-6 flex flex-col gap-4 text-sm">
              <a href="mailto:info@autorell.com" className="transition hover:opacity-55">
                info@autorell.com
              </a>
              <Link href="/kontakt" className="transition hover:opacity-55">
                Kontakta oss
              </Link>
              <p className="max-w-[240px] leading-6 text-[#72736f]">
                Personlig support för både bilägare och handlare.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#d9d7d0] py-7 text-xs text-[#858681] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Autorell AB</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/integritet" className="transition hover:text-[#242424]">
              Integritetspolicy
            </Link>
            <Link href="/cookies" className="transition hover:text-[#242424]">
              Cookies
            </Link>
            <Link href="/villkor" className="transition hover:text-[#242424]">
              Användarvillkor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
        {title}
      </h3>
      <nav className="mt-6 flex flex-col items-start gap-4 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="transition hover:opacity-55">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

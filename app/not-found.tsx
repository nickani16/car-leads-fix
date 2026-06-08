import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import BrandLogo from './components/BrandLogo'

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f4ef] text-[#202124]">
      <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border-[70px] border-[#B4D9EF]/55" />
      <div className="absolute -bottom-48 -left-32 h-[460px] w-[460px] rounded-full border-[75px] border-white" />

      <header className="relative z-10 mx-auto flex h-24 max-w-[1320px] items-center px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Autorell startsida">
          <BrandLogo />
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-[1320px] content-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#66747d]">
            Error 404
          </p>
          <h1 className="mt-6 max-w-3xl text-[52px] leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[92px]">
            Den här vägen leder inte rätt.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#5d6c74] sm:text-lg sm:leading-8">
            Sidan kan ha flyttats eller länken kan vara fel. Du kan gå tillbaka
            till startsidan eller börja värdera din bil direkt.
          </p>
          <div className="mt-9 grid gap-3 sm:flex">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#242424] px-7 text-white sm:rounded-full"
            >
              <ArrowLeft size={18} />
              Till startsidan
            </Link>
            <Link
              href="/salj-bil"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#B4D9EF] px-7 text-[#242424] sm:rounded-full"
            >
              Värdera din bil
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center">
          <div className="absolute inset-0 rounded-full bg-white shadow-[0_35px_90px_rgba(32,33,36,.09)]" />
          <div className="absolute inset-[13%] rounded-full border border-[#d9e8f1]" />
          <div className="relative text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#B4D9EF]">
              <Search size={26} />
            </span>
            <strong className="mt-6 block text-[88px] leading-none tracking-[-0.08em]">
              404
            </strong>
            <span className="mt-3 block text-sm text-[#6b7479]">
              Page not found
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

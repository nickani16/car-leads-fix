import BrandLogo from '@/app/components/BrandLogo'
import { getAccountCopy } from '@/lib/account-i18n'
import { getRequestLocale } from '@/lib/request-locale'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const locale = await getRequestLocale()
  const copy = getAccountCopy(locale)
  return (
    <main className="min-h-screen bg-[#f5f8ff] px-5 py-10 text-[#101828]">
      <div className="mx-auto max-w-4xl">
        <Link href="/" aria-label="Autorell"><BrandLogo /></Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <section className="pt-5">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.account}</p>
            <h1 className="mt-4 text-5xl leading-[1] tracking-[-.05em]">{copy.register}</h1>
            <p className="mt-5 leading-7 text-[#667085]">Create a private or business account to publish listings, save searches and contact sellers securely across Europe.</p>
          </section>
          <RegisterForm locale={locale} />
        </div>
      </div>
    </main>
  )
}
import Link from 'next/link'

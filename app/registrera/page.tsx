import Link from 'next/link'
import { redirect } from 'next/navigation'
import BrandLogo from '@/app/components/BrandLogo'
import EmailCodeAuth from '@/app/components/EmailCodeAuth'
import { getAccountCopy } from '@/lib/account-i18n'
import { getRequestLocale } from '@/lib/request-locale'
import { createClient } from '@/lib/supabase/server'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const locale = await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return <EmailCodeAuth locale={locale} mode="register" />
  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile) redirect('/konto')
  const copy = getAccountCopy(locale)
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fc] px-5 py-8 text-[#101828] sm:py-12">
      <div className="mx-auto min-w-0 max-w-[1180px]">
        <Link href="/" aria-label="Autorell"><BrandLogo /></Link>
        <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start lg:gap-16">
          <section className="min-w-0 lg:sticky lg:top-10 lg:pt-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.account}</p>
            <h1 className="mt-4 max-w-md break-words text-[42px] leading-[.98] tracking-[-.055em] sm:text-6xl">
              Ett konto för tryggare fordonsaffärer i Europa.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#667085]">{copy.registerDescription}</p>
            <div className="mt-8 grid gap-3 text-sm text-[#475467]">
              {[
                'Privatperson eller verifierbart företag',
                'Kontaktuppgifter och adress kopplas till kontot',
                'Skriv till säljare och samla ärenden på ett ställe',
                'Kontroller som minskar falska och dubbla konton',
              ].map((item) => (
                <p key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-[3px] bg-[#0866ff]" />
                  {item}
                </p>
              ))}
            </div>
          </section>
          <RegisterForm locale={locale} email={user.email || ''} />
        </div>
      </div>
    </main>
  )
}

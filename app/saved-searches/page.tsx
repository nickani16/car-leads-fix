import SavedSearchesClient from '@/app/components/SavedSearchesClient'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-searches')

export default async function SavedSearchesPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            Dina filter
          </span>
          <h1 className="mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">
            Sparade sökningar
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
            Spara kombinationer av marknad, fordonstyp, pris och tekniska filter
            så att du snabbt kan fortsätta bevaka samma urval.
          </p>
        </div>
      </section>
      <SavedSearchesClient locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}

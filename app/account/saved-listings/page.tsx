import SavedListingsClient from '@/app/components/SavedListingsClient'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-listings')

export default async function AccountSavedListingsPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const copy = savedListingsCopy(locale)
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
            {copy.intro}
          </p>
        </div>
      </section>
      <SavedListingsClient locale={locale} marketCode={marketCode} />
    </main>
  )
}

function savedListingsCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Your watchlist',
    title: 'Saved listings',
    intro: 'Keep interesting vehicles in one place and return when you are ready to contact the seller.',
  }
  if (locale === 'sv') {
    return {
      eyebrow: 'Din bevakningslista',
      title: 'Sparade annonser',
      intro: 'Samla intressanta fordon på ett ställe och återvänd när du är redo att kontakta säljaren.',
    }
  }
  if (locale === 'de') {
    return {
      eyebrow: 'Ihre Merkliste',
      title: 'Gespeicherte Anzeigen',
      intro: 'Sammeln Sie interessante Fahrzeuge an einem Ort und kehren Sie zurück, wenn Sie den Verkäufer kontaktieren möchten.',
    }
  }
  return translatePublicObject(locale, en)
}

import SavedSearchesClient from '@/app/components/SavedSearchesClient'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('saved-searches')

export default async function AccountSavedSearchesPage() {
  const locale = await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const copy = savedSearchesCopy(locale)
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
      <SavedSearchesClient locale={locale} />
    </main>
  )
}

function savedSearchesCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Saved filters',
    title: 'Saved searches',
    intro: 'Return to the same market, category, price and vehicle filters without starting from scratch.',
  }
  if (locale === 'sv') {
    return {
      eyebrow: 'Sparade filter',
      title: 'Sparade sökningar',
      intro: 'Återvänd till samma marknad, kategori, pris och fordonsfilter utan att börja om.',
    }
  }
  if (locale === 'de') {
    return {
      eyebrow: 'Gespeicherte Filter',
      title: 'Gespeicherte Suchen',
      intro: 'Kehren Sie zu denselben Markt-, Kategorie-, Preis- und Fahrzeugfiltern zurück, ohne neu zu beginnen.',
    }
  }
  return translatePublicObject(locale, en)
}

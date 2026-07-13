import { redirect } from 'next/navigation'
import { FilePlus2, ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { euCountryCodes } from '@/lib/eu-countries'
import { countryForLocale } from '@/lib/market-locale'
import NewListingForm from './NewListingForm'
import { headers } from 'next/headers'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('new-listing')

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  return renderNewListingPage({ searchParams })
}

export async function renderNewListingPage({
  searchParams,
  marketCodeOverride,
  localeOverride,
}: {
  searchParams: Promise<{ category?: string }>
  marketCodeOverride?: string
  localeOverride?: PublicLocale
}) {
  const locale = localeOverride || await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const { data: profile } = await createAdminClient()
    .from('marketplace_profiles')
    .select('account_type,country_code')
    .eq('user_id', user.id)
    .single()
  if (!profile) redirect(localizePublicHref(locale, '/register'))

  const { category = 'cars' } = await searchParams
  const requestHeaders = await headers()
  const marketCode = (marketCodeOverride || requestHeaders.get('x-autorell-market') || '').toUpperCase()
  const localeCountry = countryForLocale(locale)
  const listingCountryCode =
    euCountryCodes.has(marketCode)
      ? marketCode
      : localeCountry !== 'EU' && euCountryCodes.has(localeCountry)
        ? localeCountry
        : profile.country_code || 'SE'
  const copy = getNewListingPageCopy(locale)

  return (
    <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-[#dfe6f1] bg-[#f4f8ff] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-white text-[#0866ff] shadow-sm">
              <FilePlus2 className="h-6 w-6" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[-.04em] text-[#101828]">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              {copy.intro}
            </p>
            <div className="mt-5 flex gap-3 rounded-[18px] border border-[#cfe0f5] bg-white/80 p-4 text-sm leading-6 text-[#475467]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
              {copy.trust}
            </div>
          </aside>
          <div className="min-w-0 p-4 sm:p-6 lg:p-8">
            <NewListingForm
              accountType={profile.account_type}
              countryCode={listingCountryCode}
              defaultCategory={category}
              locale={locale}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function getNewListingPageCopy(locale: PublicLocale) {
  const en = {
    back: 'Back to listings',
    eyebrow: 'New listing',
    title: 'Create listing',
    intro: 'Enter structured vehicle data. The listing is checked before it becomes searchable.',
    trust: 'You confirm ownership rights and accurate information before publishing.',
  }
  if (locale === 'sv') {
    return {
      back: 'Tillbaka till annonser',
      eyebrow: 'Ny annons',
      title: 'Skapa annons',
      intro: 'Fyll i strukturerad fordonsdata. Annonsen kontrolleras innan den blir sökbar.',
      trust: 'Du bekräftar äganderätt och korrekta uppgifter innan publicering.',
    }
  }
  if (locale === 'de') {
    return {
      back: 'Zurück zu Anzeigen',
      eyebrow: 'Neue Anzeige',
      title: 'Anzeige erstellen',
      intro: 'Gib strukturierte Fahrzeugdaten ein. Die Anzeige wird geprüft, bevor sie suchbar ist.',
      trust: 'Du bestätigst Eigentumsrecht und korrekte Angaben vor der Veröffentlichung.',
    }
  }
  return Object.fromEntries(
    Object.entries(en).map(([key, value]) => [key, translatePublic(locale, value)]),
  ) as typeof en
}

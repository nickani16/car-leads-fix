import { redirect } from 'next/navigation'
import { FilePlus2, ShieldCheck } from 'lucide-react'
import { AccountBreadcrumbs } from '@/app/account/AccountBreadcrumbs'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { euCountryCodes } from '@/lib/eu-countries'
import { countryForLocale, currencyForLocale } from '@/lib/market-locale'
import { currencyForCountry } from '@/lib/marketplace'
import NewListingForm from './NewListingForm'
import { cookies, headers } from 'next/headers'
import { generateAccountMetadata } from '@/lib/account-seo'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'
import { ACCOUNT_INTENT_COOKIE } from '@/lib/account-intent'
import {
  accountIntentFromCookieAndUser,
  ensureMarketplaceProfile,
  isMarketplaceProfileComplete,
} from '@/lib/account-profile-bootstrap'

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

  const { category = 'cars' } = await searchParams

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type,country_code,company_id,first_name,last_name,birth_date,phone,address_line_1,postal_code,city,company_name,registration_number,national_id_last4')
    .eq('user_id', user.id)
    .single()
  if (!profile) {
    const cookieStore = await cookies()
    const accountIntent = accountIntentFromCookieAndUser(
      cookieStore.get(ACCOUNT_INTENT_COOKIE)?.value,
      user,
    )
    const listingParams = new URLSearchParams({ category })
    const next = localizePublicHref(locale, `/account/listings/new?${listingParams.toString()}`)
    if (accountIntent.accountType === 'business') {
      const registrationParams = new URLSearchParams({ account: 'business', next })
      redirect(localizePublicHref(locale, `/register?${registrationParams.toString()}`))
    }
    await ensureMarketplaceProfile({ user, locale, intent: accountIntent })
    const profileParams = new URLSearchParams({ reason: 'listing', next })
    redirect(localizePublicHref(locale, `/account/profile?${profileParams.toString()}`))
  }
  if (!isMarketplaceProfileComplete(profile)) {
    const listingParams = new URLSearchParams({ category })
    const next = localizePublicHref(locale, `/account/listings/new?${listingParams.toString()}`)
    const profilePath = profile.account_type === 'business'
      ? '/account/company/profile'
      : '/account/profile'
    const profileParams = new URLSearchParams({ reason: 'listing', next })
    redirect(localizePublicHref(locale, `${profilePath}?${profileParams.toString()}`))
  }
  if (profile.account_type === 'business') {
    const entitlement = await requireBusinessListingEntitlement(user.id)
    if (!entitlement.allowed) redirect('/account/business/subscription')
  }

  const requestHeaders = await headers()
  const marketCode = (marketCodeOverride || requestHeaders.get('x-autorell-market') || '').toUpperCase()
  const localeCountry = countryForLocale(locale)
  const marketCountryCode = euCountryCodes.has(marketCode) ? marketCode : ''
  const localeCountryCode =
    localeCountry !== 'EU' && euCountryCodes.has(localeCountry) ? localeCountry : ''
  const profileCountryCode =
    profile.country_code && euCountryCodes.has(profile.country_code) ? profile.country_code : ''
  const fallbackCountryCode = locale === 'en' ? 'DE' : profileCountryCode || 'SE'
  const listingCountryCode =
    marketCountryCode ||
    localeCountryCode ||
    fallbackCountryCode
  const billingMarketCode =
    marketCountryCode ||
    localeCountryCode ||
    (locale === 'en' ? 'DE' : listingCountryCode)
  const listingCurrency =
    marketCountryCode || localeCountryCode
      ? currencyForCountry(listingCountryCode)
      : currencyForLocale(locale)
  const copy = getNewListingPageCopy(locale)
  const companyLocations = profile.account_type === 'business'
    ? await loadCompanyLocations(admin, profile.company_id)
    : []

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1360px]">
        <AccountBreadcrumbs
          locale={locale}
          items={[{ key: 'account', href: '/account' }, { key: 'createListing' }]}
          className="mb-5"
        />
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
              billingMarketCode={billingMarketCode}
              defaultCurrency={listingCurrency}
              defaultCategory={category}
              locale={locale}
              companyLocations={companyLocations}
            />
          </div>
        </div>
        </section>
      </div>
    </main>
  )
}

async function loadCompanyLocations(admin: ReturnType<typeof createAdminClient>, companyId: string | null) {
  if (!companyId) return []
  try {
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,location_type,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_primary')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
      .limit(250)
    if (error || !data) return []
    return data.map((item) => ({
      id: String(item.id),
      name: String(item.name || ''),
      locationType: String(item.location_type || 'branch'),
      countryCode: String(item.country_code || ''),
      region: String(item.region || ''),
      municipality: String(item.municipality || ''),
      city: String(item.city || ''),
      postalCode: String(item.postal_code || ''),
      addressLine1: String(item.address_line_1 || ''),
      contactEmail: String(item.contact_email || ''),
      contactPhone: String(item.contact_phone || ''),
      isPrimary: Boolean(item.is_primary),
    }))
  } catch {
    return []
  }
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

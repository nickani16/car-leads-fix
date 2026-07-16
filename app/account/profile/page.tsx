import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import ProfileForm from '@/app/konto/ProfileForm'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('profile')

type ProfileRow = {
  account_type: 'private' | 'business'
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  email: string
  phone: string
  phone_verified: boolean | null
  phone_verification_status: string | null
  phone_risk_flags: string[] | null
  country_code: string
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  website_url: string | null
  logo_url: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  identity_status: string
  business_verification_status: string | null
  risk_status: string
  national_id_last4: string | null
}

export default async function PrivateProfilePage() {
  const locale = await getRequestLocale()
  const copy = profileCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select(`
      account_type,
      first_name,
      last_name,
      birth_date,
      email,
      phone,
      phone_verified,
      phone_verification_status,
      phone_risk_flags,
      country_code,
      company_name,
      registration_number,
      vat_number,
      website_url,
      logo_url,
      address_line_1,
      address_line_2,
      city,
      region,
      postal_code,
      identity_status,
      business_verification_status,
      risk_status,
      national_id_last4
    `)
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>()

  if (!profile) redirect(localizePublicHref(locale, '/register'))
  if (profile.account_type === 'business') redirect(localizePublicHref(locale, '/account/company/profile'))

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={localizePublicHref(locale, '/account')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>

        <section className="mt-6 rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#101828]">
                {copy.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
                {copy.intro}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-4 py-2 text-xs font-bold text-[#0866ff]">
              <ShieldCheck className="h-4 w-4" />
              {copy.privateAccount}
            </span>
          </div>
        </section>

        <section className="mt-6">
          <ProfileForm profile={profile} locale={locale} emailConfirmed={Boolean(user.email_confirmed_at)} />
        </section>
      </div>
    </main>
  )
}

function profileCopy(locale: PublicLocale) {
  const en = {
    back: 'My pages',
    eyebrow: 'Profile',
    title: 'Profile and contact details',
    intro: 'Keep your private seller details up to date. We show only what is needed publicly.',
    privateAccount: 'Private account',
  }
  if (locale === 'sv') {
    return {
      back: 'Mina sidor',
      eyebrow: 'Profil',
      title: 'Profil och kontaktuppgifter',
      intro: 'Håll dina privata säljaruppgifter uppdaterade. Publikt visar vi bara det som behövs.',
      privateAccount: 'Privatkonto',
    }
  }
  if (locale === 'de') {
    return {
      back: 'Mein Konto',
      eyebrow: 'Profil',
      title: 'Profil und Kontaktdaten',
      intro: 'Halten Sie Ihre privaten Verkäuferdaten aktuell. Öffentlich zeigen wir nur das Nötige.',
      privateAccount: 'Privatkonto',
    }
  }
  return translatePublicObject(locale, en)
}

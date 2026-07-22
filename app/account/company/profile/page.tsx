import ProfileForm from '@/app/konto/ProfileForm'
import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasVerifiedEmailCode } from '@/lib/email-verification'

const baseCopy = {
  title: 'Company profile',
  description: 'Manage company presentation, contact details and verified legal information.',
}

export default async function CompanyProfilePage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const { data: profile } = await createAdminClient()
    .from('marketplace_profiles')
    .select('account_type,first_name,last_name,birth_date,email,phone,phone_verified,phone_verification_status,phone_risk_flags,country_code,company_name,registration_number,vat_number,website_url,logo_url,address_line_1,address_line_2,city,region,postal_code,identity_status,business_verification_status,risk_status,national_id_last4')
    .eq('user_id', context.userId)
    .maybeSingle()
  const emailVerified = await hasVerifiedEmailCode(profile?.email)

  return (
    <CompanyPortalShell context={context} active="profile" title={copy.title} description={copy.description}>
      {profile ? <ProfileForm profile={profile} locale={context.locale} emailConfirmed={emailVerified} /> : null}
    </CompanyPortalShell>
  )
}

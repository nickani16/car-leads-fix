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
    .select('account_type,first_name,last_name,birth_date,email,phone,phone_verified,phone_verification_status,phone_risk_flags,country_code,company_name,registration_number,vat_number,website_url,logo_url,address_line_1,address_line_2,city,region,postal_code,identity_status,business_verification_status,risk_status,national_id_last4,company_id')
    .eq('user_id', context.userId)
    .maybeSingle()
  const { data: company } = profile?.company_id
    ? await createAdminClient()
        .from('marketplace_companies')
        .select('contact_email,contact_phone,phone')
        .eq('id', profile.company_id)
        .maybeSingle()
    : { data: null }
  const emailVerified = await hasVerifiedEmailCode(profile?.email)
  const formProfile = profile
    ? {
        ...profile,
        company_contact_email: company?.contact_email || '',
        company_contact_phone: company?.contact_phone || company?.phone || '',
      }
    : null

  return (
    <CompanyPortalShell context={context} active="profile" title={copy.title} description={copy.description}>
      {formProfile ? <ProfileForm profile={formProfile} locale={context.locale} emailConfirmed={emailVerified} /> : null}
    </CompanyPortalShell>
  )
}

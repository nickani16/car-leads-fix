import { generateAccountMetadata } from '@/lib/account-seo'
import AccountListingsPage from '@/app/konto/annonser/page'
import type { PublicLocale } from '@/lib/public-i18n'

export default function CompanyListingsPage({
  searchParams,
  localeOverride,
  marketOverride,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  localeOverride?: PublicLocale
  marketOverride?: string
}) {
  return (
    <AccountListingsPage
      searchParams={searchParams}
      localeOverride={localeOverride}
      marketOverride={marketOverride}
      companyMode
    />
  )
}

export const generateMetadata = generateAccountMetadata('company-listings')

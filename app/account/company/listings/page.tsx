import { generateAccountMetadata } from '@/lib/account-seo'
import AccountListingsPage from '@/app/konto/annonser/page'

export default function CompanyListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <AccountListingsPage searchParams={searchParams} />
}

export const generateMetadata = generateAccountMetadata('company-listings')

export type SellerAccountType = 'private' | 'business' | string | null | undefined

export type SellerPublicProfile = {
  account_type?: SellerAccountType
  seller_type?: SellerAccountType
  first_name?: string | null
  display_name?: string | null
  company_name?: string | null
}

export type PublicSellerNameInput = SellerPublicProfile & {
  sellerName?: string | null
}

export function firstNameOnly(value?: string | null) {
  const clean = cleanName(value)
  if (!clean) return ''
  return clean.split(/\s+/)[0] || ''
}

export function publicSellerName(input: PublicSellerNameInput, fallback = 'Privat säljare') {
  const accountType = input.account_type || input.seller_type
  if (accountType === 'business') {
    return cleanName(input.company_name) || cleanName(input.sellerName) || cleanName(input.display_name) || 'Företagssäljare'
  }

  return firstNameOnly(input.first_name) || firstNameOnly(input.sellerName) || firstNameOnly(input.display_name) || fallback
}

export function sanitizePublicListingSellerName<T extends { seller_type?: string | null; seller_name?: string | null }>(
  listing: T,
) {
  return {
    ...listing,
    seller_name: publicSellerName({
      seller_type: listing.seller_type,
      sellerName: listing.seller_name,
      display_name: listing.seller_name,
    }),
  }
}

function cleanName(value?: string | null) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

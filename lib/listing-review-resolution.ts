const informationalIdentifierFlags = new Set([
  'missing_vin',
  'missing_serial_number',
])

export const listingReviewThreshold = 50

export function reviewableListingRiskFlags(flags: unknown) {
  if (!Array.isArray(flags)) return []
  return flags
    .map((flag) => String(flag || '').trim())
    .filter(Boolean)
    .filter((flag) => !informationalIdentifierFlags.has(flag))
}

export function listingRiskScore(flags: unknown) {
  return Math.min(100, reviewableListingRiskFlags(flags).reduce((score, flag) => {
    if (flag === 'unusually_low_price') return score + 30
    if (flag === 'many_listings_short_time') return score + 25
    if (flag === 'same_phone_multiple_accounts') return score + 25
    if (flag === 'new_user') return score + 15
    if (flag.startsWith('profile_')) return score + 35
    return score + 20
  }, 0))
}

export function listingNeedsReview(flags: unknown) {
  return listingRiskScore(flags) >= listingReviewThreshold
}

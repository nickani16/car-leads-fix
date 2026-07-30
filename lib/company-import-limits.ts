export type CompanyImportPlanKey = 'free' | 'starter' | 'growth' | 'professional' | 'enterprise'

export type CompanyImportLimits = {
  planKey: CompanyImportPlanKey
  maxRows: number
  maxImagesPerListing: number
  recurringFeeds: boolean
  apiAccess: boolean
}

const defaultLimits: Record<CompanyImportPlanKey, CompanyImportLimits> = {
  free: {
    planKey: 'free',
    maxRows: 10,
    maxImagesPerListing: 1,
    recurringFeeds: false,
    apiAccess: false,
  },
  starter: {
    planKey: 'starter',
    maxRows: 50,
    maxImagesPerListing: 2,
    recurringFeeds: false,
    apiAccess: false,
  },
  growth: {
    planKey: 'growth',
    maxRows: 250,
    maxImagesPerListing: 3,
    recurringFeeds: false,
    apiAccess: false,
  },
  professional: {
    planKey: 'professional',
    maxRows: 500,
    maxImagesPerListing: 5,
    recurringFeeds: true,
    apiAccess: true,
  },
  enterprise: {
    planKey: 'enterprise',
    maxRows: 1000,
    maxImagesPerListing: 8,
    recurringFeeds: true,
    apiAccess: true,
  },
}

export function normalizeCompanyImportPlanKey(planKey: string | null | undefined): CompanyImportPlanKey {
  const key = String(planKey || 'free').toLowerCase()
  return key in defaultLimits ? key as CompanyImportPlanKey : 'free'
}

export function companyImportLimitsForPlan(planKey: string | null | undefined): CompanyImportLimits {
  return defaultLimits[normalizeCompanyImportPlanKey(planKey)]
}

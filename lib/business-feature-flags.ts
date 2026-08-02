import 'server-only'

import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

export const BUSINESS_FEATURE_FLAGS = [
  'business_pilot_program',
  'dealer_inventory_import',
  'dealer_website_import',
  'dealer_feed_import',
  'dealer_api_import',
  'dealer_dms_onboarding',
  'dealer_inventory_sync',
] as const

export type BusinessFeatureFlag = (typeof BUSINESS_FEATURE_FLAGS)[number]

export type BusinessFeatureScope = {
  marketCode?: string | null
  organizationId?: string | null
  pilotProgramId?: string | null
}

type FeatureOverride = {
  enabled: boolean
  market_code: string | null
  organization_id: string | null
  pilot_program_id: string | null
  updated_at: string | null
}

const nonProductionDefaults: Record<BusinessFeatureFlag, boolean> = {
  business_pilot_program: true,
  dealer_inventory_import: true,
  dealer_website_import: true,
  dealer_feed_import: false,
  dealer_api_import: false,
  dealer_dms_onboarding: true,
  dealer_inventory_sync: true,
}

export const resolveBusinessFeatureFlags = cache(async (
  scope: BusinessFeatureScope = {},
): Promise<Record<BusinessFeatureFlag, boolean>> => {
  const entries = await Promise.all(
    BUSINESS_FEATURE_FLAGS.map(async (flag) => [
      flag,
      await isBusinessFeatureEnabled(flag, scope),
    ] as const),
  )
  return Object.fromEntries(entries) as Record<BusinessFeatureFlag, boolean>
})

export async function isBusinessFeatureEnabled(
  flag: BusinessFeatureFlag,
  scope: BusinessFeatureScope = {},
) {
  const environment = featureEnvironment()
  const environmentValue = booleanEnvironmentOverride(flag)
  if (environmentValue !== null) return environmentValue

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('feature_flag_overrides')
      .select('enabled,market_code,organization_id,pilot_program_id,updated_at')
      .eq('flag_key', flag)
      .eq('environment', environment)

    if (error) throw error
    const match = selectMostSpecificOverride((data || []) as FeatureOverride[], scope)
    if (match) return match.enabled
  } catch {
    // Local builds and early previews may run before the migration or env vars exist.
  }

  if (environment === 'production') return false
  return nonProductionDefaults[flag]
}

function featureEnvironment(): 'development' | 'preview' | 'production' | 'test' {
  const vercelEnvironment = String(process.env.VERCEL_ENV || '').toLowerCase()
  if (vercelEnvironment === 'preview' || vercelEnvironment === 'production') {
    return vercelEnvironment
  }
  if (process.env.NODE_ENV === 'test') return 'test'
  return 'development'
}

function booleanEnvironmentOverride(flag: BusinessFeatureFlag) {
  const key = `AUTORELL_FEATURE_${flag.toUpperCase()}`
  const value = String(process.env[key] || '').trim().toLowerCase()
  if (['1', 'true', 'on', 'enabled'].includes(value)) return true
  if (['0', 'false', 'off', 'disabled'].includes(value)) return false
  return null
}

function selectMostSpecificOverride(
  overrides: FeatureOverride[],
  scope: BusinessFeatureScope,
) {
  const marketCode = String(scope.marketCode || '').toLowerCase() || null
  const organizationId = scope.organizationId || null
  const pilotProgramId = scope.pilotProgramId || null

  return overrides
    .filter((override) => (
      (!override.market_code || override.market_code === marketCode) &&
      (!override.organization_id || override.organization_id === organizationId) &&
      (!override.pilot_program_id || override.pilot_program_id === pilotProgramId)
    ))
    .sort((left, right) => {
      const score = (value: FeatureOverride) =>
        Number(Boolean(value.market_code)) +
        Number(Boolean(value.organization_id)) * 2 +
        Number(Boolean(value.pilot_program_id)) * 4
      return score(right) - score(left) ||
        String(right.updated_at || '').localeCompare(String(left.updated_at || ''))
    })[0] || null
}

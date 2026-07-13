import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  getConfiguredStripePriceId,
  getProductAmount,
  getStripePriceEnvName,
  type BillingCurrency,
  type BillingMarket,
  type BillingProduct,
} from '@/lib/billing/product-catalog'

export type BillingPriceLookup = {
  currency: BillingCurrency
  amountMinor: number
  stripePriceId: string | null
  source: 'database' | 'environment' | 'catalog'
  requiredEnv?: string
}

export async function resolveBillingPrice(product: BillingProduct, market: BillingMarket): Promise<BillingPriceLookup | null> {
  const catalogAmount = getProductAmount(product, market)
  if (!catalogAmount) return null

  const { data, error } = await createAdminClient()
    .from('billing_product_prices')
    .select('currency,amount_minor,stripe_price_id')
    .eq('product_key', product.productKey)
    .eq('market', market)
    .eq('active', true)
    .lte('effective_from', new Date().toISOString())
    .or(`effective_to.is.null,effective_to.gt.${new Date().toISOString()}`)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && !String(error.message || '').includes('does not exist')) {
    throw error
  }

  if (data) {
    return {
      currency: String(data.currency).toLowerCase() as BillingCurrency,
      amountMinor: Number(data.amount_minor),
      stripePriceId: data.stripe_price_id || null,
      source: 'database',
    }
  }

  const stripePriceId = getConfiguredStripePriceId(product.productKey, catalogAmount.currency)
  return {
    ...catalogAmount,
    stripePriceId,
    source: stripePriceId ? 'environment' : 'catalog',
    requiredEnv: getStripePriceEnvName(product.productKey, catalogAmount.currency),
  }
}

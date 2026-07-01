import 'server-only'
import {
  currencyForCountry,
  formatMarketplacePrice,
  isSupportedCurrency,
  supportedCurrencies,
  type SupportedCurrency,
} from './marketplace'
import type { PublicLocale } from './public-i18n'
import { createAdminClient } from './supabase/admin'

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

type CurrencyRateCacheRow = {
  base_currency: string
  rates: Record<string, number>
  fetched_at: string
}

type FrankfurterResponse = {
  base: string
  date: string
  rates: Record<string, number>
}

export type PriceDisplay = {
  original: string
  approximate: string | null
  label: string
  targetCurrency: SupportedCurrency
  sourceCurrency: SupportedCurrency
}

export function displayCurrencyForMarket(
  marketCode?: string | null,
): SupportedCurrency {
  const normalized = (marketCode || '').toUpperCase()
  if (!normalized || normalized === 'EU') return 'EUR'
  return currencyForCountry(normalized)
}

export async function formatMarketplacePriceDisplay({
  amount,
  currency,
  locale,
  targetCurrency,
}: {
  amount: number
  currency: string
  locale: PublicLocale
  targetCurrency?: string | null
}): Promise<PriceDisplay> {
  const sourceCurrency = isSupportedCurrency(currency) ? currency : 'EUR'
  const displayCurrency = isSupportedCurrency(targetCurrency)
    ? targetCurrency
    : sourceCurrency
  const sourcePrice = formatMarketplacePrice(amount, sourceCurrency, locale)

  if (sourceCurrency === displayCurrency) {
    const displayPrice = formatMarketplacePrice(amount, displayCurrency, locale)
    return {
      original: displayPrice,
      approximate: null,
      label: displayPrice,
      targetCurrency: displayCurrency,
      sourceCurrency,
    }
  }

  const converted = await convertCurrency(amount, sourceCurrency, displayCurrency)
  if (converted === null) {
    return {
      original: sourcePrice,
      approximate: null,
      label: sourcePrice,
      targetCurrency: displayCurrency,
      sourceCurrency,
    }
  }

  const displayPrice = formatMarketplacePrice(converted, displayCurrency, locale)
  return {
    original: displayPrice,
    approximate: null,
    label: displayPrice,
    targetCurrency: displayCurrency,
    sourceCurrency,
  }
}

export async function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
) {
  if (from === to) return amount
  const rates = await getExchangeRates()
  const fromRate = from === 'EUR' ? 1 : rates[from]
  const toRate = to === 'EUR' ? 1 : rates[to]
  if (!fromRate || !toRate) return null
  return roundCurrencyUp((amount / fromRate) * toRate)
}

function roundCurrencyUp(amount: number) {
  return Math.ceil(amount / 5) * 5
}

async function getExchangeRates() {
  const admin = createAdminClient()
  const cached = await readCachedRates(admin)
  const freshEnough =
    cached &&
    Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS
  if (freshEnough) return cached.rates

  try {
    const symbols = supportedCurrencies
      .filter((currency) => currency !== 'EUR')
      .join(',')
    const response = await fetch(`${FRANKFURTER_URL}?from=EUR&to=${symbols}`, {
      next: { revalidate: 86400 },
    })
    if (!response.ok) throw new Error(`Frankfurter ${response.status}`)
    const payload = (await response.json()) as FrankfurterResponse
    const rates = normalizeRates(payload.rates)
    await admin.from('currency_rate_cache').upsert(
      {
        base_currency: 'EUR',
        rates,
        fetched_at: new Date().toISOString(),
        source: 'frankfurter',
      },
      { onConflict: 'base_currency' },
    )
    return rates
  } catch (error) {
    console.error('Currency rate fetch failed:', error)
    return cached?.rates || {}
  }
}

async function readCachedRates(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from('currency_rate_cache')
    .select('base_currency,rates,fetched_at')
    .eq('base_currency', 'EUR')
    .maybeSingle()

  if (!data) return null
  const row = data as CurrencyRateCacheRow
  return {
    ...row,
    rates: normalizeRates(row.rates),
  }
}

function normalizeRates(rates: Record<string, unknown>) {
  const normalized: Record<string, number> = { EUR: 1 }
  for (const currency of supportedCurrencies) {
    if (currency === 'EUR') continue
    const value = Number(rates[currency])
    if (Number.isFinite(value) && value > 0) normalized[currency] = value
  }
  return normalized
}

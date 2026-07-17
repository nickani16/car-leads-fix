import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const currencyRates = readFileSync(new URL('../lib/currency-rates.ts', import.meta.url), 'utf8')
const marketplaceCategory = readFileSync(new URL('../app/marketplace/[category]/page.tsx', import.meta.url), 'utf8')

test('currency rates are shared per process and in-flight request', () => {
  assert.match(currencyRates, /const PROCESS_CACHE_TTL_MS = 5 \* 60 \* 1000/)
  assert.match(currencyRates, /let processRatesCache/)
  assert.match(currencyRates, /let exchangeRatesRequest/)
  assert.match(currencyRates, /if \(processRatesCache && Date\.now\(\) < processRatesCache\.expiresAt\)/)
  assert.match(currencyRates, /if \(exchangeRatesRequest\) return exchangeRatesRequest/)
  assert.match(currencyRates, /\.finally\(\(\) => \{\s*exchangeRatesRequest = null\s*\}\)/)
  assert.match(currencyRates, /return cached\?\.rates \|\| \{ EUR: 1 \}/)
})

test('marketplace category render reuses one rates object for the listing list', () => {
  assert.match(marketplaceCategory, /getMarketplaceExchangeRates/)
  assert.match(marketplaceCategory, /const exchangeRates = \(data \|\| \[\]\)\.some/)
  assert.match(marketplaceCategory, /await getMarketplaceExchangeRates\(\)/)
  assert.match(marketplaceCategory, /exchangeRates,\s*\}\)/)
})

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const fixtureRoot = 'tests/fixtures/controlled-dealer'
const [parserSource, safeFetchSource, discoverySource, workerSource, listingSyncSource, pilotSource, pilotMigration, importMigration, insightsPolicyMigration, featureFlagSource, pilotRouteSource, pilotAdminRouteSource, importAdminRouteSource, inventoryI18nSource, planI18nSource, pilotDashboardI18nSource, inventoryClientSource, inventoryCreateRouteSource, inventorySourceRoute, pilotEmailSource, importEmailSource, companyPortalSource, inventoryPageSource] = await Promise.all([
  readFile('lib/dealer-import/vehicle-parser.ts', 'utf8'),
  readFile('lib/dealer-import/safe-fetch.ts', 'utf8'),
  readFile('lib/dealer-import/website-discovery.ts', 'utf8'),
  readFile('lib/dealer-import/worker.ts', 'utf8'),
  readFile('lib/dealer-import/listing-sync.ts', 'utf8'),
  readFile('lib/business-pilot.ts', 'utf8'),
  readFile('supabase/migrations/20260802082104_business_pilot_foundation.sql', 'utf8'),
  readFile('supabase/migrations/20260802085618_dealer_inventory_import_foundation.sql', 'utf8'),
  readFile('supabase/migrations/20260802172000_marketplace_insights_policy_hardening.sql', 'utf8'),
  readFile('lib/business-feature-flags.ts', 'utf8'),
  readFile('app/api/business/pilot-applications/route.ts', 'utf8'),
  readFile('app/api/admin/business-pilots/[id]/route.ts', 'utf8'),
  readFile('app/api/admin/inventory-imports/[id]/route.ts', 'utf8'),
  readFile('lib/inventory-import-i18n.ts', 'utf8'),
  readFile('lib/business-plan-i18n.ts', 'utf8'),
  readFile('lib/pilot-dashboard-i18n.ts', 'utf8'),
  readFile('app/account/company/inventory/InventorySourcesClient.tsx', 'utf8'),
  readFile('app/api/account/company/inventory-sources/route.ts', 'utf8'),
  readFile('app/api/account/company/inventory-sources/[id]/route.ts', 'utf8'),
  readFile('lib/email/business-pilot.ts', 'utf8'),
  readFile('lib/email/dealer-import.ts', 'utf8'),
  readFile('lib/company-portal.tsx', 'utf8'),
  readFile('app/account/company/inventory/page.tsx', 'utf8'),
])

const parser = loadTs(parserSource)
const safeFetch = loadTs(safeFetchSource)

test('controlled dealer JSON-LD and deterministic HTML fallback parse into normalized vehicles', async () => {
  process.env.AUTORELL_IMPORT_IDENTIFIER_SECRET = 'fixture-secret'
  const firstHtml = await readFile(`${fixtureRoot}/vehicle-1001.html`, 'utf8')
  const secondHtml = await readFile(`${fixtureRoot}/vehicle-1002.html`, 'utf8')
  const first = parser.parseVehicleHtml(firstHtml, 'https://dealer.example/vehicles/1001-volvo-xc60?utm_campaign=test')
  const second = parser.parseVehicleHtml(secondHtml, 'https://dealer.example/vehicles/1002-bmw-i4')

  assert.ok(first)
  assert.equal(first.normalizedPayload.price, 349000)
  assert.equal(first.normalizedPayload.mileage_km, 45000)
  assert.equal(first.normalizedPayload.fuel, 'plug_in_hybrid')
  assert.equal(first.normalizedPayload.transmission, 'automatic')
  assert.equal(first.normalizedPayload.country_code, 'SE')
  assert.equal(first.originalImageUrls.length, 2)
  assert.match(first.vinFingerprint, /^[a-f0-9]{64}$/)
  assert.equal(Object.hasOwn(first.rawPayload, 'vehicleIdentificationNumber'), false)

  assert.ok(second)
  assert.equal(second.normalizedPayload.make, 'BMW')
  assert.equal(second.normalizedPayload.model, 'i4')
  assert.equal(second.normalizedPayload.price, 42900)
  assert.equal(second.normalizedPayload.mileage_km, 18500)
  assert.equal(second.normalizedPayload.fuel, 'electric')
  assert.equal(second.normalizedPayload.country_code, 'DE')
})

test('ambiguous kr prices defer to the company market instead of assuming SEK', () => {
  const html = (price) => `<!doctype html><html><body><script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: 'Volvo EX30 2025',
    brand: { '@type': 'Brand', name: 'Volvo' },
    model: 'EX30',
    vehicleModelDate: '2025',
    offers: { '@type': 'Offer', price },
  })}</script></body></html>`

  const ambiguous = parser.parseVehicleHtml(html('299 000 kr'), 'https://dealer.example/vehicles/ex30')
  const explicitDkk = parser.parseVehicleHtml(html('299 000 DKK'), 'https://dealer.example/vehicles/ex30-dk')

  assert.equal(ambiguous.normalizedPayload.currency, undefined)
  assert.equal(explicitDkk.normalizedPayload.currency, 'DKK')
  assert.match(listingSyncSource, /countryCode === 'SE' \? 'SEK' : countryCode === 'DK' \? 'DKK'/)
})

test('canonical URL and content hash make unchanged and changed vehicles deterministic', async () => {
  const html = await readFile(`${fixtureRoot}/vehicle-1001.html`, 'utf8')
  const first = parser.parseVehicleHtml(html, 'https://dealer.example/vehicles/1001-volvo-xc60?fbclid=abc')
  const repeated = parser.parseVehicleHtml(html, 'https://dealer.example/vehicles/1001-volvo-xc60?gclid=def')
  const changed = parser.parseVehicleHtml(html.replace('SEK 349 000', 'SEK 359 000'), 'https://dealer.example/vehicles/1001-volvo-xc60')
  assert.equal(first.canonicalUrl, 'https://dealer.example/vehicles/1001-volvo-xc60')
  assert.equal(first.contentHash, repeated.contentHash)
  assert.notEqual(first.contentHash, changed.contentHash)
})

test('controlled sitemap discovery parses two vehicle pages and reports complete discovery', async () => {
  const responses = await controlledDealerResponses()
  const discovery = loadTs(discoverySource, {
    '@/lib/dealer-import/safe-fetch': {
      validateOutboundUrl: safeFetch.validateOutboundUrl,
      safeFetchText: async (url) => {
        const value = responses.get(String(url))
        if (!value) throw new Error('HTTP_404')
        return value
      },
    },
    '@/lib/dealer-import/vehicle-parser': parser,
  })
  const result = await discovery.analyzeDealerWebsite(controlledSource())
  assert.equal(result.sourceAvailable, true)
  assert.equal(result.sitemapFound, true)
  assert.equal(result.discoveryComplete, true)
  assert.equal(result.discoveredUrls.length, 2)
  assert.equal(result.parsed.length, 2)
  assert.equal(result.failedUrls.length, 0)
})

test('source outage and one failed page never claim a complete discovery', async () => {
  const responses = await controlledDealerResponses()
  const loadDiscovery = (fetcher) => loadTs(discoverySource, {
    '@/lib/dealer-import/safe-fetch': { validateOutboundUrl: safeFetch.validateOutboundUrl, safeFetchText: fetcher },
    '@/lib/dealer-import/vehicle-parser': parser,
  })
  const down = loadDiscovery(async (url) => {
    if (String(url).endsWith('/robots.txt')) return responses.get('https://dealer.example/robots.txt')
    throw new Error('IMPORT_REQUEST_TIMEOUT')
  })
  const downResult = await down.analyzeDealerWebsite(controlledSource())
  assert.equal(downResult.sourceAvailable, false)
  assert.equal(downResult.discoveryComplete, false)

  const partial = loadDiscovery(async (url) => {
    if (String(url).includes('1002-bmw-i4')) throw new Error('IMPORT_REQUEST_TIMEOUT')
    const value = responses.get(String(url))
    if (!value) throw new Error('HTTP_404')
    return value
  })
  const partialResult = await partial.analyzeDealerWebsite(controlledSource())
  assert.equal(partialResult.parsed.length, 1)
  assert.equal(partialResult.failedUrls.length, 1)
  assert.equal(partialResult.discoveryComplete, false)
})

test('website discovery resumes deterministic batches larger than 25 vehicles', async () => {
  const responses = await controlledDealerResponses()
  const vehicleHtml = await readFile(`${fixtureRoot}/vehicle-1001.html`, 'utf8')
  const urls = Array.from({ length: 30 }, (_value, index) => `https://dealer.example/vehicles/${2000 + index}-fixture-car`)
  const discovery = loadTs(discoverySource, {
    '@/lib/dealer-import/safe-fetch': {
      validateOutboundUrl: safeFetch.validateOutboundUrl,
      safeFetchText: async (url) => responses.get(String(url)) || { url: String(url), status: 200, contentType: 'text/html', headers: {}, body: Buffer.from(vehicleHtml), text: vehicleHtml },
    },
    '@/lib/dealer-import/vehicle-parser': parser,
  })
  const source = { ...controlledSource(), inventory_limit: 50 }
  const first = await discovery.analyzeDealerWebsite(source, { discoveredUrls: urls, sitemapFound: true, sitemapCount: 1 })
  assert.equal(first.parsed.length, 25)
  assert.equal(first.nextOffset, 25)
  assert.equal(first.hasMore, true)
  assert.equal(first.discoveryComplete, false)
  const second = await discovery.analyzeDealerWebsite(source, { discoveredUrls: first.discoveredUrls, offset: first.nextOffset, sitemapFound: true, sitemapCount: 1 })
  assert.equal(second.parsed.length, 5)
  assert.equal(second.nextOffset, 30)
  assert.equal(second.hasMore, false)
  assert.equal(second.discoveryComplete, true)
})

test('outbound URL validation blocks local, private, reserved and credentialed targets', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '203.0.113.1', '::1', 'fc00::1', '2001:db8::1']) {
    assert.equal(safeFetch.isPublicIpAddress(ip), false, ip)
  }
  for (const url of ['http://localhost/a', 'http://127.0.0.1/a', 'http://169.254.169.254/latest/meta-data', 'http://user:pass@example.com/a', 'https://example.com:8443/a']) {
    assert.throws(() => safeFetch.validateOutboundUrl(url), /IMPORT_/)
  }
  assert.equal(safeFetch.validateOutboundUrl('https://example.com/cars/1').hostname, 'example.com')
  assert.throws(() => safeFetch.validateOutboundUrl('https://cdn.example.com/a', new Set(['example.com'])), /IMPORT_REDIRECT_HOST_BLOCKED/)
  assert.match(safeFetchSource, /current = validateOutboundUrl\(new URL\(location, current\)/)
  assert.match(safeFetchSource, /records\.some\(\(record\) => !isPublicIpAddress/)
  assert.match(safeFetchSource, /left\.family === 4 \? -1 : 1/)
  assert.match(safeFetchSource, /requestPinnedAddress/)
  assert.match(safeFetchSource, /deadline - Date\.now\(\)/)
  assert.match(safeFetchSource, /lookupOptions\.all/)
  assert.match(safeFetchSource, /callback\(null, \[selected\]\)/)
  assert.match(safeFetchSource, /size > maxBytes/)
})

test('website discovery never expands beyond the verified domain boundary', () => {
  const discovery = loadTs(discoverySource, {
    '@/lib/dealer-import/safe-fetch': { validateOutboundUrl: safeFetch.validateOutboundUrl, safeFetchText: async () => { throw new Error('NOT_USED') } },
    '@/lib/dealer-import/vehicle-parser': parser,
  })
  const hosts = discovery.sourceAllowedHosts({
    website_url: 'https://dealer.example',
    inventory_url: 'https://unverified.example/inventory',
    verified_domain: 'dealer.example',
    inventory_limit: 25,
    configuration: { allowed_subdomains: ['stock.dealer.example', 'unverified.example'] },
  })
  assert.equal(hosts.has('dealer.example'), true)
  assert.equal(hosts.has('stock.dealer.example'), true)
  assert.equal(hosts.has('unverified.example'), false)
})

test('website verification and parsing accept safely bounded plain-text HTML responses', () => {
  const plainTextAllowances = discoverySource.match(/acceptedContentTypes: \[[^\]]*'text\/plain'[^\]]*\]/g) || []
  assert.ok(plainTextAllowances.length >= 4)
})

test('pilot application validation requires consent, active market and public website', () => {
  const pilot = loadTs(pilotSource, {
    '@/lib/eu-countries': { isActiveMarketCountryCode: (value) => ['SE', 'DE', 'FR', 'ES', 'IT', 'NL', 'FI', 'DK', 'PL', 'AT', 'BE'].includes(value) },
    '@/lib/market-locale': { localeMarkets: [{ pathCode: 'en' }, { pathCode: 'se' }, { pathCode: 'de' }] },
    '@/lib/business-pilot-i18n': { normalizeBusinessPilotLocale: normalizeLocale },
  })
  const valid = { companyName: 'Fixture Motors', countryCode: 'SE', marketCode: 'se', locale: 'sv', website: 'https://fixture.example', contactName: 'Ada Test', email: 'ada@example.com', inventorySize: '26_100', locationCount: 2, integrationMethod: 'website', privacyConsent: true, contactConsent: true }
  assert.equal(pilot.parseBusinessPilotApplication(valid, { ip: '198.51.100.20', userAgent: 'test' }).success, true)
  assert.equal(pilot.parseBusinessPilotApplication({ ...valid, privacyConsent: false }, { ip: '', userAgent: '' }).success, false)
  assert.equal(pilot.parseBusinessPilotApplication({ ...valid, website: 'http://127.0.0.1' }, { ip: '', userAgent: '' }).success, false)
  assert.equal(pilot.looksLikeAutomatedPilotSubmission({ ...valid, companyUrl: 'spam' }), true)
  assert.equal(pilot.looksLikeAutomatedPilotSubmission({ ...valid, formStartedAt: Date.now() }), true)
})

test('database policies isolate organizations and hard-lock free pilots from automatic conversion', () => {
  assert.match(pilotMigration, /automatic_conversion_enabled boolean not null default false check \(automatic_conversion_enabled = false\)/)
  assert.match(pilotMigration, /is_free boolean not null default true check \(is_free = true\)/)
  assert.match(pilotMigration, /revoke all on table public\.business_pilot_applications from anon, authenticated/)
  assert.match(importMigration, /dealer_import_sources_select_own_organization/)
  assert.match(importMigration, /member\.company_id = dealer_import_sources\.organization_id/)
  assert.match(importMigration, /revoke all on table public\.dealer_import_sources from anon, authenticated/)
  assert.match(importMigration, /grant select on table public\.dealer_import_sources to authenticated/)
  assert.doesNotMatch(importMigration, /grant (insert|update|delete).*dealer_import_sources to authenticated/i)
  assert.match(pilotMigration, /consume_business_pilot_rate_limit/)
  assert.match(pilotMigration, /revoke all on function public\.consume_business_pilot_rate_limit/)
  assert.match(importMigration, /dealer_import_items_source_organization_fk/)
  assert.match(importMigration, /marketplace_listings_import_item_organization_fk/)
  assert.match(importMigration, /claim_dealer_import_run\(p_run_id uuid\)/)
  assert.equal((insightsPolicyMigration.match(/\(select auth\.uid\(\)\)/g) || []).length, 7)
  assert.doesNotMatch(insightsPolicyMigration, /using \(auth\.uid\(\)/)
})

test('publication, deduplication, missing-item and image safety rules are explicit', () => {
  assert.match(workerSource, /if \(vehicle\.sourceExternalId\)/)
  assert.match(workerSource, /if \(vehicle\.vinFingerprint\)/)
  assert.match(workerSource, /if \(vehicle\.registrationFingerprint\)/)
  assert.match(workerSource, /\.eq\('canonical_source_url', vehicle\.canonicalUrl\)/)
  assert.match(workerSource, /\.eq\('match_fingerprint', matchFingerprint\)/)
  assert.match(workerSource, /const discoveryComplete = !analysis\.hasMore && analysis\.sitemapFound && failedUrls\.length === 0/)
  assert.match(workerSource, /\.gte\('last_seen_at', run\.started_at\)/)
  assert.match(workerSource, /status: 'queued'/)
  assert.match(workerSource, /confirmations >= source\.missing_confirmation_threshold/)
  assert.match(workerSource, /source_available: true/)
  assert.match(workerSource, /!analysisOnly && source\.publication_approved_at/)
  assert.match(listingSyncSource, /vehicle\.parseConfidence >= 0\.82/)
  assert.match(listingSyncSource, /slice\(0, 10\)/)
  assert.match(listingSyncSource, /safeFetchBuffer/)
  assert.match(listingSyncSource, /processMarketplaceImage/)
  assert.match(listingSyncSource, /marketplace-listings/)
  assert.match(listingSyncSource, /is_automatically_imported: true/)
  assert.match(listingSyncSource, /source_original_url/)
  assert.match(listingSyncSource, /DUPLICATE_CANONICAL_LISTING_PENDING/)
  assert.match(listingSyncSource, /let importedImages = existingImages/)
  assert.match(listingSyncSource, /if \(result\.images\.length\)/)
  assert.match(listingSyncSource, /if \(imagesReplaced\)/)
  assert.doesNotMatch(listingSyncSource, /stripe|subscription/i)
})

test('listing sync recovers an existing listing after an interrupted item-link update', async () => {
  let itemPatch = null
  const query = (data) => ({
    select() { return this },
    eq() { return this },
    maybeSingle: async () => ({ data, error: null }),
  })
  const admin = {
    from(table) {
      if (table === 'dealer_import_items') return {
        ...query({ id: 'item-1', vehicle_id: null, duplicate_of_item_id: null, sync_status: 'import_pending', imported_image_paths: [], image_hashes: [] }),
        update(patch) { itemPatch = patch; return { eq: async () => ({ error: null }) } },
      }
      if (table === 'marketplace_listings') return query({ id: 'listing-recovered' })
      throw new Error(`Unexpected table ${table}`)
    },
  }
  const listingSync = loadTs(listingSyncSource, {
    '@/lib/marketplace/image-processing': { processMarketplaceImage: async () => { throw new Error('NOT_USED') } },
    '@/lib/dealer-import/safe-fetch': { safeFetchBuffer: async () => { throw new Error('NOT_USED') }, validateOutboundUrl: safeFetch.validateOutboundUrl },
  })
  const result = await listingSync.synchronizeImportedVehicle(admin, {
    source: { id: 'source-1', organization_id: 'org-1', pilot_program_id: 'pilot-1', source_type: 'website', verified_domain: 'dealer.example', configuration: {} },
    context: {},
    itemId: 'item-1',
    sourceUrl: 'https://dealer.example/vehicles/1',
    change: 'unchanged',
    vehicle: { sourceStatus: 'present', parseConfidence: 0.5, warnings: ['LOW_PARSE_CONFIDENCE'] },
  })
  assert.equal(result.listingId, 'listing-recovered')
  assert.equal(itemPatch.vehicle_id, 'listing-recovered')
  assert.equal(itemPatch.sync_status, 'import_review')
})

test('admin actions require permissions and write audit records', () => {
  assert.match(pilotAdminRouteSource, /requireAdminRoute\('business_pilots\.manage'\)/)
  assert.match(pilotAdminRouteSource, /writeAdminAuditLog/)
  assert.match(importAdminRouteSource, /requireAdminRoute\('inventory_imports\.manage'\)/)
  assert.match(importAdminRouteSource, /writeAdminAuditLog/)
  for (const action of ['pause', 'resume', 'start_sync', 'manual_verify_domain', 'set_limit', 'stop', 'create_parser_profile', 'upsert_mapping', 'unpublish_item']) assert.match(importAdminRouteSource, new RegExp(action))
  assert.match(pilotRouteSource, /checkRateLimit/)
  assert.match(pilotRouteSource, /consume_business_pilot_rate_limit/)
  assert.match(pilotRouteSource, /looksLikeAutomatedPilotSubmission/)
  assert.match(pilotAdminRouteSource, /record_contact/)
  assert.match(pilotAdminRouteSource, /add_note/)
  assert.match(pilotAdminRouteSource, /configurePilotFeatureFlags/)
  assert.doesNotMatch(pilotRouteSource, /stripe|subscription/i)
})

test('customer inventory UI localizes technical failures and requires a completed preview', () => {
  assert.match(inventoryClientSource, /localizedInventoryError/)
  assert.doesNotMatch(inventoryClientSource, /set(?:Error|Message)\(result\.error/)
  assert.doesNotMatch(inventoryClientSource, /\|\| item\.sync_status/)
  assert.match(inventoryClientSource, /result\.source\?\.verification_status === 'verified'/)
  assert.match(inventoryClientSource, /setSuccess\(copy\.wizard\.onboardingSuccess\)/)
  assert.match(inventoryClientSource, /method === 'dms'[^\n]+setStep\(-1\)/)
  assert.match(inventoryCreateRouteSource, /sourceType === 'xml' \|\| sourceType === 'csv'/)
  assert.match(inventoryCreateRouteSource, /\? 'dealer_feed_import'/)
  assert.match(inventorySourceRoute, /already_verified: true/)
  assert.match(inventorySourceRoute, /rotate_verification_token/)
  assert.match(inventorySourceRoute, /processDealerImportRun/)
  assert.match(inventorySourceRoute, /IMPORT_PREVIEW_REQUIRED/)
  assert.match(inventorySourceRoute, /\.gt\('parsed_count', 0\)/)
})

test('new customer-facing copy is complete for all market languages', () => {
  const publicI18nMock = { translationLocale: normalizeLocale }
  const inventory = loadTs(inventoryI18nSource, { '@/lib/public-i18n': publicI18nMock })
  const plans = loadTs(planI18nSource, { '@/lib/public-i18n': publicI18nMock })
  const dashboard = loadTs(pilotDashboardI18nSource, { '@/lib/public-i18n': publicI18nMock })
  for (const locale of ['en', 'sv', 'de', 'at', 'fr', 'es', 'it', 'nl', 'be', 'fi', 'da', 'pl']) {
    const inventoryCopy = inventory.getInventoryImportCopy(locale)
    assert.equal(inventoryCopy.publicPage.methods.length, 5, locale)
    assert.equal(inventoryCopy.publicPage.methods.filter((method) => method.selectable).length, 2, locale)
    assert.ok(inventoryCopy.publicPage.methods.every((method) => method.status?.trim()), locale)
    assert.equal(inventoryCopy.portal.metrics.length, 8, locale)
    assert.equal(inventoryCopy.wizard.steps.length, 6, locale)
    assert.ok(inventoryCopy.wizard.onboardingSuccess.trim().length > 0, locale)
    assert.ok(inventoryCopy.wizard.generateVerificationToken.trim().length > 0, locale)
    assert.ok(inventoryCopy.wizard.analysisQueued.trim().length > 0, locale)
    assert.equal(inventoryCopy.wizard.previewColumns.length, 4, locale)
    assert.equal(inventoryCopy.wizard.consents.length, 5, locale)
    for (const status of ['import_pending', 'import_review', 'source_missing', 'sold', 'import_error']) assert.ok(inventoryCopy.portal.statuses[status], `${locale}:${status}`)
    assert.equal(Object.keys(inventoryCopy.errors).length, 7, locale)
    assert.ok(allStrings(inventoryCopy).every((value) => value.trim().length > 0), locale)
    const planCopy = plans.getBusinessPlanCopy(locale)
    assert.equal(planCopy.plans.length, 4, locale)
    assert.equal(planCopy.plans[0].features.includes('Automatic website synchronisation'), false)
    assert.ok(planCopy.plans[1].features.length >= 10, locale)
    assert.ok(planCopy.plans[2].features.length >= 11, locale)
    assert.ok(planCopy.plans[3].features.length >= 12, locale)
    assert.ok(requiredPlanStrings(planCopy).every((value) => value.trim().length > 0), locale)
    const dashboardCopy = dashboard.getPilotDashboardCopy(locale)
    assert.equal(dashboardCopy.metrics.length, 6, locale)
    assert.equal(dashboardCopy.periods.length, 3, locale)
    assert.ok(allStrings(dashboardCopy).every((value) => value.trim().length > 0), locale)
  }
})

test('pilot and inventory email events include every supported language', () => {
  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'fi', 'da', 'pl']) {
    assert.ok((pilotEmailSource.match(new RegExp(`^  ${locale}:`, 'gm')) || []).length >= 3, `pilot email ${locale}`)
    assert.equal((importEmailSource.match(new RegExp(`^  ${locale}:`, 'gm')) || []).length, 1, `import email ${locale}`)
  }
  for (const event of ['received', 'more_information_required', 'approved', 'rejected', 'pilot_active', 'pilot_completed', 'pilot_ending_soon', 'commercial_request']) assert.match(pilotEmailSource, new RegExp(`'${event}'`))
  for (const event of ['domain_verified', 'analysis_completed', 'first_import_completed', 'import_failed', 'sync_problem']) assert.match(importEmailSource, new RegExp(`'${event}'`))
})

test('pilot JSON copy packs share the same complete schema', async () => {
  const locales = ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'fi', 'da', 'pl']
  const packs = await Promise.all(locales.map(async (locale) => JSON.parse(await readFile(`lib/business-pilot-copy.${locale}.json`, 'utf8'))))
  const expectedKeys = flattenKeys(packs[0])
  for (const [index, pack] of packs.entries()) {
    assert.deepEqual(flattenKeys(pack), expectedKeys, locales[index])
    assert.ok(allStrings(pack).every((value) => value.trim().length > 0), locales[index])
  }
})

test('feature flags are production-off and cover every requested capability', () => {
  for (const flag of ['business_pilot_program', 'dealer_inventory_import', 'dealer_website_import', 'dealer_feed_import', 'dealer_api_import', 'dealer_dms_onboarding', 'dealer_inventory_sync']) {
    assert.match(featureFlagSource, new RegExp(`'${flag}'`))
    assert.match(pilotMigration, new RegExp(`'${flag}', 'production', false`))
  }
  assert.match(featureFlagSource, /if \(environment === 'production'\) return false/)
  assert.match(companyPortalSource, /pilotProgramId: pilot\?\.id \|\| null/)
  assert.match(companyPortalSource, /item\.key !== 'inventory' \|\| context\.inventoryImportEnabled/)
  assert.match(inventoryPageSource, /context\.inventoryImportEnabled/)
})

async function controlledDealerResponses() {
  const [index, robots, sitemap, first, second] = await Promise.all([
    readFile(`${fixtureRoot}/index.html`, 'utf8'), readFile(`${fixtureRoot}/robots.txt`, 'utf8'), readFile(`${fixtureRoot}/sitemap.xml`, 'utf8'), readFile(`${fixtureRoot}/vehicle-1001.html`, 'utf8'), readFile(`${fixtureRoot}/vehicle-1002.html`, 'utf8'),
  ])
  const response = (url, text, contentType = 'text/html') => ({ url, status: 200, contentType, headers: {}, body: Buffer.from(text), text })
  return new Map([
    ['https://dealer.example/robots.txt', response('https://dealer.example/robots.txt', robots, 'text/plain')],
    ['https://dealer.example/inventory', response('https://dealer.example/inventory', index)],
    ['https://dealer.example/sitemap.xml', response('https://dealer.example/sitemap.xml', sitemap, 'application/xml')],
    ['https://dealer.example/vehicles/1001-volvo-xc60', response('https://dealer.example/vehicles/1001-volvo-xc60', first)],
    ['https://dealer.example/vehicles/1002-bmw-i4', response('https://dealer.example/vehicles/1002-bmw-i4', second)],
  ])
}

function controlledSource() { return { website_url: 'https://dealer.example', inventory_url: 'https://dealer.example/inventory', verified_domain: 'dealer.example', inventory_limit: 25, configuration: {} } }

function loadTs(source, mocks = {}) {
  const sanitized = source.replace(/import 'server-only'\r?\n/, '')
  const transpiled = ts.transpileModule(sanitized, { compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const cjsModule = { exports: {} }
  const localRequire = (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id)
  vm.runInNewContext(transpiled, { Buffer, URL, File: globalThis.File, console, exports: cjsModule.exports, module: cjsModule, require: localRequire, process, setTimeout, clearTimeout })
  return cjsModule.exports
}

function normalizeLocale(locale) { return locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale }
function allStrings(value) { if (typeof value === 'string') return [value]; if (Array.isArray(value)) return value.flatMap(allStrings); if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings); return [] }
function requiredPlanStrings(copy) { return [copy.intro, copy.recommended, ...copy.plans.flatMap((plan) => [plan.name, plan.audience, plan.price, plan.limit, plan.text, plan.cta, plan.hrefKind, ...plan.features]), ...copy.faqs.flat()] }
function flattenKeys(value, prefix = '') { if (Array.isArray(value)) return value.flatMap((item, index) => flattenKeys(item, `${prefix}[${index}]`)); if (value && typeof value === 'object') return Object.keys(value).sort().flatMap((key) => flattenKeys(value[key], prefix ? `${prefix}.${key}` : key)); return [prefix] }

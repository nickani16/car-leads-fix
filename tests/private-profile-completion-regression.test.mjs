import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('private accounts bypass the legacy registration onboarding', () => {
  const registerPage = read('app/registrera/page.tsx')

  assert.match(registerPage, /accountIntent\.accountType === 'private'/)
  assert.match(registerPage, /ensureMarketplaceProfile\(\{ user, locale, intent: accountIntent \}\)/)
  assert.match(registerPage, /redirect\(localizePublicHref\(locale, '\/account'\)\)/)
  assert.match(registerPage, /initialAccountType=\{accountIntent\.accountType\}/)
})

test('private listing creation is blocked until the profile is complete', () => {
  const listingPage = read('app/konto/annonser/ny/page.tsx')
  const profilePage = read('app/account/profile/page.tsx')
  const header = read('app/components/PublicHeader.tsx')

  assert.match(listingPage, /reason: 'listing'/)
  assert.match(listingPage, /isMarketplaceProfileComplete\(profile\)/)
  assert.match(profilePage, /query\.reason === 'listing'/)
  assert.match(profilePage, /listingBlockedTitle/)
  assert.match(header, /headerAccount\.profileComplete === false/)
  assert.match(header, /incompletePrivateListingHref/)
})

test('profile completeness uses the same private requirements everywhere', () => {
  const bootstrap = read('lib/account-profile-bootstrap.ts')

  for (const field of [
    'first_name',
    'last_name',
    'phone',
    'address_line_1',
    'postal_code',
    'city',
    'birth_date',
  ]) {
    assert.match(bootstrap, new RegExp(`profile\\.${field}`))
  }
})

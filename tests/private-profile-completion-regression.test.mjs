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
  assert.match(header, /completeProfileHref/)
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
    'national_id_last4',
  ]) {
    assert.match(bootstrap, new RegExp(`profile\\.${field}`))
  }
})

test('missing private identity details can be completed securely from the profile', () => {
  const profileForm = read('app/konto/ProfileForm.tsx')
  const profileApi = read('app/api/account/profile/route.ts')
  const headerApi = read('app/api/account/header/route.ts')
  const listingPage = read('app/konto/annonser/ny/page.tsx')

  assert.match(profileForm, /name="nationalId"/)
  assert.match(profileForm, /name="nationalId"[\s\S]*?required/)
  assert.match(profileForm, /identityNumberPlaceholder/)
  assert.match(profileForm, /autorell-account-input font-\[400\]/)
  assert.match(profileForm, /window\.location\.assign\(localizePublicHref\(locale, '\/account'\)\)/)
  assert.match(profileApi, /reviewNationalId\(countryCode, nationalId\)/)
  assert.match(profileApi, /createHmac\('sha256'/)
  assert.match(profileApi, /national_id_last4: normalizedNationalId\.slice\(-4\)/)
  assert.match(profileApi, /raw_identifier_stored: false/)
  assert.match(headerApi, /national_id_last4/)
  assert.match(listingPage, /national_id_last4/)
})

test('password signup clearly instructs users to click the confirmation link', () => {
  const authCopy = read('lib/auth-copy.ts')

  assert.match(authCopy, /klicka på bekräftelselänken/)
  assert.match(authCopy, /click the confirmation link/)
  assert.match(authCopy, /klicken Sie auf den Bestätigungslink/)
  assert.match(authCopy, /cliquez sur le lien de confirmation/)
  assert.match(authCopy, /pulsa el enlace de confirmación/)
  assert.match(authCopy, /seleziona il link di conferma/)
  assert.match(authCopy, /kliknij link potwierdzający/)
  assert.match(authCopy, /klik op de bevestigingslink/)
  assert.match(authCopy, /napsauta vahvistuslinkkiä/)
  assert.match(authCopy, /klik på bekræftelseslinket/)
})

test('identity labels and placeholders are localized for every Autorell market', () => {
  const identityCopy = read('lib/national-id-profile-i18n.ts')
  const globalCss = read('app/globals.css')

  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(identityCopy, new RegExp(`\\n  ${locale}: \\{`))
  }
  assert.match(globalCss, /\.autorell-account-input\[name='nationalId'\]::placeholder[\s\S]*-webkit-text-fill-color: #7b8494 !important/)
  assert.match(identityCopy, /Personnummer/)
  assert.match(identityCopy, /Rijksregisternummer/)
  assert.match(identityCopy, /Numéro de sécurité sociale/)
  assert.match(identityCopy, /DNI o NIE/)
  assert.match(identityCopy, /Codice fiscale/)
  assert.match(identityCopy, /Numer PESEL/)
  assert.match(identityCopy, /Burgerservicenummer/)
  assert.match(identityCopy, /Henkilötunnus/)
  assert.match(identityCopy, /CPR-nummer/)
})

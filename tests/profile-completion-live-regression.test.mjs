import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const profileForm = read('app/konto/ProfileForm.tsx')
const profileApi = read('app/api/account/profile/route.ts')
const identityCopy = read('lib/national-id-profile-i18n.ts')
const authCopy = read('lib/auth-copy.ts')

test('an unsaved private identity number is editable and uses accessible placeholder styling', () => {
  assert.match(profileForm, /name="nationalId"/)
  assert.match(profileForm, /profile\.national_id_last4 \? \(/)
  assert.match(profileForm, /placeholder:font-\[400\]/)
  assert.match(profileForm, /placeholder:text-\[#8b95a7\]/)
  assert.doesNotMatch(profileForm, /copy\.notRegistered}[\s\S]{0,80}disabled/)
})

test('private identity data is normalized, hashed and never stored in clear text', () => {
  assert.match(profileApi, /reviewNationalId\(countryCode, nationalId\)/)
  assert.match(profileApi, /normalizeNationalId\(nationalId\)/)
  assert.match(profileApi, /createHmac\('sha256', identifierSecret\)/)
  assert.match(profileApi, /national_id_last4: normalizedNationalId\.slice\(-4\)/)
  assert.doesNotMatch(profileApi, /national_id:\s*nationalId/)
})

test('identity copy covers every Autorell locale and market', () => {
  for (const locale of ['sv', 'de', 'en', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(identityCopy, new RegExp(`\\b${locale}: \\{`))
  }
  for (const countryCode of ['AT', 'BE', 'DE', 'DK', 'ES', 'FI', 'FR', 'IT', 'NL', 'PL', 'SE']) {
    assert.match(identityCopy, new RegExp(`\\b${countryCode}: '`))
  }
})

test('email signup confirmation gives an explicit action in every language', () => {
  assert.doesNotMatch(authCopy, /If email confirmation is required/)
  assert.doesNotMatch(authCopy, /Om mejlbekräftelse krävs/)
  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authCopy, new RegExp(`\\n  ${locale}: \\{[\\s\\S]*?confirmEmailSent:`))
  }
  assert.match(authCopy, /klicka på bekräftelselänken/)
  assert.match(authCopy, /click the confirmation link/)
})

test('successful profile completion navigates immediately to the requested page or account', () => {
  assert.match(profileForm, /window\.location\.assign\(destination\)/)
  assert.match(profileForm, /localizePublicHref\(locale, '\/account'\)/)
  assert.match(profileForm, /next\?\.startsWith\('\/'\)/)
})

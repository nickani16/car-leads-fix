import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const identityCopy = readFileSync(new URL('../lib/business-identity-i18n.ts', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const registerPage = readFileSync(new URL('../app/registrera/page.tsx', import.meta.url), 'utf8')
const registerRoute = readFileSync(new URL('../app/api/account/register/route.ts', import.meta.url), 'utf8')
const profileForm = readFileSync(new URL('../app/konto/ProfileForm.tsx', import.meta.url), 'utf8')
const profileRoute = readFileSync(new URL('../app/api/account/profile/route.ts', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')

test('every public market has explicit official business identity terminology', () => {
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(
      identityCopy,
      new RegExp(`${locale}: \\{[^\\n]*companyNamePlaceholder:[^\\n]*registrationNumberPlaceholder:[^\\n]*registrationNumberHelper:`),
    )
  }

  for (const term of [
    'Organisationsnummer',
    'Registernummer',
    'Firmenbuchnummer',
    'Ondernemingsnummer',
    'Numéro SIREN',
    'NIF de la empresa',
    'Codice fiscale dell’impresa',
    'NIP, REGON lub numer KRS',
    'KVK-nummer',
    'Y-tunnus',
    'CVR-nummer',
  ]) {
    assert.ok(identityCopy.includes(term), `Missing market-specific term: ${term}`)
  }
})

test('company identity placeholders are gray, normal weight and shared by registration and profile', () => {
  assert.match(registerForm, /placeholder=\{copy\.companyNamePlaceholder\}/)
  assert.match(registerForm, /placeholder=\{copy\.registrationNumberPlaceholder\}/)
  assert.match(registerForm, /placeholder:font-\[400\]/)
  assert.match(registerForm, /placeholder:text-\[#7b8494\]/)
  assert.match(registerForm, /placeholder:opacity-100/)
  assert.match(profileForm, /getBusinessIdentityCopy\(locale\)/)
  assert.match(profileForm, /placeholder=\{copy\.companyNamePlaceholder\}/)
  assert.match(profileForm, /placeholder=\{copy\.registrationNumberPlaceholder\}/)
  assert.match(profileForm, /placeholder:font-\[400\]/)
  assert.match(profileForm, /placeholder:text-\[#7b8494\]/)
})

test('company identity is persisted once and existing profiles skip registration', () => {
  assert.match(registerRoute, /name: companyName/)
  assert.match(registerRoute, /registration_number: registrationNumber \|\| vatNumber/)
  assert.match(registerRoute, /company_name: accountType === 'business' \? companyName : null/)
  assert.match(registerRoute, /registration_number: accountType === 'business' \? companyIdentifier : null/)
  assert.match(profileRoute, /name: profile\.company_name/)
  assert.match(profileRoute, /registration_number: profile\.registration_number \|\| profile\.vat_number/)
  assert.match(registerPage, /if \(profile && !canReactivate\) redirect/)
  assert.match(newListingPage, /if \(!profile\)/)
})

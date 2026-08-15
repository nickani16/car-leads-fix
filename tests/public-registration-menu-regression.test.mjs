import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const birthDatePicker = readFileSync(new URL('../app/components/BirthDatePicker.tsx', import.meta.url), 'utf8')
const registerRoute = readFileSync(new URL('../app/api/account/register/route.ts', import.meta.url), 'utf8')

test('sell menu exposes the dealer flow with explicit copy for every public market', () => {
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(header, new RegExp(`\\n  ${locale}: \\{ label:`))
  }
  assert.match(header, /localizePublicHref\(locale, '\/sell-to-dealer'\)/)
  assert.match(header, /'\/sell-to-dealer'/)
})

test('registration uses the fast localized birth-date picker for private and business accounts', () => {
  assert.match(registerForm, /<BirthDatePicker/)
  assert.match(registerForm, /value=\{birthDate\}/)
  assert.match(registerForm, /required=\{accountType === 'private'\}/)
  assert.doesNotMatch(registerForm, /name="birthDate"[\s\S]{0,120}type="date"/)
  assert.match(birthDatePicker, /const pickerCopy: Record<PublicLocale, PickerCopy>/)
  assert.match(birthDatePicker, /maximumDate\.getFullYear\(\) - index/)
  assert.match(birthDatePicker, /1900-01-01/)
  assert.match(birthDatePicker, /ariaLabel=\{copy\.year\}/)
})

test('registration localizes API failures instead of rendering raw server text', () => {
  assert.match(registerForm, /localizedAccountError\(locale, result, copy\.createError\)/)
  assert.doesNotMatch(registerForm, /setError\(result\.error/)
  for (const code of [
    'register_auth_required',
    'register_email_unverified',
    'register_invalid_email',
    'register_invalid_name',
    'register_invalid_birth_date',
    'register_invalid_country',
    'register_invalid_phone',
    'register_invalid_address',
    'register_invalid_national_id',
    'register_invalid_company',
    'register_terms_required',
    'register_profile_exists',
    'register_failed',
  ]) {
    assert.match(registerRoute, new RegExp(`['"]${code}['"]`))
  }
  assert.match(registerForm, /const registrationErrorCopy: Record</)
  assert.match(registerForm, /const registrationFieldErrorCopy: Record</)
})

test('registration explains national identity format and keeps account labels at weight 600', () => {
  assert.match(registerForm, /ÅÅMMDD-XXXX eller YYYYMMDD-XXXX/)
  assert.match(registerForm, /placeholder:font-normal placeholder:text-\[#7b8494\]/)
  assert.match(registerForm, /<strong className="text-sm font-semibold">\{label\}<\/strong>/)
})

test('registration renders localized legal links for every public market', () => {
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(registerForm, new RegExp(`\\n  ${locale}: \\{ privatePrefix:`))
  }
  assert.match(registerForm, /href=\{termsHref\}/)
  assert.match(registerForm, /href=\{purchaseTermsHref\}/)
  assert.match(registerForm, /href=\{privacyHref\}/)
})

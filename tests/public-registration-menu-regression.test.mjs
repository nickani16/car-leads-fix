import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const birthDatePicker = readFileSync(new URL('../app/components/BirthDatePicker.tsx', import.meta.url), 'utf8')
const registerRoute = readFileSync(new URL('../app/api/account/register/route.ts', import.meta.url), 'utf8')
const registerPage = readFileSync(new URL('../app/registrera/page.tsx', import.meta.url), 'utf8')
const accountPage = readFileSync(new URL('../app/konto/page.tsx', import.meta.url), 'utf8')
const deleteRoute = readFileSync(new URL('../app/api/account/delete-request/route.ts', import.meta.url), 'utf8')
const adminUserRoute = readFileSync(new URL('../app/api/admin/users/[id]/route.ts', import.meta.url), 'utf8')

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
    'register_identity_in_use',
    'register_company_in_use',
    'register_recovery_required',
    'register_failed',
  ]) {
    assert.match(registerRoute, new RegExp(`['"]${code}['"]`))
  }
  assert.match(registerForm, /const registrationErrorCopy: Record</)
  assert.match(registerForm, /const registrationFieldErrorCopy: Record</)
})

test('registration retries safely and translates identity conflicts for every market', () => {
  assert.match(registerRoute, /return NextResponse\.json\(\{ success: true, existing: true \}\)/)
  assert.match(registerRoute, /registrationConflictResponse/)
  assert.match(registerRoute, /error\?\.code !== '23505'/)
  assert.match(registerRoute, /companyIdentifier/)
  assert.match(registerRoute, /normalizeIdentifier\(clean\(body\.registrationNumber\)\)/)
  assert.match(registerForm, /if \(loading\) return/)
  assert.match(registerForm, /finally \{\s*setLoading\(false\)/)
  assert.match(registerForm, /register_identity_in_use/)
  assert.match(registerForm, /register_company_in_use/)
  assert.match(registerForm, /register_recovery_required/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(
      registerForm,
      new RegExp(`\\n  ${locale}: \\{[\\s\\S]*register_identity_in_use:[\\s\\S]*register_company_in_use:[\\s\\S]*register_recovery_required:`),
    )
  }
})

test('self-deleted accounts can reactivate only with the retained identity', () => {
  assert.match(deleteRoute, /deleted_at: now/)
  assert.match(deleteRoute, /removed_by_admin: false/)
  assert.match(deleteRoute, /suspended: true/)
  assert.match(registerPage, /const canReactivate = Boolean/)
  assert.match(accountPage, /\/register\?reactivate=1/)
  assert.match(registerRoute, /const selfDeleted = Boolean/)
  assert.match(registerRoute, /existingProfile\.national_id_hash === nationalIdHash/)
  assert.match(registerRoute, /existingProfile\.birth_date === birthDate/)
  assert.match(registerRoute, /retainedCompanyIdentifiers\.includes\(identifier\)/)
  assert.match(registerRoute, /existingProfile\.account_type === accountType/)
  assert.match(registerRoute, /removed_by_admin: false/)
  assert.match(registerRoute, /reactivated: true/)
  assert.match(registerRoute, /rollbackReactivation/)
  assert.match(adminUserRoute, /patch\.deleted_at = null/)
  assert.match(adminUserRoute, /patch\.removed_by_admin = false/)
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

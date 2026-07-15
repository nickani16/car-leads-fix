import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const phoneVerification = readFileSync(
  new URL('../lib/phone-verification.ts', import.meta.url),
  'utf8',
)
const registerApi = readFileSync(
  new URL('../app/api/account/register/route.ts', import.meta.url),
  'utf8',
)
const profileApi = readFileSync(
  new URL('../app/api/account/profile/route.ts', import.meta.url),
  'utf8',
)
const profileForm = readFileSync(
  new URL('../app/konto/ProfileForm.tsx', import.meta.url),
  'utf8',
)
const settingsPage = readFileSync(
  new URL('../app/account/settings/page.tsx', import.meta.url),
  'utf8',
)
const migration = readFileSync(
  new URL('../supabase/migrations/20260715224500_phone_validation_flags.sql', import.meta.url),
  'utf8',
)

test('phone numbers are normalized and risk-checked without fake SMS verification', () => {
  assert.match(phoneVerification, /normalizePhone/)
  assert.match(phoneVerification, /detectPhoneCountry/)
  assert.match(phoneVerification, /phone_country_mismatch/)
  assert.match(phoneVerification, /phone_format_invalid/)
  assert.match(phoneVerification, /phoneRiskStatus/)
  assert.match(migration, /phone_verified boolean not null default false/)
  assert.match(migration, /phone_verification_status/)
  assert.match(migration, /phone_risk_flags text\[\]/)
  assert.match(migration, /'phone_format'/)
})

test('registration and profile edits store phone validation state server-side', () => {
  for (const source of [registerApi, profileApi]) {
    assert.match(source, /validatePhoneForCountry/)
    assert.match(source, /phone_verified: false/)
    assert.match(source, /phone_verification_status: phoneValidation\.status/)
    assert.match(source, /phone_risk_flags:/)
    assert.match(source, /check_type: 'phone_format'/)
    assert.match(source, /phone_verified_with_code: false/)
  }
  assert.match(profileApi, /phone_changed_recently/)
  assert.doesNotMatch(registerApi, /phone_verified: true/)
  assert.doesNotMatch(profileApi, /phone_verified: true/)
})

test('my pages show email verification separately from phone code verification', () => {
  assert.match(profileForm, /emailVerification/)
  assert.match(profileForm, /phoneVerification/)
  assert.match(profileForm, /Format checked, not code verified/)
  assert.match(settingsPage, /phoneStatusLabel/)
  assert.match(settingsPage, /phone_verified/)
  assert.match(settingsPage, /phone_verification_status/)
})

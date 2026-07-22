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
const emailCodeRequestApi = readFileSync(
  new URL('../app/api/auth/email-code/request/route.ts', import.meta.url),
  'utf8',
)
const emailVerification = readFileSync(
  new URL('../lib/email-verification.ts', import.meta.url),
  'utf8',
)
const placeName = readFileSync(
  new URL('../lib/place-name.ts', import.meta.url),
  'utf8',
)
const accountPage = readFileSync(
  new URL('../app/konto/page.tsx', import.meta.url),
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
  assert.match(phoneVerification, /phone_repeated_digits/)
  assert.match(phoneVerification, /phone_sequential_digits/)
  assert.match(phoneVerification, /phone_reserved_test_number/)
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

test('my pages show email verification separately from phone format checks', () => {
  assert.match(profileForm, /emailVerification/)
  assert.match(profileForm, /phoneCheck/)
  assert.match(profileForm, /Format approved/)
  assert.match(profileForm, /Checked when saved/)
  assert.match(profileForm, /\/api\/auth\/email-code\/request/)
  assert.match(profileForm, /\/api\/auth\/email-code\/verify/)
  assert.match(profileForm, /purpose: 'email_verification'/)
  assert.match(profileForm, /verifyEmailButton/)
  assert.match(emailCodeRequestApi, /getEmailVerificationCodeCopy/)
  assert.match(emailCodeRequestApi, /body\.purpose === 'email_verification'/)
  assert.match(emailCodeRequestApi, /redirect_path: body\.purpose === 'email_verification'/)
  assert.match(emailVerification, /auth_email_codes/)
  assert.match(emailVerification, /redirect_path/)
  assert.match(emailVerification, /email_verification/)
  assert.match(emailVerification, /consumed_at/)
  assert.doesNotMatch(profileForm, /phoneVerification/)
  assert.doesNotMatch(profileForm, /not code verified/i)
  assert.match(settingsPage, /phoneStatusLabel/)
  assert.match(settingsPage, /phoneCheck/)
  assert.match(settingsPage, /phone_verified/)
  assert.match(settingsPage, /phone_verification_status/)
  assert.doesNotMatch(settingsPage, /Phone verification/)
})

test('private account overview uses explicit email-code verification and risk status for the visible verification badge', () => {
  assert.match(accountPage, /privateVerificationComplete/)
  assert.match(accountPage, /hasVerifiedEmailCode/)
  assert.match(accountPage, /emailVerified/)
  assert.match(accountPage, /profile\.risk_status === 'standard'/)
  assert.match(accountPage, /copy\.verified : copy\.reviewPending/)
})

test('profile address place names are normalized before storage', () => {
  assert.match(placeName, /normalizePlaceName/)
  assert.match(placeName, /toLocaleLowerCase/)
  assert.match(registerApi, /normalizePlaceName\(body\.city\)/)
  assert.match(registerApi, /normalizePlaceName\(body\.region\)/)
  assert.match(profileApi, /normalizePlaceName\(body\.city\)/)
  assert.match(profileApi, /normalizePlaceName\(body\.region\)/)
})

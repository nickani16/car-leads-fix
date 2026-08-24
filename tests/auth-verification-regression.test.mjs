import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const emailCodeVerifyApi = readFileSync(
  new URL('../app/api/auth/email-code/verify/route.ts', import.meta.url),
  'utf8',
)
const registerApi = readFileSync(
  new URL('../app/api/account/register/route.ts', import.meta.url),
  'utf8',
)
const registerForm = readFileSync(
  new URL('../app/registrera/RegisterForm.tsx', import.meta.url),
  'utf8',
)
const accountPage = readFileSync(
  new URL('../app/konto/page.tsx', import.meta.url),
  'utf8',
)
const accountSettingsPage = readFileSync(
  new URL('../app/account/settings/page.tsx', import.meta.url),
  'utf8',
)
const privateProfilePage = readFileSync(
  new URL('../app/account/profile/page.tsx', import.meta.url),
  'utf8',
)
const companyProfilePage = readFileSync(
  new URL('../app/account/company/profile/page.tsx', import.meta.url),
  'utf8',
)
const emailVerification = readFileSync(
  new URL('../lib/email-verification.ts', import.meta.url),
  'utf8',
)
const listingDetailPage = readFileSync(
  new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url),
  'utf8',
)
const marketplacePublicData = readFileSync(
  new URL('../lib/marketplace-public-data.ts', import.meta.url),
  'utf8',
)

test('email login codes are consumed atomically before session creation', () => {
  assert.match(emailCodeVerifyApi, /const consumedAt = new Date\(\)\.toISOString\(\)/)
  assert.match(emailCodeVerifyApi, /\.update\(\{ consumed_at: consumedAt \}\)/)
  assert.match(emailCodeVerifyApi, /const challengeId = challenge\.id/)
  assert.match(emailCodeVerifyApi, /\.eq\('id', challengeId\)/)
  assert.match(emailCodeVerifyApi, /\.is\('consumed_at', null\)/)
  assert.match(emailCodeVerifyApi, /\.select\('id'\)/)
  assert.match(emailCodeVerifyApi, /copy\.usedCode/)
  assert.match(emailCodeVerifyApi, /supabase\.auth\.verifyOtp/)
  assert.match(emailCodeVerifyApi, /identity_status: 'format_validated'/)
  assert.match(emailCodeVerifyApi, /verification_updated_at/)

  const consumptionChecks = [...emailCodeVerifyApi.matchAll(/if \(!\(await consumeChallenge\(\)\)\)/g)]
  assert.equal(consumptionChecks.length, 2)
  const loginConsumptionIndex = consumptionChecks[1].index
  const loginLinkIndex = emailCodeVerifyApi.indexOf('let link = await admin.auth.admin.generateLink')
  const verifyOtpIndex = emailCodeVerifyApi.indexOf('supabase.auth.verifyOtp')
  assert.ok(loginConsumptionIndex < loginLinkIndex)
  assert.ok(loginConsumptionIndex < verifyOtpIndex)
})

test('marketplace profile creation requires a confirmed email session', () => {
  assert.match(registerApi, /!user\?\.email/)
  assert.match(registerApi, /!user\.email_confirmed_at/)
  assert.match(registerApi, /Bekr.*mejladressen med koden/)
  assert.match(registerApi, /\{ status: 403 \}/)
  assert.match(registerApi, /verified_at: user\.email_confirmed_at/)
})

test('account profile treats confirmed Supabase email as verified', () => {
  assert.match(emailVerification, /hasConfirmedSupabaseEmail/)
  assert.match(emailVerification, /user\?\.email_confirmed_at/)
  assert.match(emailVerification, /normalizeEmail\(user\.email\) === normalizedEmail/)
  assert.match(emailVerification, /hasConfirmedSupabaseEmail\(user, email\) \|\| \(await hasVerifiedEmailCode\(email\)\)/)
  assert.match(accountPage, /hasVerifiedAccountEmail\(profile\.email, user\)/)
  assert.match(accountSettingsPage, /hasVerifiedAccountEmail\(profile\.email, user\)/)
  assert.match(privateProfilePage, /hasVerifiedAccountEmail\(profile\.email, user\)/)
  assert.match(companyProfilePage, /hasVerifiedAccountEmail\(profile\?\.email, authUser\.user\)/)
  assert.doesNotMatch(accountPage, /hasVerifiedEmailCode\(profile\.email\)/)
  assert.doesNotMatch(accountSettingsPage, /hasVerifiedEmailCode\(profile\.email\)/)
  assert.doesNotMatch(privateProfilePage, /hasVerifiedEmailCode\(profile\.email\)/)
  assert.doesNotMatch(companyProfilePage, /hasVerifiedEmailCode\(profile\?\.email\)/)
})

test('public private seller trust follows verified email and risk status', () => {
  assert.match(listingDetailPage, /hasVerifiedAccountEmail\(profile\?\.email, authUser\)/)
  assert.match(listingDetailPage, /const verified = riskOk && \(identityApproved \|\| emailVerified\)/)
  assert.match(marketplacePublicData, /select\('user_id,email,account_type,identity_status,business_verification_status,risk_status/)
  assert.match(marketplacePublicData, /isPrivateSellerTrusted\(admin, profile\)/)
  assert.match(marketplacePublicData, /hasVerifiedAccountEmail\(profile\.email, authUser\)/)
  assert.match(marketplacePublicData, /identityStatus !== 'rejected'/)
  assert.match(listingDetailPage, /identityStatus !== 'rejected'/)
})

test('private registration uses shared country-specific national id review', () => {
  assert.match(registerApi, /reviewNationalId\(countryCode, nationalId\)\.status/)
  assert.match(registerApi, /normalizeNationalId\(nationalId\)/)
  assert.match(registerApi, /needs_review/)
  assert.match(registerApi, /identityStatus\s*=[\s\S]*nationalIdStatus === 'passed'[\s\S]*'format_validated'[\s\S]*'needs_review'/)
  assert.match(registerForm, /<NationalIdField/)
  assert.match(registerForm, /nationalIdPlaceholderByCountry: Record<string, string>/)
  assert.match(registerForm, /placeholder=\{nationalIdPlaceholderByCountry\[countryCode\] \?\? nationalIdPlaceholderCopy\[locale\]\}/)
  for (const countryCode of ['AT', 'BE', 'DE', 'DK', 'ES', 'FI', 'FR', 'IT', 'NL', 'PL', 'SE']) {
    assert.match(registerForm, new RegExp(`\\b${countryCode}: '`))
  }
  assert.match(registerForm, /DNI 12345678Z \/ NIE X1234567L/)
  assert.match(registerForm, /HETU: 131052-308T/)
  assert.match(registerForm, /PESEL: 44051401359/)
  assert.match(registerForm, /!value \? \(/)
  assert.match(registerForm, /text-\[#7b8494\]/)
  assert.match(registerForm, /text-\[#101828\]/)
  assert.match(registerForm, /spellCheck=\{false\}/)
  assert.match(registerForm, /nationalId: 'Personnummer'/)
  assert.match(registerForm, /nationalIdGuidanceCopy: Record<[\s\S]*sv:[\s\S]*en:[\s\S]*de:[\s\S]*at:[\s\S]*be:[\s\S]*fr:[\s\S]*es:[\s\S]*it:[\s\S]*pl:[\s\S]*nl:[\s\S]*fi:[\s\S]*da:/)
  assert.match(registerForm, /Används bara för kontosäkerhet och kontroll/)
  assert.match(registerForm, /Never shown publicly/)
  assert.match(registerForm, /reviewNationalId\(countryCode, nationalId\)\.status === 'invalid'/)
  assert.match(registerForm, /localizedRegistrationErrorCode\(locale, 'register_invalid_national_id', countryCode\)/)
})

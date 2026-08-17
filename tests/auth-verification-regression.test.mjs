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

test('private registration can continue when Swedish national id needs manual review', () => {
  assert.match(registerApi, /nationalIdReviewStatus/)
  assert.match(registerApi, /needs_review/)
  assert.match(registerApi, /identityStatus\s*=[\s\S]*nationalIdStatus === 'passed'[\s\S]*'verified'[\s\S]*'needs_review'/)
  assert.match(registerForm, /<NationalIdField/)
  assert.match(registerForm, /placeholder=\{countryCode === 'SE'/)
  assert.match(registerForm, /!value \? \(/)
  assert.match(registerForm, /text-\[#7b8494\]/)
  assert.match(registerForm, /text-\[#101828\]/)
  assert.match(registerForm, /spellCheck=\{false\}/)
  assert.match(registerForm, /nationalId: 'Personnummer'/)
  assert.match(registerForm, /nationalIdGuidanceCopy: Record<[\s\S]*sv:[\s\S]*en:[\s\S]*de:[\s\S]*at:[\s\S]*be:[\s\S]*fr:[\s\S]*es:[\s\S]*it:[\s\S]*pl:[\s\S]*nl:[\s\S]*fi:[\s\S]*da:/)
  assert.match(registerForm, /Används bara för kontosäkerhet och kontroll/)
  assert.match(registerForm, /Never shown publicly/)
})

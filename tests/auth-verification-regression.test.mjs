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

test('email login codes are consumed atomically before session creation', () => {
  assert.match(emailCodeVerifyApi, /const consumedAt = new Date\(\)\.toISOString\(\)/)
  assert.match(emailCodeVerifyApi, /\.update\(\{ consumed_at: consumedAt \}\)/)
  assert.match(emailCodeVerifyApi, /\.eq\('id', challenge\.id\)/)
  assert.match(emailCodeVerifyApi, /\.is\('consumed_at', null\)/)
  assert.match(emailCodeVerifyApi, /\.select\('id'\)/)
  assert.match(emailCodeVerifyApi, /copy\.usedCode/)
  assert.match(emailCodeVerifyApi, /supabase\.auth\.verifyOtp/)
})

test('marketplace profile creation requires a confirmed email session', () => {
  assert.match(registerApi, /!user\?\.email/)
  assert.match(registerApi, /!user\.email_confirmed_at/)
  assert.match(registerApi, /Bekr.*mejladressen med koden/)
  assert.match(registerApi, /\{ status: 403 \}/)
  assert.match(registerApi, /verified_at: user\.email_confirmed_at/)
})

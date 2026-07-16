import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const authComponent = readFileSync(new URL('../app/components/EmailCodeAuth.tsx', import.meta.url), 'utf8')
const authModal = readFileSync(new URL('../app/components/AuthModal.tsx', import.meta.url), 'utf8')
const loginPage = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8')
const forgotPage = readFileSync(new URL('../app/forgot-password/page.tsx', import.meta.url), 'utf8')
const resetPage = readFileSync(new URL('../app/reset-password/page.tsx', import.meta.url), 'utf8')
const signupRoute = readFileSync(new URL('../app/api/auth/password-signup/route.ts', import.meta.url), 'utf8')
const otpRequestRoute = readFileSync(new URL('../app/api/auth/email-code/request/route.ts', import.meta.url), 'utf8')
const recoveryRoute = readFileSync(new URL('../app/api/auth/password-recovery/route.ts', import.meta.url), 'utf8')
const authLocale = readFileSync(new URL('../lib/auth-locale.ts', import.meta.url), 'utf8')
const authEmails = readFileSync(new URL('../lib/email/auth-emails.ts', import.meta.url), 'utf8')
const localizedCatchall = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const supabaseBrowserClient = readFileSync(new URL('../lib/supabase/client.ts', import.meta.url), 'utf8')
const supabaseServerClient = readFileSync(new URL('../lib/supabase/server.ts', import.meta.url), 'utf8')
const accountLayout = readFileSync(new URL('../app/konto/layout.tsx', import.meta.url), 'utf8')
const adminLayout = readFileSync(new URL('../app/admin/layout.tsx', import.meta.url), 'utf8')

test('login UI offers password first while preserving one-time code login', () => {
  assert.match(authComponent, /authMethod.*password/)
  assert.match(authComponent, /signInWithPassword/)
  assert.match(authComponent, /useCodeInstead/)
  assert.match(authComponent, /usePasswordInstead/)
  assert.match(authComponent, /\/api\/auth\/email-code\/request/)
  assert.match(authComponent, /\/api\/auth\/email-code\/verify/)
  assert.match(authComponent, /forgot-password/)
})

test('public header auth popup uses password first and keeps OTP fallback', () => {
  assert.match(authModal, /authMethod.*password/)
  assert.match(authModal, /signInWithPassword/)
  assert.match(authModal, /\/api\/auth\/password-signup/)
  assert.match(authModal, /useCodeInstead/)
  assert.match(authModal, /usePasswordInstead/)
  assert.match(authModal, /requestPasswordReset/)
  assert.match(authModal, /updateRecoveredPassword/)
  assert.match(authModal, /switchView\('forgot'\)/)
  assert.match(authModal, /\/api\/auth\/email-code\/request/)
  assert.match(authModal, /\/api\/auth\/email-code\/verify/)
  assert.match(authModal, /role="checkbox"/)
  assert.match(authModal, /aria-checked=\{remember\}/)
  assert.match(authModal, /setRemember\(\(current\) => !current\)/)
})

test('legacy auth pages redirect into the public auth popup', () => {
  assert.match(loginPage, /redirect\('\/\?auth=login'\)/)
  assert.match(forgotPage, /redirect\('\/\?auth=forgot-password'\)/)
  assert.match(resetPage, /redirect\('\/\?auth=reset-password'\)/)
  assert.doesNotMatch(forgotPage, /<form|BrandLogo|login\.module\.css/)
  assert.doesNotMatch(resetPage, /<form|BrandLogo|login\.module\.css/)
})

test('password registration uses Supabase Auth without a parallel password store', () => {
  assert.match(signupRoute, /supabase\.auth\.signUp/)
  assert.match(signupRoute, /emailRedirectTo/)
  assert.match(signupRoute, /preferred_locale/)
  assert.match(signupRoute, /isStrongPassword/)
  assert.doesNotMatch(signupRoute, /from\('.*password|password_hash|create table/)
})

test('auth emails carry active locale and localized reset links', () => {
  assert.match(authLocale, /localeFromRequest/)
  assert.match(authLocale, /localizedAuthPath/)
  assert.match(otpRequestRoute, /localeFromRequest\(request, body\.locale\)/)
  assert.match(otpRequestRoute, /getOtpEmailCopy\(locale, code\)/)
  assert.match(recoveryRoute, /localeFromRequest\(request, body\.locale\)/)
  assert.match(recoveryRoute, /getPasswordResetEmailCopy\(locale\)/)
  assert.match(recoveryRoute, /next'.*localizedAuthPath\(locale, '\/\?auth=reset-password'\)/s)
  for (const marker of ['sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authEmails, new RegExp(`${marker}: \\{`))
  }
})

test('market-prefixed auth pages resolve through localized catchall', () => {
  assert.match(localizedCatchall, /slugPath === 'login'/)
  assert.match(localizedCatchall, /slugPath === 'register'/)
  assert.match(localizedCatchall, /slugPath === 'forgot-password'/)
  assert.match(localizedCatchall, /slugPath === 'reset-password'/)
})

test('auth sessions persist and are not cleared by inactivity logout', () => {
  assert.match(supabaseBrowserClient, /persistSession:\s*true/)
  assert.match(supabaseBrowserClient, /autoRefreshToken:\s*true/)
  assert.match(supabaseBrowserClient, /maxAge:\s*400 \* 24 \* 60 \* 60/)
  assert.match(supabaseServerClient, /maxAge:\s*400 \* 24 \* 60 \* 60/)
  assert.doesNotMatch(accountLayout, /InactivityLogout/)
  assert.doesNotMatch(adminLayout, /InactivityLogout/)
})

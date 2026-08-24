import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const authModal = readFileSync(new URL('../app/components/AuthModal.tsx', import.meta.url), 'utf8')
const authCallback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8')
const authCopy = readFileSync(new URL('../lib/auth-copy.ts', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const registerPage = readFileSync(new URL('../app/registrera/page.tsx', import.meta.url), 'utf8')
const accountIntent = readFileSync(new URL('../lib/account-intent.ts', import.meta.url), 'utf8')
const accountPage = readFileSync(new URL('../app/konto/page.tsx', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')
const publicHeader = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const rootPage = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8')
const marketPage = readFileSync(new URL('../app/[market]/page.tsx', import.meta.url), 'utf8')
const germanPage = readFileSync(new URL('../app/de/page.tsx', import.meta.url), 'utf8')

test('social login uses supported Supabase providers and provider logos', () => {
  for (const provider of ['google', 'azure', 'facebook']) {
    assert.match(authModal, new RegExp(`provider: '${provider}'`))
  }
  assert.doesNotMatch(authModal, /provider: 'apple'/)
  assert.match(authModal, /<SocialProviderLogo provider=\{provider\}/)
  assert.match(authModal, /provider === 'azure'/)
  assert.match(authModal, /scopes: provider === 'azure' \? 'email' : undefined/)
  assert.match(authModal, /fill="#1877F2"/)
  assert.doesNotMatch(authModal, /mark: '[GAMf]'/)
})

test('social provider clicks start Supabase OAuth directly and surface failures', () => {
  assert.doesNotMatch(authModal, /\/auth\/v1\/settings/)
  assert.match(authModal, /supabase\.auth\.signInWithOAuth/)
  assert.match(authModal, /setSocialLoading\(provider\)/)
  assert.match(authModal, /setError\(copy\.socialError\)/)
})

test('OAuth callback preserves safe destinations and localized market paths', () => {
  assert.match(authModal, /redirectTo\.searchParams\.set\('flow', 'oauth'\)/)
  assert.match(authCallback, /!next\.startsWith\('\/\/'\)/)
  assert.match(authCallback, /!next\.startsWith\('\/api\/'\)/)
  assert.match(authCallback, /safeNext\.match\(\/\^\\\/\(at\|be\|fr\|es\|it\|pl\|nl\|fi\|dk\)/)
  assert.match(authCallback, /exchangeCodeForSession\(code\)/)
  assert.match(authCallback, /if \(user\?\.email\)/)
  assert.match(authCallback, /if \(isOauthFlow\) return oauthFailureRedirect\('oauth-error'\)/)
  assert.match(proxy, /pathname === '\/' && request\.nextUrl\.searchParams\.has\('code'\)/)
  assert.match(proxy, /url\.pathname = '\/auth\/callback'/)
  assert.match(proxy, /url\.searchParams\.set\('flow', 'oauth'\)/)
})

test('mobile more menu keeps the guest CTA and account row compact', () => {
  const moreMenu = publicHeader.slice(publicHeader.indexOf('{mobileMoreOpen ? ('))
  const ctaIndex = moreMenu.indexOf('accountMenuCopy.create')
  const accountSectionIndex = moreMenu.indexOf("<section className={headerAccount.authenticated")
  assert.ok(ctaIndex >= 0)
  assert.ok(accountSectionIndex > ctaIndex)
  assert.match(moreMenu.slice(0, accountSectionIndex), /border-\[#0866ff\]/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /bg-white/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /text-\[#0866ff\]/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /rounded-full/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /min-h-11/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /w-full/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /<Plus/)
  assert.match(moreMenu.slice(0, accountSectionIndex), /!headerAccount\.authenticated/)
  assert.match(moreMenu, /accountMenuCopy\.newHere/)
  assert.match(moreMenu, /accountMenuCopy\.startHere/)
  assert.doesNotMatch(moreMenu, /Save vehicles, searches and contact sellers faster/)
  assert.equal((moreMenu.match(/data-mobile-menu-divider/g) || []).length, 5)
})

test('registration keeps two auth tabs and exposes a localized business switch', () => {
  assert.match(authModal, /\['login', 'register'\]/)
  assert.doesNotMatch(authModal, /\['login', 'register', 'business'\]/)
  assert.match(authModal, /role="switch"/)
  assert.match(authModal, /aria-checked=\{isBusinessRegistration\}/)
  assert.match(publicHeader, /params\.get\('account'\) === 'business'/)
  assert.match(publicHeader, /initialBusinessRegistration=\{authBusinessRegistration\}/)
  assert.match(authModal, /saveAccountIntent/)
  assert.match(accountIntent, /autorell_account_intent/)
  assert.match(accountIntent, /SameSite=Lax/)
  assert.match(registerForm, /clearAccountIntent\(\)/)
  assert.match(registerForm, /value=\{companyName\}/)
  assert.match(registerForm, /value=\{registrationNumber\}/)
  assert.doesNotMatch(authModal, /companyNamePlaceholder|requiredError/)
  assert.doesNotMatch(authModal, /\/register\?onboarding=1/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authModal, new RegExp(`\\n  ${locale}: \\{ switchLabel:`))
  }
})

test('new accounts skip onboarding until they create a listing', () => {
  assert.match(authModal, /return postLoginDestination \|\| accountDestination\(\)/)
  assert.match(accountPage, /function LightweightAccount/)
  assert.match(accountPage, /if \(!profile\)/)
  assert.match(newListingPage, /if \(!profile\)/)
  assert.match(newListingPage, /ACCOUNT_INTENT_COOKIE/)
  assert.match(newListingPage, /\/register\?\$\{registrationParams\.toString\(\)\}/)
  assert.match(registerPage, /completionDestination=\{completionDestination\}/)
  assert.match(registerForm, /router\.push\(completionDestination\)/)
})

test('login and registration metadata is localized and stays within requested limits', () => {
  const seoBlock = authCopy.slice(
    authCopy.indexOf('const authSeoCopy:'),
    authCopy.indexOf('export function getAuthSeoCopy'),
  )
  const titles = [...seoBlock.matchAll(/title: '([^']+)'/g)].map((match) => match[1])
  const descriptions = [...seoBlock.matchAll(/description: '([^']+)'/g)].map((match) => match[1])
  assert.equal(titles.length, 20)
  assert.equal(descriptions.length, 20)
  assert.ok(titles.every((title) => title.length <= 55))
  assert.ok(descriptions.every((description) => description.length <= 155))
  assert.match(rootPage, /getAuthSeoCopy\(market, auth\)/)
  assert.match(marketPage, /getAuthSeoCopy\(locale, auth\)/)
  assert.match(germanPage, /getAuthSeoCopy\('de', auth\)/)
})

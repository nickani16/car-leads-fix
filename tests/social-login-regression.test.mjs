import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const authModal = readFileSync(new URL('../app/components/AuthModal.tsx', import.meta.url), 'utf8')
const emailCodeAuth = readFileSync(new URL('../app/components/EmailCodeAuth.tsx', import.meta.url), 'utf8')
const authCallback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8')
const authCopy = readFileSync(new URL('../lib/auth-copy.ts', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const accountIntent = readFileSync(new URL('../lib/account-intent.ts', import.meta.url), 'utf8')
const accountBootstrap = readFileSync(new URL('../lib/account-profile-bootstrap.ts', import.meta.url), 'utf8')
const emailCodeVerify = readFileSync(new URL('../app/api/auth/email-code/verify/route.ts', import.meta.url), 'utf8')
const passwordSignup = readFileSync(new URL('../app/api/auth/password-signup/route.ts', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')
const publicHeader = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const businessMarketplaceHome = readFileSync(new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url), 'utf8')
const profileForm = readFileSync(new URL('../app/konto/ProfileForm.tsx', import.meta.url), 'utf8')
const profileRoute = readFileSync(new URL('../app/api/account/profile/route.ts', import.meta.url), 'utf8')
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
  assert.match(authModal, /window\.location\.assign\(oauthData\.url\)/)
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

test('mobile more menu omits create listing and keeps the account row compact', () => {
  const moreMenu = publicHeader.slice(publicHeader.indexOf('{mobileMoreOpen ? ('))
  const accountSectionIndex = moreMenu.indexOf("<section className={headerAccount.authenticated")
  assert.ok(accountSectionIndex >= 0)
  assert.doesNotMatch(moreMenu, /accountMenuCopy\.create/)
  assert.doesNotMatch(moreMenu, /createListingHref/)
  assert.match(moreMenu, /accountMenuCopy\.newHere/)
  assert.match(moreMenu, /accountMenuCopy\.startHere/)
  assert.doesNotMatch(moreMenu, /Save vehicles, searches and contact sellers faster/)
  assert.equal((moreMenu.match(/data-mobile-menu-divider/g) || []).length, 4)
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
  assert.match(authModal, /businessIdentityCopy\.companyNamePlaceholder/)
  assert.match(authModal, /businessIdentityCopy\.registrationNumberPlaceholder/)
  assert.match(authModal, /registrationDetailsAreValid/)
  assert.doesNotMatch(authModal, /\/register\?onboarding=1/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authModal, new RegExp(`\\n  ${locale}: \\{ switchLabel:`))
  }
})

test('new accounts receive a minimal profile and defer completion until listing creation', () => {
  assert.match(authModal, /return postLoginDestination \|\| accountDestination\(\)/)
  assert.match(authCallback, /ensureMarketplaceProfile/)
  assert.match(emailCodeVerify, /ensureMarketplaceProfile/)
  assert.match(passwordSignup, /autorell_account_type/)
  assert.match(accountBootstrap, /marketplace_profiles/)
  assert.match(accountBootstrap, /marketplace_companies/)
  assert.match(accountBootstrap, /marketplace_company_members/)
  assert.match(accountBootstrap, /isMarketplaceProfileComplete/)
  assert.match(newListingPage, /if \(!isMarketplaceProfileComplete\(profile\)\)/)
  assert.match(newListingPage, /\/account\/company\/profile/)
  assert.match(newListingPage, /\/account\/profile/)
  assert.doesNotMatch(emailCodeAuth, /onboarding=1/)
  assert.doesNotMatch(businessMarketplaceHome, /onboarding=1/)
  assert.match(businessMarketplaceHome, /auth=register&account=business/)
  assert.match(publicHeader, /profileComplete === false/)
  assert.match(publicHeader, /getIncompleteProfileCopy\(locale\)/)
  assert.match(profileForm, /searchParams\.get\('next'\)/)
  assert.match(profileRoute, /business_onboarding_status: 'submitted'/)
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

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const authModal = readFileSync(new URL('../app/components/AuthModal.tsx', import.meta.url), 'utf8')
const authCallback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8')
const authCopy = readFileSync(new URL('../lib/auth-copy.ts', import.meta.url), 'utf8')
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

test('disabled providers stay inside Autorell with a localized error', () => {
  assert.match(authModal, /\/auth\/v1\/settings/)
  assert.match(authModal, /settings\.external\?\.\[provider\] === true/)
  assert.match(authModal, /setError\(copy\.providerUnavailable\)/)
  assert.match(authCopy, /providerUnavailable: string/)
  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authCopy, new RegExp(`${locale}: \\{[\\s\\S]*?providerUnavailable:`))
  }
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

test('auth modal offers a localized business path through the existing onboarding', () => {
  assert.match(authModal, /type AuthTab = AuthMode \| 'business'/)
  assert.match(authModal, /\['login', 'register', 'business'\]/)
  assert.match(authModal, /authTab === 'business'/)
  assert.match(authModal, /\/register\?onboarding=1&account=business/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(authModal, new RegExp(`\\n  ${locale}: \\{ tab:`))
  }
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

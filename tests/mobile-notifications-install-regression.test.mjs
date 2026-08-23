import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const notificationCenter = readFileSync(new URL('../app/components/HeaderNotificationCenter.tsx', import.meta.url), 'utf8')
const installButton = readFileSync(new URL('../app/components/InstallAutorellButton.tsx', import.meta.url), 'utf8')
const installAction = readFileSync(new URL('../app/components/AppInstallAction.tsx', import.meta.url), 'utf8')
const pwaRegistration = readFileSync(new URL('../app/components/PwaRegistration.tsx', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const locationPrompt = readFileSync(new URL('../app/components/HomeLocationConsentPrompt.tsx', import.meta.url), 'utf8')
const registerPage = readFileSync(new URL('../app/registrera/page.tsx', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

const locales = ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']

test('location sharing remains mobile-only and registration hides the mobile bottom navigation', () => {
  assert.match(locationPrompt, /min-\[1120px\]:hidden/)
  assert.match(registerPage, /<PublicHeader locale=\{locale\} marketCode=\{marketCode\} hideMobileBottomNav \/>/)
  assert.match(header, /hideMobileBottomNav \|\| authModalOpen \? 'hidden' : ''/)
})

test('desktop create listing CTA is only rendered for signed-out visitors', () => {
  assert.match(header, /headerAccountResolved && !headerAccount\.authenticated \? \([\s\S]*href=\{createListingHref\}[\s\S]*accountMenuCopy\.create[\s\S]*\) : null/)
})

test('mobile menus keep category links without create-listing or offer-type controls', () => {
  assert.equal((header.match(/searchIntentOptions\.map/g) || []).length, 1)
  assert.doesNotMatch(header, /mx-1 mb-4 flex h-12[\s\S]*accountMenuCopy\.create/)
  assert.doesNotMatch(header, /mt-6 flex min-h-14[\s\S]*accountMenuCopy\.create/)
})

test('notification center is localized and links existing reminders and messages', () => {
  for (const locale of locales) assert.match(notificationCenter, new RegExp(`\\n  ${locale}: \\{`))
  assert.match(notificationCenter, /Notification\.requestPermission\(\)/)
  assert.match(notificationCenter, /registration\.showNotification\('Autorell'/)
  assert.match(notificationCenter, /href=\{messagesHref\}/)
  assert.match(notificationCenter, /href=\{savedSearchesHref\}/)
  assert.match(header, /<HeaderNotificationCenter/)
})

test('footer exposes localized device-aware PWA installation', () => {
  for (const locale of locales) assert.match(installButton, new RegExp(`\\n  ${locale}: \\{`))
  assert.match(pwaRegistration, /beforeinstallprompt/)
  assert.match(installAction, /display-mode: standalone/)
  assert.match(installAction, /navigator\.share/)
  assert.match(installAction, /role="dialog"/)
  assert.match(installAction, /max-width: 1119px/)
  assert.match(installAction, /mobileInstallCopy: Record<PublicLocale/)
  for (const locale of locales) assert.match(installAction, new RegExp(`\\n  ${locale}: \\{`))
  assert.doesNotMatch(installAction, /!available/)
  assert.match(installButton, /localizePublicHref\(locale, '\/app'\)/)
  assert.match(footer, /<InstallAutorellButton locale=\{locale\} \/>/)
  assert.match(layout, /<PwaRegistration \/>/)
  assert.match(serviceWorker, /self\.clients\.claim\(\)/)
})

test('custom primary-color scrollbar is limited to desktop pointer layouts', () => {
  assert.match(globals, /@media \(min-width: 1120px\) and \(hover: hover\)/)
  assert.match(globals, /@supports not selector\(::-webkit-scrollbar\)/)
  assert.match(globals, /scrollbar-color: #0866ff #ffffff/)
  assert.match(globals, /\*::-webkit-scrollbar \{[\s\S]*width: 5px/)
  assert.match(globals, /\*::-webkit-scrollbar-thumb/)
  assert.match(globals, /border-radius: 0/)
  assert.match(globals, /\*::-webkit-scrollbar-button/)
})

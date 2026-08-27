import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appPage = readFileSync(new URL('../app/components/AppDownloadPage.tsx', import.meta.url), 'utf8')
const installAction = readFileSync(new URL('../app/components/AppInstallAction.tsx', import.meta.url), 'utf8')
const footerAction = readFileSync(new URL('../app/components/InstallAutorellButton.tsx', import.meta.url), 'utf8')
const marketplace = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')
const marketRoute = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const publicI18n = readFileSync(new URL('../lib/public-i18n.ts', import.meta.url), 'utf8')

const locales = ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']

test('app page is localized and provides two native install actions', () => {
  for (const locale of locales) assert.match(appPage, new RegExp(`\\n  ${locale}: \\{`))
  assert.equal((appPage.match(/<AppInstallAction/g) || []).length, 2)
  assert.match(appPage, /autorell-app-phone\.png/)
  assert.match(appPage, /autorell-app-everyday\.webp/)
  assert.match(installAction, /__autorellInstallPrompt/)
  assert.match(installAction, /navigator\.share/)
})

test('both public footers link to the localized app page', () => {
  assert.match(footerAction, /Smartphone/)
  assert.match(footerAction, /localizePublicHref\(locale, '\/app'\)/)
  assert.match(footerAction, /min-h-9/)
  assert.match(footerAction, /border-\[#d6e5fb\]/)
  assert.match(footerAction, /bg-\[#f4f8ff\]/)
  assert.match(footerAction, /text-\[#075fff\]/)
  assert.match(footerAction, /hover:bg-\[#075fff\] hover:text-white/)
  assert.match(marketplace, /<InstallAutorellButton locale=\{locale\} \/>/)
})

test('app page is routable and indexable across market paths', () => {
  assert.match(marketRoute, /slugPath === 'app'/)
  assert.match(marketRoute, /<AppDownloadPage locale=\{locale\}/)
  assert.match(publicI18n, /'\/app'/)
})

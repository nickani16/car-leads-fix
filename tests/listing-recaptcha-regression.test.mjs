import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const contact = readFileSync(new URL('../app/components/ListingContactFormButton.tsx', import.meta.url), 'utf8')
const report = readFileSync(new URL('../app/components/ListingReportButton.tsx', import.meta.url), 'utf8')
const contactApi = readFileSync(new URL('../app/api/listing-contact/route.ts', import.meta.url), 'utf8')
const reportApi = readFileSync(new URL('../app/api/listing-report/route.ts', import.meta.url), 'utf8')
const client = readFileSync(new URL('../lib/recaptcha-client.ts', import.meta.url), 'utf8')
const server = readFileSync(new URL('../lib/recaptcha.ts', import.meta.url), 'utf8')
const notice = readFileSync(new URL('../app/components/RecaptchaNotice.tsx', import.meta.url), 'utf8')
const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8')

test('listing contact and report forms obtain action-specific tokens at submit time', () => {
  assert.match(contact, /getRecaptchaToken\('listing_contact'\)/)
  assert.match(contact, /JSON\.stringify\(\{ \.\.\.payload, recaptchaToken \}\)/)
  assert.match(report, /getRecaptchaToken\('listing_report'\)/)
  assert.match(report, /recaptchaToken,/)
  assert.match(contact, /<RecaptchaNotice locale=\{locale\} \/>/)
  assert.match(report, /<RecaptchaNotice locale=\{locale\} \/>/)
})

test('listing APIs verify reCAPTCHA server-side with expected actions and score', () => {
  assert.match(contactApi, /verifyRecaptcha\(body\?\.recaptchaToken, 'listing_contact'\)/)
  assert.match(reportApi, /verifyRecaptcha\(body\.recaptchaToken, 'listing_report'\)/)
  assert.match(server, /https:\/\/www\.google\.com\/recaptcha\/api\/siteverify/)
  assert.match(server, /result\.action !== expectedAction/)
  assert.match(server, /result\.score < minimumScore/)
  assert.match(server, /RECAPTCHA_MIN_SCORE \|\| '0\.5'/)
})

test('reCAPTCHA client is lazy and legal notice covers every public locale', () => {
  assert.match(client, /api\.js\?render=/)
  assert.match(client, /recaptcha\.execute\(siteKey, \{ action \}\)/)
  assert.match(notice, /https:\/\/policies\.google\.com\/privacy/)
  assert.match(notice, /https:\/\/policies\.google\.com\/terms/)
  assert.match(nextConfig, /script-src[^\n]+https:\/\/www\.google\.com\/recaptcha\/[^\n]+https:\/\/www\.gstatic\.com\/recaptcha\//)
  assert.match(nextConfig, /frame-src https:\/\/www\.google\.com\/recaptcha\/ https:\/\/recaptcha\.google\.com\/recaptcha\//)
  assert.match(nextConfig, /connect-src[^\n]+https:\/\/www\.google\.com\/recaptcha\//)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(notice, new RegExp(`\\b${locale}:`))
  }
})

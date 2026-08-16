import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const checkoutRoute = readFileSync(
  new URL('../app/api/account/listing-checkout/route.ts', import.meta.url),
  'utf8',
)
const planChooser = readFileSync(
  new URL('../app/konto/business/subscription/BusinessPlanChooser.tsx', import.meta.url),
  'utf8',
)

test('Free activation updates the company subscription owner instead of the acting team member', () => {
  assert.match(checkoutRoute, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(checkoutRoute, /const subscriptionUserId = businessScope\?\.subscriptionUserId \|\| user\.id/)
  assert.match(checkoutRoute, /\.eq\('user_id', subscriptionUserId\)/)
  assert.match(checkoutRoute, /user_id: subscriptionUserId/)
  assert.match(checkoutRoute, /business_id: subscriptionBusinessId/)
  assert.match(checkoutRoute, /metadata: \{ activated_by: user\.id \}/)
})

test('Free activation closes stale paid billing and restores the whole company profile', () => {
  assert.match(checkoutRoute, /const stripeSubscriptionIds = Array\.from\(new Set\(/)
  assert.match(checkoutRoute, /for \(const stripeSubscriptionId of stripeSubscriptionIds\)/)
  assert.match(checkoutRoute, /subscriptions\.cancel\(stripeSubscriptionId\)/)
  assert.match(checkoutRoute, /const obsoleteSubscriptionIds = subscriptions/)
  assert.match(checkoutRoute, /\.in\('id', obsoleteSubscriptionIds\)/)
  assert.match(checkoutRoute, /stripe_subscription_id: null/)
  assert.match(checkoutRoute, /payment_status: 'not_required'/)
  assert.match(checkoutRoute, /business_onboarding_status: 'active'/)
  assert.match(checkoutRoute, /profileActivation\.eq\('company_id', subscriptionBusinessId\)/)
})

test('successful Free activation leaves the plan gate and opens listing creation', () => {
  assert.match(planChooser, /result\.activated/)
  assert.match(planChooser, /window\.location\.assign\(localizePublicHref\(locale, '\/account\/company\/listings\/create'\)\)/)
})

test('Free activation distinguishes account, verification and onboarding failures', () => {
  assert.match(checkoutRoute, /code: 'business_account_required'/)
  assert.match(checkoutRoute, /code: 'company_not_verified'/)
  assert.match(checkoutRoute, /code: 'business_onboarding_incomplete'/)
})

test('plan activation always clears loading after request and timeout failures', () => {
  assert.match(planChooser, /new AbortController\(\)/)
  assert.match(planChooser, /signal: controller\.signal/)
  assert.match(planChooser, /finally \{/)
  assert.match(planChooser, /setLoading\(''\)/)
})

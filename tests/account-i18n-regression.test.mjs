import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const files = [
  'app/konto/ProfileForm.tsx',
  'app/konto/annonser/ny/NewListingForm.tsx',
  'app/konto/annonser/ListingStatusActions.tsx',
  'app/konto/annonser/BulkListingActions.tsx',
  'app/konto/DeleteAccountPanel.tsx',
  'app/konto/betalningar/BillingPortalButton.tsx',
  'app/konto/business/subscription/BusinessPlanChooser.tsx',
  'app/konto/business/subscription/cancel/CancelSubscriptionClient.tsx',
  'app/konto/ReviewFlowPanel.tsx',
  'app/account/company/team/TeamInviteForm.tsx',
  'app/account/company/team/accept/AcceptTeamInvitation.tsx',
  'app/account/listings/[id]/edit/EditListingForm.tsx',
].map((path) => [path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')])

const accountErrorI18n = readFileSync(new URL('../lib/account-error-i18n.ts', import.meta.url), 'utf8')

test('account and listing client flows localize API errors before display', () => {
  for (const [path, source] of files) {
    assert.doesNotMatch(source, /result\??\.error\s*\|\|/, `${path} still renders raw API errors`)
    assert.doesNotMatch(source, /set(?:Error|Message)\(result\??\.error/, `${path} still sets raw API errors`)
  }
})

test('account API error translator covers all public non-English markets for core failures', () => {
  for (const locale of ['de', 'fr', 'es', 'it', 'nl', 'pl', 'fi', 'da']) {
    assert.match(accountErrorI18n, new RegExp(`${locale}: \\{[\\s\\S]*'You need to sign in\\.'`))
    assert.match(accountErrorI18n, new RegExp(`${locale}: \\{[\\s\\S]*'The listing could not be saved\\.'`))
    assert.match(accountErrorI18n, new RegExp(`${locale}: \\{[\\s\\S]*'The business subscription must be active before more listings can be created\\.'`))
    assert.match(accountErrorI18n, new RegExp(`${locale}: \\{[\\s\\S]*'Invitation could not be sent\\.'`))
  }
})

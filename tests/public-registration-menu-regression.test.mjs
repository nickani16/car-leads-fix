import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const registerForm = readFileSync(new URL('../app/registrera/RegisterForm.tsx', import.meta.url), 'utf8')
const birthDatePicker = readFileSync(new URL('../app/components/BirthDatePicker.tsx', import.meta.url), 'utf8')
const registerRoute = readFileSync(new URL('../app/api/account/register/route.ts', import.meta.url), 'utf8')
const registerPage = readFileSync(new URL('../app/registrera/page.tsx', import.meta.url), 'utf8')
const accountPage = readFileSync(new URL('../app/konto/page.tsx', import.meta.url), 'utf8')
const privateReactivationRoute = readFileSync(new URL('../app/api/account/reactivate-private/route.ts', import.meta.url), 'utf8')
const deleteRoute = readFileSync(new URL('../app/api/account/delete-request/route.ts', import.meta.url), 'utf8')
const adminUserRoute = readFileSync(new URL('../app/api/admin/users/[id]/route.ts', import.meta.url), 'utf8')
const profileLifecycleMigration = readFileSync(
  new URL('../supabase/migrations/20260816170712_marketplace_profile_account_lifecycle.sql', import.meta.url),
  'utf8',
)
const profileLifecycleBackfill = readFileSync(
  new URL('../supabase/migrations/20260816171420_backfill_self_deleted_profile_lifecycle.sql', import.meta.url),
  'utf8',
)

test('sell menu exposes the dealer flow with explicit copy for every public market', () => {
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(header, new RegExp(`\\n  ${locale}: \\{ label:`))
  }
  assert.match(header, /localizePublicHref\(locale, '\/sell-to-dealer'\)/)
  assert.match(header, /'\/sell-to-dealer'/)
})

test('desktop sell menu uses a restrained marketplace layout without icon tiles', () => {
  assert.match(header, /sellMenuOpen[\s\S]*w-\[22rem\][\s\S]*grid-cols-\[20px_minmax\(0,1fr\)_16px\]/)
  assert.match(header, /border-b border-\[#edf1f6\][\s\S]*last:border-b-0 hover:bg-\[#f8fafc\]/)
  assert.match(header, /<Icon className="mt-0\.5 h-\[17px\] w-\[17px\] text-\[#475467\]/)
  assert.match(header, /<ChevronRight className="mt-0\.5 h-4 w-4 text-\[#98a2b3\]/)
  assert.doesNotMatch(header, /sellMenuLinks\.map[\s\S]{0,1200}rounded-\[10px\] bg-\[#edf5ff\]/)
})

test('mobile bottom navigation is a floating rounded glass bar', () => {
  assert.match(header, /aria-label=\{publicLabel\('Mobile navigation'/)
  assert.match(header, /pointer-events-none fixed bottom-0 left-3/)
  assert.match(header, /style=\{\{ width: 'min\(356px, calc\(100vw - 24px\)\)' \}\}/)
  assert.match(header, /w-full grid-cols-4/)
  assert.match(header, /display: 'grid', gridTemplateColumns: 'repeat\(4, minmax\(0, 1fr\)\)'/)
  assert.match(header, /rounded-\[28px\] border border-white\/70 bg-white\/72/)
  assert.match(header, /backdrop-blur-2xl supports-\[backdrop-filter\]:bg-white\/64/)
  assert.match(header, /inset_0_1px_0_rgba\(255,255,255,\.88\)/)
  assert.match(header, /href=\{vehicleSearchHref\}[\s\S]*<Search className="h-\[21px\] w-\[21px\]"/)
  assert.match(header, /href=\{accountMessagesHref\}[\s\S]*<MessageSquareText className="h-\[21px\] w-\[21px\]"/)
  assert.match(header, /href=\{savedHref\}[\s\S]*<Heart className="h-\[21px\] w-\[21px\]"/)
  assert.match(header, /href=\{savedSearchesHref\}[\s\S]*<Bookmark className="h-\[21px\] w-\[21px\]"/)
  assert.match(header, /font-normal leading-none/)
  assert.match(header, /const mobileSavedSearchesLabel = \(\(\) =>/)
  assert.doesNotMatch(header, /publicLabel\('New ad', 'Ny annons', 'Neue Anzeige'\)/)
  assert.doesNotMatch(header, /fixed bottom-0 left-0 right-0 z-\[120\] w-full[\s\S]{0,180}border-t border-\[#e6ebf2\] bg-white\/96/)
})

test('registration uses the fast localized birth-date picker for private and business accounts', () => {
  assert.match(registerForm, /<BirthDatePicker/)
  assert.match(registerForm, /value=\{birthDate\}/)
  assert.match(registerForm, /required=\{accountType === 'private'\}/)
  assert.doesNotMatch(registerForm, /name="birthDate"[\s\S]{0,120}type="date"/)
  assert.match(birthDatePicker, /const pickerCopy: Record<PublicLocale, PickerCopy>/)
  assert.match(birthDatePicker, /maximumDate\.getFullYear\(\) - index/)
  assert.match(birthDatePicker, /1900-01-01/)
  assert.match(birthDatePicker, /ariaLabel=\{copy\.year\}/)
})

test('registration localizes API failures instead of rendering raw server text', () => {
  assert.match(registerForm, /localizedAccountError\(locale, result, copy\.createError\)/)
  assert.doesNotMatch(registerForm, /setError\(result\.error/)
  for (const code of [
    'register_auth_required',
    'register_email_unverified',
    'register_invalid_email',
    'register_invalid_name',
    'register_invalid_birth_date',
    'register_invalid_country',
    'register_invalid_phone',
    'register_invalid_address',
    'register_invalid_national_id',
    'register_invalid_company',
    'register_terms_required',
    'register_identity_in_use',
    'register_company_in_use',
    'register_recovery_required',
    'register_failed',
  ]) {
    assert.match(registerRoute, new RegExp(`['"]${code}['"]`))
  }
  assert.match(registerForm, /const registrationErrorCopy: Record</)
  assert.match(registerForm, /const registrationFieldErrorCopy: Record</)
})

test('registration retries safely and translates identity conflicts for every market', () => {
  assert.match(registerRoute, /return NextResponse\.json\(\{ success: true, existing: true \}\)/)
  assert.match(registerRoute, /registrationConflictResponse/)
  assert.match(registerRoute, /error\?\.code !== '23505'/)
  assert.match(registerRoute, /companyIdentifier/)
  assert.match(registerRoute, /normalizeIdentifier\(clean\(body\.registrationNumber\)\)/)
  assert.match(registerForm, /if \(loading\) return/)
  assert.match(registerForm, /finally \{\s*setLoading\(false\)/)
  assert.match(registerForm, /register_identity_in_use/)
  assert.match(registerForm, /register_company_in_use/)
  assert.match(registerForm, /register_recovery_required/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(
      registerForm,
      new RegExp(`\\n  ${locale}: \\{[\\s\\S]*register_identity_in_use:[\\s\\S]*register_company_in_use:[\\s\\S]*register_recovery_required:`),
    )
  }
})

test('self-deleted private accounts return directly to the account while businesses retain identity recovery', () => {
  assert.match(deleteRoute, /deleted_at: now/)
  assert.match(deleteRoute, /removed_by_admin: false/)
  assert.match(deleteRoute, /suspended: true/)
  assert.match(registerPage, /const canReactivate = Boolean/)
  assert.match(registerPage, /\/account\/reactivate/)
  assert.match(accountPage, /profile\.account_type === 'private'/)
  assert.match(accountPage, /profile\.account_type === 'private'[\s\S]*\/account\/reactivate'[\s\S]*\/register\?reactivate=1/)
  assert.match(privateReactivationRoute, /supabase\.auth\.getUser\(\)/)
  assert.match(privateReactivationRoute, /reactivateSelfDeletedPrivateProfile\(user\.id\)/)
  assert.match(registerRoute, /const selfDeleted = Boolean/)
  assert.match(registerRoute, /existingProfile\.national_id_hash === nationalIdHash/)
  assert.match(registerRoute, /existingProfile\.birth_date === birthDate/)
  assert.match(registerRoute, /retainedCompanyIdentifiers\.includes\(identifier\)/)
  assert.match(registerRoute, /existingProfile\.account_type === accountType/)
  assert.match(registerRoute, /removed_by_admin: false/)
  assert.match(registerRoute, /reactivated: true/)
  assert.match(registerRoute, /rollbackReactivation/)
  assert.match(adminUserRoute, /patch\.deleted_at = null/)
  assert.match(adminUserRoute, /patch\.removed_by_admin = false/)
})

test('profile lifecycle fields used by registration are part of the deployed schema contract', () => {
  for (const column of ['suspended', 'deleted_at', 'removed_by_admin']) {
    assert.match(profileLifecycleMigration, new RegExp(`add column if not exists ${column}`))
    assert.ok(registerRoute.includes(column), `${column} should be consumed by registration`)
  }
  assert.match(profileLifecycleBackfill, /\[account_deletion_request\]/)
  assert.match(profileLifecycleBackfill, /risk_status = 'restricted'/)
})

test('registration explains national identity format and keeps account labels at weight 600', () => {
  assert.match(registerForm, /ÅÅMMDD-XXXX eller YYYYMMDD-XXXX/)
  assert.match(registerForm, /placeholder:font-normal placeholder:text-\[#7b8494\]/)
  assert.match(registerForm, /<strong className="text-sm font-semibold">\{label\}<\/strong>/)
})

test('registration renders localized legal links for every public market', () => {
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(registerForm, new RegExp(`\\n  ${locale}: \\{ privatePrefix:`))
  }
  assert.match(registerForm, /href=\{termsHref\}/)
  assert.match(registerForm, /href=\{purchaseTermsHref\}/)
  assert.match(registerForm, /href=\{privacyHref\}/)
})

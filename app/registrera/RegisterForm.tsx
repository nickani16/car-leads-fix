'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, ReactNode, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  MailCheck,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { FlagIcon } from '../components/PublicFooter'

const euDialCodes: Record<string, string> = {
  AT: '+43',
  BE: '+32',
  BG: '+359',
  HR: '+385',
  CY: '+357',
  CZ: '+420',
  DE: '+49',
  DK: '+45',
  EE: '+372',
  ES: '+34',
  FI: '+358',
  FR: '+33',
  GR: '+30',
  HU: '+36',
  IE: '+353',
  IT: '+39',
  LT: '+370',
  LU: '+352',
  LV: '+371',
  MT: '+356',
  NL: '+31',
  PL: '+48',
  PT: '+351',
  RO: '+40',
  SE: '+46',
  SI: '+386',
  SK: '+421',
}

const dialCodeEntries = Object.entries(euDialCodes).sort(
  (a, b) => b[1].length - a[1].length,
)

function normalizeInitialCountryCode(value?: string) {
  const normalized = (value || '').toUpperCase()
  return euDialCodes[normalized] ? normalized : 'SE'
}

function detectCountryFromPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, '')
  return dialCodeEntries.find(([, dialCode]) => compact.startsWith(dialCode))?.[0]
}

function buildInitialPhone(countryCode: string) {
  return `${euDialCodes[countryCode] || '+46'} `
}

function normalizePhoneForSubmit(value: string, countryCode: string) {
  let compact = value.replace(/[\s()-]/g, '')
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`
  if (compact.startsWith('+')) return compact
  const dialCode = euDialCodes[countryCode] || ''
  return dialCode ? `${dialCode}${compact.replace(/^0+/, '')}` : compact
}

export default function RegisterForm({
  locale,
  email,
  initialCountryCode,
  initialAccountType = 'private',
}: {
  locale: PublicLocale
  email: string
  initialCountryCode?: string
  initialAccountType?: 'private' | 'business'
}) {
  const copy = getRegisterFormCopy(locale)
  const router = useRouter()
  const [accountType, setAccountType] = useState<'private' | 'business'>(initialAccountType)
  const [countryCode, setCountryCode] = useState(() =>
    normalizeInitialCountryCode(initialCountryCode),
  )
  const [phone, setPhone] = useState(() => buildInitialPhone(countryCode))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => ({ code, name: getEuCountryName(code, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale],
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const legalAccepted = form.get('legalAccepted') === 'on'
    const normalizedPhone = normalizePhoneForSubmit(phone, countryCode)
    const response = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountType,
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        birthDate: form.get('birthDate'),
        nationalId: form.get('nationalId'),
        phone: normalizedPhone,
        countryCode,
        addressLine1: form.get('addressLine1'),
        addressLine2: form.get('addressLine2'),
        postalCode: form.get('postalCode'),
        city: form.get('city'),
        region: form.get('region'),
        companyName: form.get('companyName'),
        registrationNumber: form.get('registrationNumber'),
        vatNumber: form.get('vatNumber'),
        websiteUrl: form.get('websiteUrl'),
        adult18: accountType === 'private' && legalAccepted,
        acceptedMarketplaceTerms: legalAccepted,
        acceptedPurchaseTerms: legalAccepted,
        acceptedPrivacyPolicy: legalAccepted,
        confirmedRightToSellOnly: accountType === 'private' && legalAccepted,
        confirmedBusinessRightToSell: accountType === 'business' && legalAccepted,
        locale,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error || copy.createError)
      setLoading(false)
      return
    }
    router.push(localizePublicHref(locale, '/account'))
    router.refresh()
  }

  return (
    <form
      onSubmit={submit}
      className="min-w-0 overflow-hidden rounded-[24px] border border-[#dce3f0] bg-white shadow-[0_28px_90px_rgba(16,24,40,.10)]"
    >
      <div className="border-b border-[#e5e9f0] bg-[#f8faff] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[#0866ff]">
          {copy.chooseAccountType}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['private', copy.privateAccount, copy.privateDescription, UserRound],
            ['business', copy.businessAccount, copy.businessDescription, Building2],
          ] as const).map(([value, label, description, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAccountType(value)}
              className={`min-w-0 flex min-h-28 flex-col items-start justify-center gap-2 rounded-[16px] border p-4 text-left transition ${
                accountType === value
                  ? 'border-[#0866ff] bg-white text-[#0866ff] shadow-[0_10px_28px_rgba(8,102,255,.10)]'
                  : 'border-[#dce2ed] bg-white text-[#344054] hover:border-[#aebbd0]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <strong className="text-sm">{label}</strong>
              <span className="text-xs font-normal leading-5 text-[#667085]">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-8">
        <FormSection
          icon={UserRound}
          title={accountType === 'private' ? copy.identity : copy.contactPerson}
        >
          <Field name="firstName" label={copy.firstName} autoComplete="given-name" required />
          <Field name="lastName" label={copy.lastName} autoComplete="family-name" required />
          <Field
            name="birthDate"
            label={copy.birthDate}
            type="date"
            helper={accountType === 'business' ? copy.birthDateBusinessHelper : undefined}
            required={accountType === 'private'}
          />
          {accountType === 'private' ? (
            <Field
              name="nationalId"
              label={copy.nationalId}
              autoComplete="off"
              helper={copy.nationalIdHelper}
              required
            />
          ) : (
            <>
              <Field name="companyName" label={copy.companyName} autoComplete="organization" required />
              <Field name="registrationNumber" label={copy.registrationNumber} required />
              <Field name="vatNumber" label={copy.vatNumber} helper={copy.vatHelper} />
              <Field name="websiteUrl" label={copy.websiteUrl} type="url" autoComplete="url" helper={copy.websiteHelper} />
            </>
          )}
        </FormSection>

        <FormSection icon={MapPin} title={copy.addressCountry}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{copy.country}</span>
            <select
              name="countryCode"
              value={countryCode}
              onChange={(event) => {
                const nextCountry = event.target.value
                const previousDialCode = euDialCodes[countryCode]
                const nextDialCode = euDialCodes[nextCountry]
                setCountryCode(nextCountry)
                setPhone((current) => {
                  const compact = current.trim()
                  if (!compact || compact === previousDialCode) return `${nextDialCode} `
                  if (compact.startsWith(previousDialCode)) {
                    return `${nextDialCode}${compact.slice(previousDialCode.length)}`
                  }
                  return current
                })
              }}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            >
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <Field name="addressLine1" label={copy.streetAddress} autoComplete="address-line1" required />
          <Field name="addressLine2" label={copy.addressLine2} autoComplete="address-line2" />
          <Field name="postalCode" label={copy.postalCode} autoComplete="postal-code" required />
          <Field name="city" label={copy.city} autoComplete="address-level2" required />
          <Field name="region" label={copy.region} autoComplete="address-level1" />
        </FormSection>

        <FormSection icon={MailCheck} title={copy.contact}>
          <div className="rounded-[14px] border border-[#cfe0ff] bg-[#f4f8ff] p-4 sm:col-span-2">
            <span className="block text-xs font-bold uppercase tracking-[.14em] text-[#0866ff]">
              {copy.verifiedEmail}
            </span>
            <strong className="mt-1 block break-all text-sm">{email}</strong>
          </div>
          <PhoneField
            label={copy.phone}
            helper={copy.phoneHelper}
            countryCode={countryCode}
            phone={phone}
            locale={locale}
            onCountryChange={(nextCountry) => {
              const previousDialCode = euDialCodes[countryCode]
              const nextDialCode = euDialCodes[nextCountry]
              setCountryCode(nextCountry)
              setPhone((current) => {
                const compact = current.trim()
                if (!compact || compact === previousDialCode) return `${nextDialCode} `
                if (compact.startsWith(previousDialCode)) {
                  return `${nextDialCode}${compact.slice(previousDialCode.length)}`
                }
                return `${nextDialCode} `
              })
            }}
            onPhoneChange={(nextPhone) => {
              setPhone(nextPhone)
              const detectedCountry = detectCountryFromPhone(nextPhone)
              if (detectedCountry && detectedCountry !== countryCode) {
                setCountryCode(detectedCountry)
              }
            }}
          />
        </FormSection>

        <div className="rounded-[16px] border border-[#cfe0ff] bg-[#f4f8ff] p-4 text-sm leading-6 text-[#475467]">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
            <p>{copy.safetyNotice}</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#d7deed] p-4">
          <Checkbox
            name="legalAccepted"
            label={
              <LegalConfirmationLabel
                locale={locale}
                text={
                  accountType === 'business'
                    ? copy.businessLegalConfirmation
                    : copy.privateLegalConfirmation
                }
              />
            }
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          disabled={loading}
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white transition hover:bg-[#0057e6] disabled:opacity-60"
        >
          <CheckCircle2 className="h-5 w-5" />
          {loading ? copy.loading : copy.createAccount}
        </button>
        <p className="text-center text-sm text-[#667085]">
          {copy.haveAccount}{' '}
          <Link href={localizePublicHref(locale, '/')} className="font-bold text-[#0866ff]">
            {copy.signIn}
          </Link>
        </p>
      </div>
    </form>
  )
}

function Checkbox({
  name,
  label,
}: {
  name: string
  label: ReactNode
}) {
  return (
    <label className="flex gap-3 text-sm leading-6 text-[#667085]">
      <input
        name={name}
        type="checkbox"
        required
        className="mt-1 h-4 w-4 accent-[#0866ff]"
      />
      <span>{label}</span>
    </label>
  )
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#eef4ff] text-[#0866ff]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-lg tracking-[-.02em]">{title}</h2>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  helper,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        {...inputProps}
        className="h-13 min-w-0 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span> : null}
    </label>
  )
}

function PhoneField({
  label,
  helper,
  countryCode,
  phone,
  locale,
  onCountryChange,
  onPhoneChange,
}: {
  label: string
  helper?: string
  countryCode: string
  phone: string
  locale: PublicLocale
  onCountryChange: (countryCode: string) => void
  onPhoneChange: (phone: string) => void
}) {
  const countries = euCountries
    .map(([code]) => ({ code, name: getEuCountryName(code, locale), dialCode: euDialCodes[code] }))
    .filter((country) => country.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name, locale))
  const activeDialCode = euDialCodes[countryCode] || '+46'

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="grid min-h-13 grid-cols-[132px_1fr] overflow-hidden rounded-[14px] border border-[#d7deed] bg-white transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
        <span className="relative flex min-w-0 items-center gap-2 border-r border-[#d7deed] bg-[#f8faff] px-3">
          <FlagIcon code={countryCode} size="sm" />
          <span className="text-sm font-bold text-[#101828]">{activeDialCode}</span>
          <ChevronDown className="ml-auto h-4 w-4 text-[#667085]" />
          <select
            aria-label={label}
            value={countryCode}
            onChange={(event) => onCountryChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {countries.map(({ code, name, dialCode }) => (
              <option key={code} value={code}>
                {name} {dialCode}
              </option>
            ))}
          </select>
        </span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder={`${activeDialCode} 70 123 45 67`}
          required
          className="h-13 min-w-0 w-full px-4 outline-none"
        />
      </div>
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span> : null}
    </label>
  )
}

function LegalConfirmationLabel({
  locale,
  text,
}: {
  locale: PublicLocale
  text: string
}) {
  const termsHref = localizePublicHref(locale, '/terms')
  const purchaseTermsHref = `${termsHref}#purchase-terms`
  const privacyHref = localizePublicHref(locale, '/privacy')
  const parts = text.split(/(Användarvillkoren|Köpvillkoren|Integritetspolicyn|Terms of Use|Purchase Terms|Privacy Policy|Nutzungsbedingungen|Kaufbedingungen|Datenschutzrichtlinie)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part === 'Användarvillkoren' || part === 'Terms of Use' || part === 'Nutzungsbedingungen') {
          return (
            <Link key={`${part}-${index}`} href={termsHref} className="font-bold text-[#0866ff]">
              {part}
            </Link>
          )
        }
        if (part === 'Köpvillkoren' || part === 'Purchase Terms' || part === 'Kaufbedingungen') {
          return (
            <Link key={`${part}-${index}`} href={purchaseTermsHref} className="font-bold text-[#0866ff]">
              {part}
            </Link>
          )
        }
        if (part === 'Integritetspolicyn' || part === 'Privacy Policy' || part === 'Datenschutzrichtlinie') {
          return (
            <Link key={`${part}-${index}`} href={privacyHref} className="font-bold text-[#0866ff]">
              {part}
            </Link>
          )
        }
        return part
      })}
    </>
  )
}

function getRegisterFormCopy(locale: PublicLocale) {
  const en = {
    chooseAccountType: 'Choose account type',
    privateAccount: 'Private account',
    businessAccount: 'Business account',
    privateDescription: 'For buying and selling in your own name',
    businessDescription: 'For inventory, trade and company listings',
    identity: 'Your identity',
    contactPerson: 'Contact person',
    firstName: 'First name',
    lastName: 'Last name',
    birthDate: 'Date of birth',
    birthDateBusinessHelper: 'Optional for business accounts.',
    nationalId: 'National identity number',
    nationalIdHelper:
      'Checked against the country format. The number is never shown publicly.',
    companyName: 'Company name',
    registrationNumber: 'Registration number',
    vatNumber: 'VAT number',
    vatHelper: 'Checked against EU VIES when provided. The account can still be created if the check needs review.',
    websiteUrl: 'Website',
    websiteHelper: 'Optional but recommended. We compare it with the email domain as a trust signal.',
    addressCountry: 'Address and country',
    country: 'Country',
    streetAddress: 'Street address',
    addressLine2: 'Apartment, floor or c/o',
    postalCode: 'Postal code',
    city: 'City',
    region: 'Region or state',
    contact: 'Contact',
    verifiedEmail: 'Verified email address',
    phone: 'Phone number',
    phoneHelper: 'Use international format with country code.',
    safetyNotice:
      'Autorell performs automatic format, duplicate and risk checks. If something looks unusual, the account or listing may need manual verification before publication.',
    adult18: 'I am at least 18 years old',
    privateLegalConfirmation:
      'I confirm that I am at least 18 years old, have the right to sell the objects I publish and have read and accept the Terms of Use, Purchase Terms and Privacy Policy.',
    businessLegalConfirmation:
      'I confirm that the company has the right to sell the object and that I have read and accept the Terms of Use, Purchase Terms and Privacy Policy.',
    createAccount: 'Create account',
    loading: 'Checking details...',
    createError: 'The account could not be created. Check the details.',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  }

  if (locale === 'sv') {
    return {
      ...en,
      chooseAccountType: 'Välj kontotyp',
      privateAccount: 'Privatkonto',
      businessAccount: 'Företagskonto',
      privateDescription: 'För köp och försäljning i eget namn',
      businessDescription: 'För lager, handel och företagsannonser',
      identity: 'Din identitet',
      contactPerson: 'Kontaktperson',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      birthDate: 'Födelsedatum',
      birthDateBusinessHelper: 'Valfritt för företagskonto.',
      nationalId: 'Nationellt identitetsnummer',
      nationalIdHelper:
        'Kontrolleras mot landets format. Numret visas aldrig publikt.',
      companyName: 'Företagsnamn',
      registrationNumber: 'Organisationsnummer',
      vatNumber: 'VAT-nummer',
      vatHelper: 'Kontrolleras mot EU VIES när det anges. Kontot kan fortfarande skapas om kontrollen behöver granskas.',
      websiteUrl: 'Webbplats',
      websiteHelper: 'Frivilligt men rekommenderat. Vi jämför den med e-postdomänen som förtroendesignal.',
      addressCountry: 'Adress och land',
      country: 'Land',
      streetAddress: 'Gatuadress',
      addressLine2: 'Lägenhet, våning eller c/o',
      postalCode: 'Postnummer',
      city: 'Ort',
      region: 'Region eller delstat',
      contact: 'Kontakt',
      verifiedEmail: 'Verifierad mejladress',
      phone: 'Telefonnummer',
      phoneHelper: 'Ange internationellt format med landskod.',
      safetyNotice:
        'Autorell gör automatiska format-, dubblett- och riskkontroller. Vid avvikelse kan kontot eller en annons behöva manuell verifiering innan publicering.',
      adult18: 'Jag är minst 18 år',
      privateLegalConfirmation:
        'Jag bekräftar att jag är minst 18 år, har rätt att sälja de objekt jag publicerar och att jag har läst och godkänner Användarvillkoren, Köpvillkoren och Integritetspolicyn.',
      businessLegalConfirmation:
        'Jag bekräftar att jag har rätt att sälja objektet och att jag har läst och godkänner Användarvillkoren, Köpvillkoren samt Integritetspolicyn.',
      createAccount: 'Skapa konto',
      loading: 'Kontrollerar uppgifter...',
      createError: 'Kontot kunde inte skapas. Kontrollera uppgifterna.',
      haveAccount: 'Har du redan ett konto?',
      signIn: 'Logga in',
    }
  }

  if (locale === 'de') {
    return {
      ...en,
      chooseAccountType: 'Kontotyp wählen',
      privateAccount: 'Privatkonto',
      businessAccount: 'Unternehmenskonto',
      privateDescription: 'Für Kauf und Verkauf im eigenen Namen',
      businessDescription: 'Für Bestand, Handel und Unternehmensanzeigen',
      identity: 'Ihre Identität',
      contactPerson: 'Kontaktperson',
      firstName: 'Vorname',
      lastName: 'Nachname',
      birthDate: 'Geburtsdatum',
      birthDateBusinessHelper: 'Optional für Unternehmenskonten.',
      nationalId: 'Nationale Identifikationsnummer',
      nationalIdHelper:
        'Wird gegen das Länderformat geprüft. Die Nummer wird nie öffentlich angezeigt.',
      companyName: 'Firmenname',
      registrationNumber: 'Handelsregisternummer',
      vatNumber: 'USt-IdNr.',
      vatHelper: 'Wird gegen EU VIES geprüft, wenn sie angegeben wird. Das Konto kann trotzdem erstellt werden, wenn die Prüfung überprüft werden muss.',
      websiteUrl: 'Website',
      websiteHelper: 'Optional, aber empfohlen. Wir vergleichen sie als Vertrauenssignal mit der E-Mail-Domain.',
      addressCountry: 'Adresse und Land',
      country: 'Land',
      streetAddress: 'Straße und Hausnummer',
      addressLine2: 'Wohnung, Etage oder c/o',
      postalCode: 'Postleitzahl',
      city: 'Stadt',
      region: 'Region oder Bundesland',
      contact: 'Kontakt',
      verifiedEmail: 'Verifizierte E-Mail-Adresse',
      phone: 'Telefonnummer',
      phoneHelper: 'Internationales Format mit Ländervorwahl verwenden.',
      safetyNotice:
        'Autorell führt automatische Format-, Dubletten- und Risikoprüfungen durch. Bei Auffälligkeiten kann das Konto oder eine Anzeige vor der Veröffentlichung manuell geprüft werden.',
      adult18: 'Ich bin mindestens 18 Jahre alt',
      privateLegalConfirmation:
        'Ich bestätige, dass ich mindestens 18 Jahre alt bin, zum Verkauf der veröffentlichten Objekte berechtigt bin und die Nutzungsbedingungen, Kaufbedingungen und Datenschutzrichtlinie gelesen und akzeptiert habe.',
      businessLegalConfirmation:
        'Ich bestätige, dass das Unternehmen zum Verkauf des Objekts berechtigt ist und dass ich die Nutzungsbedingungen, Kaufbedingungen und Datenschutzrichtlinie gelesen und akzeptiert habe.',
      createAccount: 'Konto erstellen',
      loading: 'Angaben werden geprüft...',
      createError: 'Das Konto konnte nicht erstellt werden. Prüfen Sie die Angaben.',
      haveAccount: 'Sie haben bereits ein Konto?',
      signIn: 'Anmelden',
    }
  }

  return translatePublicObject(locale, en)
}

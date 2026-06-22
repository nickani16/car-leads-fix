'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import { getAccountCopy } from '@/lib/account-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

export default function RegisterForm({ locale }: { locale: PublicLocale }) {
  const copy = getAccountCopy(locale)
  const router = useRouter()
  const [accountType, setAccountType] = useState<'private' | 'business'>('private')
  const [countryCode, setCountryCode] = useState('SE')
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
    const response = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountType,
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        birthDate: form.get('birthDate'),
        nationalId: form.get('nationalId'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        countryCode,
        addressLine1: form.get('addressLine1'),
        addressLine2: form.get('addressLine2'),
        postalCode: form.get('postalCode'),
        city: form.get('city'),
        region: form.get('region'),
        companyName: form.get('companyName'),
        registrationNumber: form.get('registrationNumber'),
        vatNumber: form.get('vatNumber'),
        acceptedTerms: form.get('acceptedTerms') === 'on',
        locale,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error || 'Kontot kunde inte skapas. Kontrollera uppgifterna.')
      setLoading(false)
      return
    }
    router.push('/login?status=account-created&next=/konto')
  }

  return (
    <form
      onSubmit={submit}
      className="min-w-0 overflow-hidden rounded-[22px] border border-[#dce3f0] bg-white shadow-[0_28px_90px_rgba(16,24,40,.10)]"
    >
      <div className="border-b border-[#e5e9f0] bg-[#f8faff] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[#0866ff]">
          Välj kontotyp
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['private', copy.privateAccount, 'För köp och försäljning i eget namn', UserRound],
            ['business', copy.businessAccount, 'För lager, handel och företagsannonser', Building2],
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
        <FormSection icon={UserRound} title={accountType === 'private' ? 'Din identitet' : 'Kontaktperson'}>
          <Field name="firstName" label="Förnamn" autoComplete="given-name" required />
          <Field name="lastName" label="Efternamn" autoComplete="family-name" required />
          <Field name="birthDate" label="Födelsedatum" type="date" required />
          {accountType === 'private' ? (
            <Field
              name="nationalId"
              label="Nationellt identitetsnummer"
              autoComplete="off"
              helper="Kontrolleras mot landets format. Numret visas aldrig publikt och råvärdet sparas inte."
              required
            />
          ) : (
            <>
              <Field name="companyName" label="Företagsnamn" autoComplete="organization" required />
              <Field name="registrationNumber" label="Registreringsnummer" required />
              <Field
                name="vatNumber"
                label="VAT-nummer"
                helper="Kontrolleras automatiskt mot EU VIES när ett VAT-nummer anges."
              />
            </>
          )}
        </FormSection>

        <FormSection icon={MapPin} title="Adress och land">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Land</span>
            <select
              name="countryCode"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            >
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
          <Field name="addressLine1" label="Gatuadress" autoComplete="address-line1" required />
          <Field name="addressLine2" label="Lägenhet, våning eller c/o" autoComplete="address-line2" />
          <Field name="postalCode" label="Postnummer" autoComplete="postal-code" required />
          <Field name="city" label="Ort" autoComplete="address-level2" required />
          <Field name="region" label="Region eller delstat" autoComplete="address-level1" />
        </FormSection>

        <FormSection icon={LockKeyhole} title="Kontakt och inloggning">
          <Field name="email" label={copy.email} type="email" autoComplete="email" required />
          <Field
            name="phone"
            label={copy.phone}
            type="tel"
            autoComplete="tel"
            placeholder="+46 70 123 45 67"
            helper="Ange internationellt format med landskod."
            required
          />
          <Field
            name="password"
            label={copy.password}
            type="password"
            autoComplete="new-password"
            minLength={10}
            helper="Minst 10 tecken."
            required
          />
        </FormSection>

        <div className="rounded-[16px] border border-[#cfe0ff] bg-[#f4f8ff] p-4 text-sm leading-6 text-[#475467]">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
            <p>
              Autorell gör automatiska format-, dubblett- och riskkontroller. Vid avvikelse
              kan kontot eller en annons behöva manuell verifiering innan publicering.
            </p>
          </div>
        </div>

        <label className="flex gap-3 text-sm leading-6 text-[#667085]">
          <input name="acceptedTerms" type="checkbox" required className="mt-1 h-4 w-4 accent-[#0866ff]" />
          <span>
            {copy.acceptPrefix}{' '}
            <Link href="/villkor" className="font-bold text-[#0866ff]">{copy.marketplaceTerms}</Link>
            {' '}{copy.acceptJoin}{' '}
            <Link href="/integritet" className="font-bold text-[#0866ff]">{copy.privacyNotice}</Link>.
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white transition hover:bg-[#0057e6] disabled:opacity-60"
        >
          <CheckCircle2 className="h-5 w-5" />
          {loading ? 'Kontrollerar uppgifter…' : copy.createAccount}
        </button>
        <p className="text-center text-sm text-[#667085]">
          {copy.haveAccount}{' '}
          <Link href="/login" className="font-bold text-[#0866ff]">{copy.signIn}</Link>
        </p>
      </div>
    </form>
  )
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound
  title: string
  children: React.ReactNode
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
      {helper && <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span>}
    </label>
  )
}

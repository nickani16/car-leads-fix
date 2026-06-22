'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Building2, UserRound } from 'lucide-react'
import { getAccountCopy } from '@/lib/account-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

export default function RegisterForm({ locale }: { locale: PublicLocale }) {
  const copy = getAccountCopy(locale)
  const router = useRouter()
  const [accountType, setAccountType] = useState<'private' | 'business'>('private')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        displayName: form.get('displayName'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        countryCode: form.get('countryCode'),
        companyName: form.get('companyName'),
        registrationNumber: form.get('registrationNumber'),
        acceptedTerms: form.get('acceptedTerms') === 'on',
        locale,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error || 'Registration failed.')
      setLoading(false)
      return
    }
    router.push('/login?status=account-created&next=/konto')
  }

  return (
    <form onSubmit={submit} className="rounded-[26px] border border-[#dde3ef] bg-white p-6 shadow-[0_22px_65px_rgba(16,24,40,.08)] sm:p-9">
      <div className="grid grid-cols-2 gap-3">
        {([
          ['private', copy.privateAccount, UserRound],
          ['business', copy.businessAccount, Building2],
        ] as const).map(([value, label, Icon]) => (
          <button key={value} type="button" onClick={() => setAccountType(value)} className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-[16px] border text-sm font-bold ${accountType === value ? 'border-[#0866ff] bg-[#eef4ff] text-[#0866ff]' : 'border-[#dfe3e8]'}`}>
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field name="displayName" label={copy.name} required />
        <Field name="phone" label={copy.phone} type="tel" required />
        <Field name="email" label={copy.email} type="email" required />
        <Field name="password" label={copy.password} type="password" minLength={10} required />
        <Field name="countryCode" label={`${copy.country} (SE, DE, FR…)`} maxLength={2} required />
        {accountType === 'business' && (
          <>
            <Field name="companyName" label={copy.company} required />
            <Field name="registrationNumber" label={copy.registrationNumber} required />
          </>
        )}
      </div>
      <label className="mt-5 flex gap-3 text-sm leading-6 text-[#667085]">
        <input name="acceptedTerms" type="checkbox" required className="mt-1 h-4 w-4" />
        <span>I accept the <Link href="/villkor" className="font-bold text-[#0866ff]">marketplace terms</Link> and <Link href="/integritet" className="font-bold text-[#0866ff]">privacy notice</Link>.</span>
      </label>
      {error && <p role="alert" className="mt-4 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="mt-6 min-h-13 w-full rounded-[15px] bg-[#0866ff] px-6 font-bold text-white disabled:opacity-60">
        {loading ? '…' : copy.createAccount}
      </button>
      <p className="mt-5 text-center text-sm text-[#667085]">
        {copy.haveAccount} <Link href="/login" className="font-bold text-[#0866ff]">{copy.signIn}</Link>
      </p>
    </form>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input {...inputProps} className="h-12 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff]" />
    </label>
  )
}

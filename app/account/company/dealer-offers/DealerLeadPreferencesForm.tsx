'use client'

import { useState } from 'react'
import { BellRing, Check, Mail } from 'lucide-react'
import type { DealerLeadCountryCode } from '@/lib/dealer-leads/access'
import type { DealerOffersCopy } from '@/lib/dealer-leads/i18n'

type Mode = 'home' | 'selected' | 'all'

export default function DealerLeadPreferencesForm({
  copy,
  homeCountry,
  countries,
  initial,
}: {
  copy: DealerOffersCopy
  homeCountry: DealerLeadCountryCode | null
  countries: Array<{ code: DealerLeadCountryCode; name: string }>
  initial: {
    emailEnabled: boolean
    notificationEmail: string
    allCountries: boolean
    countryCodes: DealerLeadCountryCode[]
  }
}) {
  const initialMode: Mode = initial.allCountries
    ? 'all'
    : initial.countryCodes.length === 1 && initial.countryCodes[0] === homeCountry
      ? 'home'
      : 'selected'
  const [mode, setMode] = useState<Mode>(initialMode)
  const [emailEnabled, setEmailEnabled] = useState(initial.emailEnabled)
  const [notificationEmail, setNotificationEmail] = useState(initial.notificationEmail)
  const [selectedCountries, setSelectedCountries] = useState<DealerLeadCountryCode[]>(initial.countryCodes)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function toggleCountry(code: DealerLeadCountryCode) {
    setSelectedCountries((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code])
    setState('idle')
  }

  async function save() {
    if (mode === 'selected' && !selectedCountries.length) {
      setState('error')
      return
    }
    setState('saving')
    try {
      const response = await fetch('/api/account/company/dealer-lead-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailEnabled,
          notificationEmail,
          mode,
          countryCodes: mode === 'selected' ? selectedCountries : mode === 'home' && homeCountry ? [homeCountry] : [],
        }),
      })
      if (!response.ok) throw new Error('SAVE_FAILED')
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="rounded-[18px] border border-[#cfe0ff] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#eef5ff] text-[#0866ff]"><BellRing className="h-5 w-5" /></span>
        <div>
          <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.notificationsTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#667085]">{copy.notificationsText}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <label className="flex min-h-11 items-center gap-3 rounded-[12px] border border-[#d9e2ef] px-4 text-sm font-semibold text-[#344054]">
            <input type="checkbox" className="h-4 w-4 rounded border-[#98a2b3] accent-[#0866ff]" checked={emailEnabled} onChange={(event) => { setEmailEnabled(event.target.checked); setState('idle') }} />
            <Mail className="h-4 w-4 text-[#0866ff]" />
            {copy.emailEnabled}
          </label>
          <label className="text-xs font-bold text-[#344054]">
            {copy.emailLabel}
            <input type="email" value={notificationEmail} onChange={(event) => { setNotificationEmail(event.target.value); setState('idle') }} placeholder={copy.emailPlaceholder} className="mt-1 h-11 w-full rounded-[12px] border border-[#b9c3d1] px-3 text-sm font-normal text-[#101828] outline-none placeholder:font-normal placeholder:text-[#7a8699] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10" />
          </label>
        </div>

        <div>
          <p className="text-xs font-bold text-[#344054]">{copy.scopeLabel}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {([
              ['home', copy.scopeHome],
              ['selected', copy.scopeSelected],
              ['all', copy.scopeAll],
            ] as Array<[Mode, string]>).map(([value, label]) => (
              <button key={value} type="button" onClick={() => { setMode(value); setState('idle') }} className={`min-h-11 rounded-[12px] border px-3 text-sm font-semibold transition ${mode === value ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]' : 'border-[#d9e2ef] bg-white text-[#475467] hover:border-[#9dbdf8]'}`}>
                {label}
              </button>
            ))}
          </div>

          {mode === 'selected' ? (
            <div className="mt-4">
              <p className="text-xs font-bold text-[#344054]">{copy.countriesLabel}</p>
              <div className="mt-2 grid max-h-48 gap-2 overflow-y-auto rounded-[14px] border border-[#d9e2ef] bg-[#f8fbff] p-3 sm:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => (
                  <label key={country.code} className="flex min-h-9 items-center gap-2 rounded-[10px] bg-white px-3 text-sm font-medium text-[#344054]">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#98a2b3] accent-[#0866ff]" checked={selectedCountries.includes(country.code)} onChange={() => toggleCountry(country.code)} />
                    {country.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" disabled={state === 'saving'} onClick={save} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0866ff] px-6 text-sm font-bold text-white disabled:bg-[#98a2b3]">
          {state === 'saving' ? copy.saving : copy.save}
        </button>
        {state === 'saved' ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#067647]"><Check className="h-4 w-4" />{copy.saved}</span> : null}
        {state === 'error' ? <span className="text-sm font-semibold text-[#b42318]">{copy.saveError}</span> : null}
      </div>
    </section>
  )
}

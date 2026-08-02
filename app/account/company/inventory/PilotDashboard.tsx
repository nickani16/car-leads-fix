'use client'

import { useState } from 'react'
import { CalendarDays, Handshake, LoaderCircle, UserRound } from 'lucide-react'
import type { PilotDashboardCopy } from '@/lib/pilot-dashboard-i18n'
import type { PilotPeriodResult } from '@/lib/business-pilot-dashboard'

export default function PilotDashboard({ copy, pilot, periods, commercialRequested }: {
  copy: PilotDashboardCopy
  pilot: { status: string; startDate: string; endDate: string; daysRemaining: number; contactName: string }
  periods: PilotPeriodResult[]
  commercialRequested: boolean
}) {
  const [selectedDays, setSelectedDays] = useState<7 | 30 | 90>(30)
  const [requestState, setRequestState] = useState<'idle' | 'busy' | 'sent' | 'error'>(commercialRequested ? 'sent' : 'idle')
  const selected = periods.find((period) => period.days === selectedDays) || periods[0]
  const metricValues = [selected?.views || 0, selected?.visits || 0, selected?.websiteClicks || 0, selected?.phoneClicks || 0, selected?.enquiries || 0, selected?.publishedVehicles || 0]
  const statusLabel = pilot.status === 'pilot_completed' ? copy.completed : pilot.status === 'pilot_paused' ? copy.paused : copy.active

  async function requestCommercialDiscussion() {
    setRequestState('busy')
    const response = await fetch('/api/account/company/pilot-commercial-request', { method: 'POST' })
    setRequestState(response.ok ? 'sent' : 'error')
  }

  return (
    <section className="mb-7 border-y border-[#d9e2ef] bg-white py-6" aria-labelledby="pilot-dashboard-title">
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#0866ff]">Autorell Pilot</p><h2 id="pilot-dashboard-title" className="mt-2 text-2xl font-semibold text-[#101828]">{copy.title}</h2></div>
        <span className="inline-flex w-max rounded-full border border-[#b7dfc6] bg-[#f0fbf4] px-3 py-1 text-xs font-semibold text-[#16794a]">{statusLabel}</span>
      </div>

      <dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-[#d9e2ef] bg-[#d9e2ef] sm:grid-cols-2 xl:grid-cols-5">
        {[[copy.startDate, pilot.startDate], [copy.endDate, pilot.endDate], [copy.daysRemaining, pilot.daysRemaining], [copy.noAutomaticPayment, '✓'], [copy.contact, pilot.contactName]].map(([label, value], index) => <div key={String(label)} className="min-w-0 bg-[#f8fafc] p-4"><dt className="flex items-center gap-2 text-xs font-semibold text-[#667085]">{index === 4 ? <UserRound className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}{label}</dt><dd className="mt-2 break-words text-sm font-semibold text-[#101828]">{String(value)}</dd></div>)}
      </dl>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-[#101828]">{copy.resultsTitle}</h3>
        <div className="inline-grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#cfd8e6]" aria-label={copy.resultsTitle}>
          {([7, 30, 90] as const).map((days, index) => <button key={days} type="button" aria-pressed={selectedDays === days} onClick={() => setSelectedDays(days)} className={`min-h-10 px-4 text-xs font-semibold ${selectedDays === days ? 'bg-[#0866ff] text-white' : 'bg-white text-[#475467] hover:bg-[#f8fafc]'}`}>{copy.periods[index]}</button>)}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {copy.metrics.map((label, index) => <article key={label} className="min-h-[100px] rounded-[8px] border border-[#d9e2ef] bg-[#f8fafc] p-4"><p className="text-xs font-semibold text-[#667085]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#101828]">{metricValues[index].toLocaleString()}</p></article>)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="border-t border-[#d9e2ef] pt-4"><h4 className="font-semibold text-[#101828]">{copy.topVehicles}</h4>{selected?.topListings.length ? <ol className="mt-3 grid gap-2">{selected.topListings.map((listing, index) => <li key={listing.id} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate text-[#344054]">{index + 1}. {listing.title}</span><strong>{listing.views.toLocaleString()}</strong></li>)}</ol> : <p className="mt-3 text-sm text-[#667085]">{copy.noData}</p>}</div>
        <div className="border-t border-[#d9e2ef] pt-4"><h4 className="font-semibold text-[#101828]">{copy.trafficByCountry}</h4>{selected?.countries.length ? <ul className="mt-3 grid gap-2">{selected.countries.map((country) => <li key={country.code} className="flex items-center justify-between text-sm text-[#344054]"><span>{country.code}</span><strong>{country.views.toLocaleString()}</strong></li>)}</ul> : <p className="mt-3 text-sm text-[#667085]">{copy.noData}</p>}</div>
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-[#d9e2ef] pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl"><h3 className="text-lg font-semibold text-[#101828]">{copy.commercialTitle}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{copy.commercialBody}</p></div>
        <button type="button" disabled={requestState === 'busy' || requestState === 'sent'} onClick={() => void requestCommercialDiscussion()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white disabled:bg-[#98a2b3]">{requestState === 'busy' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Handshake className="h-4 w-4" />}{requestState === 'sent' ? copy.commercialSent : copy.commercialButton}</button>
      </div>
      {requestState === 'error' ? <p role="alert" className="mt-3 text-sm font-semibold text-[#b42318]">{copy.commercialError}</p> : null}
    </section>
  )
}

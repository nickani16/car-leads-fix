'use client'

import Link from 'next/link'
import { Bell, BellOff, Bookmark, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { SAVED_SEARCHES_EVENT } from '@/lib/saved-searches'

type NotificationFrequency = 'off' | 'daily' | 'instant'

type SavedSearch = {
  id: string
  name: string
  href: string
  filters: Record<string, unknown>
  notification_frequency?: NotificationFrequency
  market_code?: string | null
  updated_at: string
}

export default function SavedSearchesClient({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const copy = savedSearchesClientCopy(locale)
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)
  const [busyId, setBusyId] = useState('')

  const loadSavedSearches = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/saved-searches', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (response.status === 401) {
        setAuthenticated(false)
        setSearches([])
        return
      }
      if (!response.ok) throw new Error('Could not load saved searches')
      const payload = (await response.json()) as { searches?: SavedSearch[] }
      setAuthenticated(true)
      setSearches(payload.searches || [])
    } catch {
      setSearches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSavedSearches()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadSavedSearches])

  async function deleteSearch(id: string) {
    setBusyId(id)
    try {
      const response = await fetch(`/api/saved-searches?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Could not delete saved search')
      setSearches((current) => current.filter((search) => search.id !== id))
      window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_EVENT))
    } catch {
      await loadSavedSearches()
    } finally {
      setBusyId('')
    }
  }

  async function updateFrequency(id: string, notificationFrequency: NotificationFrequency) {
    setBusyId(id)
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notificationFrequency }),
      })
      if (!response.ok) throw new Error('Could not update saved search')
      const payload = (await response.json()) as { search?: SavedSearch }
      if (payload.search) {
        setSearches((current) => current.map((search) => search.id === id ? payload.search! : search))
      }
      window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_EVENT))
    } catch {
      await loadSavedSearches()
    } finally {
      setBusyId('')
    }
  }

  if (loading) {
    return (
      <section className="bg-[#f7f8fb] py-10 sm:py-14">
        <div className="mx-auto grid max-w-[980px] gap-3 px-5 sm:px-8">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[16px] border border-[#e1e7f0] bg-white" />
          ))}
        </div>
      </section>
    )
  }

  if (!authenticated) {
    return (
      <EmptyState
        title={copy.signInTitle}
        text={copy.signInText}
        cta={copy.searchVehicles}
        locale={locale}
      />
    )
  }

  if (!searches.length) {
    return (
      <EmptyState
        title={copy.emptyTitle}
        text={copy.emptyText}
        cta={copy.searchVehicles}
        locale={locale}
      />
    )
  }

  return (
    <section className="bg-[#f7f8fb] py-10 sm:py-14">
      <div className="mx-auto grid max-w-[980px] gap-3 px-5 sm:px-8">
        {searches.map((search) => {
          const frequency = search.notification_frequency || 'off'
          const notificationsOn = frequency !== 'off'
          return (
            <article key={search.id} className="rounded-[16px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,.04)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0866ff]">
                    <Bookmark className="h-4 w-4" />
                    {copy.savedSearch}
                  </div>
                  <h2 className="mt-2 line-clamp-1 text-xl font-semibold tracking-[-0.035em] text-[#101828]">{search.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                    <span>{copy.updated} {new Date(search.updated_at).toLocaleDateString(locale)}</span>
                    {search.market_code ? <span className="rounded-full bg-[#eef5ff] px-2.5 py-1 font-semibold uppercase text-[#0866ff]">{search.market_code}</span> : null}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${notificationsOn ? 'bg-[#eef5ff] text-[#0866ff]' : 'bg-[#f2f4f7] text-[#667085]'}`}>
                      {notificationsOn ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                      {frequencyLabel(frequency, copy)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_auto] sm:items-end lg:min-w-[430px]">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[.12em] text-[#667085]" htmlFor={`frequency-${search.id}`}>
                      {copy.notifications}
                    </label>
                    <select
                      id={`frequency-${search.id}`}
                      value={frequency}
                      disabled={busyId === search.id}
                      onChange={(event) => void updateFrequency(search.id, event.target.value as NotificationFrequency)}
                      className="mt-1 min-h-11 w-full rounded-[10px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/15 disabled:opacity-60"
                    >
                      <option value="off">{copy.frequencyOff}</option>
                      <option value="daily">{copy.frequencyDaily}</option>
                      <option value="instant">{copy.frequencyInstant}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={localizePublicHref(locale, search.href)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0757da]"
                    >
                      <Search className="h-4 w-4" />
                      {copy.open}
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === search.id}
                      onClick={() => deleteSearch(search.id)}
                      className="grid h-11 w-11 place-items-center rounded-[10px] border border-[#d0d5dd] bg-white text-[#101828] transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
                      aria-label={copy.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function EmptyState({
  title,
  text,
  cta,
  locale,
}: {
  title: string
  text: string
  cta: string
  locale: PublicLocale
}) {
  return (
    <section className="bg-[#f7f8fb] py-10 sm:py-14">
      <div className="mx-auto max-w-[980px] px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)]">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
            <Bookmark className="h-6 w-6" />
          </span>
          <h2 className="mt-6 text-2xl tracking-[-0.035em]">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">{text}</p>
          <Link
            href={localizePublicHref(locale, '/marketplace')}
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white"
          >
            <Search className="h-5 w-5" />
            {cta}
          </Link>
        </div>
      </div>
    </section>
  )
}

function frequencyLabel(frequency: NotificationFrequency, copy: ReturnType<typeof savedSearchesClientCopy>) {
  if (frequency === 'instant') return copy.frequencyInstant
  if (frequency === 'daily') return copy.frequencyDaily
  return copy.frequencyOff
}

function savedSearchesClientCopy(locale: PublicLocale) {
  const en = {
    savedSearch: 'Saved search',
    updated: 'Updated',
    open: 'Open',
    delete: 'Delete saved search',
    notifications: 'Notifications',
    frequencyOff: 'Off',
    frequencyDaily: 'Daily summary',
    frequencyInstant: 'Instant',
    searchVehicles: 'Search vehicles',
    signInTitle: 'Sign in for saved searches.',
    signInText: 'Saved searches are connected to your account so you can return to the same filters later.',
    emptyTitle: 'You have no saved searches yet.',
    emptyText: 'Filter vehicles by category, market, price, fuel, equipment and more. Then save the search from the search page.',
  }
  if (locale === 'sv') {
    return {
      savedSearch: 'Sparad sökning',
      updated: 'Uppdaterad',
      open: 'Öppna',
      delete: 'Ta bort sparad sökning',
      notifications: 'Notiser',
      frequencyOff: 'Av',
      frequencyDaily: 'Daglig sammanfattning',
      frequencyInstant: 'Direkt',
      searchVehicles: 'Sök fordon',
      signInTitle: 'Logga in för sparade sökningar.',
      signInText: 'Sparade sökningar är kopplade till ditt konto så att du kan återvända till samma filter senare.',
      emptyTitle: 'Du har inga sparade sökningar ännu.',
      emptyText: 'Filtrera fordon efter kategori, marknad, pris, drivmedel och utrustning. Spara sedan sökningen från söksidan.',
    }
  }
  if (locale === 'de') {
    return {
      savedSearch: 'Gespeicherte Suche',
      updated: 'Aktualisiert',
      open: 'Öffnen',
      delete: 'Gespeicherte Suche löschen',
      notifications: 'Benachrichtigungen',
      frequencyOff: 'Aus',
      frequencyDaily: 'Tägliche Zusammenfassung',
      frequencyInstant: 'Sofort',
      searchVehicles: 'Fahrzeuge suchen',
      signInTitle: 'Melden Sie sich für gespeicherte Suchen an.',
      signInText: 'Gespeicherte Suchen sind mit Ihrem Konto verbunden, damit Sie später zu denselben Filtern zurückkehren können.',
      emptyTitle: 'Sie haben noch keine gespeicherten Suchen.',
      emptyText: 'Filtern Sie Fahrzeuge nach Kategorie, Markt, Preis, Kraftstoff, Ausstattung und mehr. Speichern Sie die Suche anschließend auf der Suchseite.',
    }
  }
  return translatePublicObject(locale, en)
}

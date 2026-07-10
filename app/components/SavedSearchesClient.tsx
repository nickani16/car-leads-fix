'use client'

import Link from 'next/link'
import { Bookmark, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type SavedSearch = {
  id: string
  name: string
  href: string
  filters: Record<string, unknown>
  updated_at: string
}

export default function SavedSearchesClient({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
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
        title="Logga in för sparade sökningar."
        text="Sparade sökningar är kopplade till ditt konto så att du kan återvända till samma filter senare."
        locale={locale}
      />
    )
  }

  if (!searches.length) {
    return (
      <EmptyState
        title="Du har inga sparade sökningar ännu."
        text="Filtrera fordon efter kategori, marknad, pris, drivmedel och utrustning. Spara sedan sökningen från söksidan."
        locale={locale}
      />
    )
  }

  return (
    <section className="bg-[#f7f8fb] py-10 sm:py-14">
      <div className="mx-auto grid max-w-[980px] gap-3 px-5 sm:px-8">
        {searches.map((search) => (
          <article key={search.id} className="rounded-[16px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0866ff]">
                  <Bookmark className="h-4 w-4" />
                  Sparad sökning
                </div>
                <h2 className="mt-2 line-clamp-1 text-xl font-semibold tracking-[-0.035em] text-[#101828]">{search.name}</h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Uppdaterad {new Date(search.updated_at).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={localizePublicHref(locale, search.href)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0757da]"
                >
                  <Search className="h-4 w-4" />
                  Öppna
                </Link>
                <button
                  type="button"
                  disabled={busyId === search.id}
                  onClick={() => deleteSearch(search.id)}
                  className="grid h-11 w-11 place-items-center rounded-[10px] border border-[#d0d5dd] bg-white text-[#101828] transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
                  aria-label="Ta bort sparad sökning"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function EmptyState({
  title,
  text,
  locale,
}: {
  title: string
  text: string
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
            Sök fordon
          </Link>
        </div>
      </div>
    </section>
  )
}

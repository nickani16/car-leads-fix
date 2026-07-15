'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const fieldClass = 'h-11 rounded-[10px] border border-[#d7deea] bg-white px-3 text-sm outline-none focus:border-[#0866ff]'

export default function AdminDraftForm({ mode }: { mode: 'content' | 'newsletter' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mediaAssets, setMediaAssets] = useState<{ id: string; altText: string; url: string }[]>([])

  useEffect(() => {
    if (!open || mode !== 'content' || mediaAssets.length) return
    const controller = new AbortController()
    void fetch('/api/admin/media', { signal: controller.signal }).then((response) => response.json()).then((result: { assets?: { id: string; altText: string; url: string }[] }) => setMediaAssets(result.assets || [])).catch((loadError: unknown) => {
      if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) setMediaAssets([])
    })
    return () => controller.abort()
  }, [open, mode, mediaAssets.length])

  async function submit(formData: FormData) {
    setBusy(true)
    setError('')
    const response = await fetch(`/api/admin/${mode === 'content' ? 'content' : 'newsletters'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setBusy(false)
    if (!response.ok) {
      setError(result.error || 'Utkastet kunde inte skapas.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <section className="rounded-[14px] border border-[#dce3ee] bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#101828]">Nytt {mode === 'content' ? 'innehållsutkast' : 'kampanjutkast'}</h2>
          <p className="mt-1 text-xs text-[#667085]">Skapas alltid som utkast och måste gå genom granskning före publicering.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-[10px] bg-[#0866ff] px-4 py-2 text-sm font-bold text-white">
          {open ? 'Stäng' : 'Skapa utkast'}
        </button>
      </div>
      {open ? (
        <form action={submit} className="mt-4 grid gap-3 border-t border-[#edf1f6] pt-4 md:grid-cols-2">
          <input name={mode === 'content' ? 'title' : 'name'} className={fieldClass} required minLength={3} maxLength={160} placeholder={mode === 'content' ? 'Titel' : 'Kampanjnamn'} />
          <input name={mode === 'content' ? 'slug' : 'subject'} className={fieldClass} required minLength={3} maxLength={180} placeholder={mode === 'content' ? 'URL-slug' : 'Ämnesrad'} />
          {mode === 'content' ? (
            <select name="post_type" className={fieldClass} defaultValue="news">
              <option value="news">Nyhet</option>
              <option value="blog">Blogg</option>
              <option value="buying_guide">Köpguide</option>
              <option value="selling_guide">Säljguide</option>
              <option value="help_article">Hjälpartikel</option>
            </select>
          ) : null}
          {mode === 'content' ? <select name="hero_media_id" className={fieldClass} defaultValue=""><option value="">Ingen huvudbild</option>{mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.altText || asset.id}</option>)}</select> : null}
          <input name="market" className={fieldClass} required defaultValue="SE" maxLength={2} aria-label="Marknad" />
          <input name="language" className={fieldClass} required defaultValue="sv" maxLength={5} aria-label="Språk" />
          {mode === 'newsletter' ? <input name="source_article_id" className={fieldClass} placeholder="Artikel-ID (valfritt – hämtar artikelns innehåll)" /> : null}
          <textarea name="content_text" rows={5} className="rounded-[10px] border border-[#d7deea] p-3 text-sm outline-none focus:border-[#0866ff] md:col-span-2" placeholder={mode === 'content' ? 'Brödtext för utkastet' : 'Kampanjinnehåll för utkastet'} />
          {error ? <p role="alert" className="text-sm font-bold text-red-700 md:col-span-2">{error}</p> : null}
          <button disabled={busy} className="rounded-[10px] bg-[#101828] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">
            {busy ? 'Skapar…' : 'Skapa utkast'}
          </button>
        </form>
      ) : null}
    </section>
  )
}

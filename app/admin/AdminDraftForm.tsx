'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, Plus, Trash2, Upload } from 'lucide-react'

const fieldClass = 'h-11 rounded-[10px] border border-[#d7deea] bg-white px-3 text-sm outline-none focus:border-[#0866ff]'
const richFieldClass = 'rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm outline-none focus:border-[#0866ff]'

type ContentBlock = {
  id: string
  type: 'paragraph' | 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  bold: boolean
}

function newBlock(type: ContentBlock['type'] = 'paragraph'): ContentBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    level: type === 'heading' ? 2 : 1,
    text: '',
    bold: false,
  }
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

export default function AdminDraftForm({ mode }: { mode: 'content' | 'newsletter' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mediaAssets, setMediaAssets] = useState<{ id: string; altText: string; url: string }[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<ContentBlock[]>([newBlock('paragraph')])
  const [selectedMediaId, setSelectedMediaId] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')

  useEffect(() => {
    if (!open || mode !== 'content' || mediaAssets.length) return
    const controller = new AbortController()
    void fetch('/api/admin/media', { signal: controller.signal })
      .then((response) => response.json())
      .then((result: { assets?: { id: string; altText: string; url: string }[] }) => setMediaAssets(result.assets || []))
      .catch((loadError: unknown) => {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) setMediaAssets([])
      })
    return () => controller.abort()
  }, [open, mode, mediaAssets.length])

  async function uploadHeroImage(formData: FormData) {
    const file = formData.get('hero_file')
    if (!(file instanceof File) || !file.size) return String(formData.get('hero_media_id') || '').trim()

    const altText = String(formData.get('hero_alt_text') || title || 'Autorell fordonsnyhet').trim()
    const caption = String(formData.get('hero_caption') || '').trim()
    const upload = new FormData()
    upload.set('file', file)
    upload.set('altText', altText)
    upload.set('caption', caption)
    setUploadMessage('Laddar upp och optimerar bild...')
    const response = await fetch('/api/admin/media', { method: 'POST', body: upload })
    const result = (await response.json().catch(() => ({}))) as { id?: string; error?: string }
    if (!response.ok || !result.id) throw new Error(result.error || 'Bilden kunde inte laddas upp.')
    setUploadMessage('Bilden är uppladdad.')
    return result.id
  }

  async function submit(formData: FormData) {
    setBusy(true)
    setError('')
    try {
      const payload = Object.fromEntries(formData.entries())
      if (mode === 'content') {
        payload.title = title
        payload.slug = slug
        payload.hero_media_id = await uploadHeroImage(formData)
        payload.content_blocks = JSON.stringify(blocks.map(({ id: _id, ...block }) => block))
      }
      const response = await fetch(`/api/admin/${mode === 'content' ? 'content' : 'newsletters'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'Utkastet kunde inte skapas.')
        return
      }
      setOpen(false)
      setTitle('')
      setSlug('')
      setSelectedMediaId('')
      setUploadMessage('')
      setBlocks([newBlock('paragraph')])
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Utkastet kunde inte skapas.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[14px] border border-[#dce3ee] bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#101828]">Nytt {mode === 'content' ? 'fordonsnyhetsutkast' : 'kampanjutkast'}</h2>
          <p className="mt-1 text-xs text-[#667085]">Skapas som utkast med URL, bild och text innan publicering.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-[10px] bg-[#0866ff] px-4 py-2 text-sm font-bold text-white">
          {open ? 'Stäng' : mode === 'content' ? 'Ny fordonsnyhet' : 'Skapa utkast'}
        </button>
      </div>
      {open ? (
        <form action={submit} className="mt-4 grid gap-4 border-t border-[#edf1f6] pt-4 md:grid-cols-2">
          {mode === 'content' ? (
            <>
              <label className="grid gap-2 text-sm font-semibold text-[#344054] md:col-span-2">
                Rubrik
                <input
                  name="title"
                  value={title}
                  onChange={(event) => {
                    const nextTitle = event.target.value
                    setTitle(nextTitle)
                    if (!slug) setSlug(slugify(nextTitle))
                  }}
                  className={fieldClass}
                  required
                  minLength={3}
                  maxLength={160}
                  placeholder="Exempel: Elbilsmarknaden växer i Europa"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#344054]">
                URL
                <div className="flex overflow-hidden rounded-[10px] border border-[#d7deea] bg-white focus-within:border-[#0866ff]">
                  <span className="hidden items-center border-r border-[#edf1f6] px-3 text-xs text-[#667085] sm:flex">/vehicle-news/</span>
                  <input
                    name="slug"
                    value={slug}
                    onChange={(event) => setSlug(slugify(event.target.value))}
                    className="h-11 min-w-0 flex-1 px-3 text-sm outline-none"
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder="egen-url"
                  />
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input name="market" className={fieldClass} required defaultValue="SE" maxLength={2} aria-label="Marknad" />
                <input name="language" className={fieldClass} required defaultValue="sv" maxLength={5} aria-label="Språk" />
              </div>
              <label className="grid gap-2 text-sm font-semibold text-[#344054] md:col-span-2">
                Kort beskrivning
                <textarea name="excerpt" rows={3} className={richFieldClass} required maxLength={320} placeholder="Kort ingress som visas på fordonsnyhetssidan och i Google." />
              </label>
              <section className="rounded-[14px] border border-[#dce3ee] bg-[#f8fafc] p-4 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#344054]">
                  <ImageIcon className="h-4 w-4 text-[#0866ff]" />
                  Huvudbild
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                    Ladda upp ny bild
                    <input name="hero_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="rounded-[10px] border border-[#d7deea] bg-white p-2 text-sm font-normal normal-case tracking-normal" />
                  </label>
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                    Eller välj från bibliotek
                    <select name="hero_media_id" value={selectedMediaId} onChange={(event) => setSelectedMediaId(event.target.value)} className={fieldClass}>
                      <option value="">Ingen vald biblioteksbild</option>
                      {mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.altText || asset.id}</option>)}
                    </select>
                  </label>
                  <input name="hero_alt_text" className={fieldClass} placeholder="Alt-text för bilden" />
                  <input name="hero_caption" className={fieldClass} placeholder="Bildtext, valfri" />
                </div>
                <p className="mt-3 text-xs text-[#667085]">{uploadMessage || 'Bilden optimeras automatiskt till nyhetskort, artikelbild och social format.'}</p>
              </section>
              <section className="rounded-[14px] border border-[#dce3ee] bg-white p-4 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#101828]">Artikelinnehåll</h3>
                    <p className="mt-1 text-xs text-[#667085]">Bygg texten med rubriker H1-H6, stycken och fet stil.</p>
                  </div>
                  <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('paragraph')])} className="inline-flex items-center gap-2 rounded-[10px] border border-[#d7deea] px-3 py-2 text-xs font-bold text-[#344054]">
                    <Plus className="h-4 w-4" /> Block
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="grid gap-2 rounded-[12px] border border-[#edf1f6] bg-[#fbfcfe] p-3">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={block.type === 'heading' ? `h${block.level}` : 'p'}
                          onChange={(event) => {
                            const value = event.target.value
                            setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, type: value === 'p' ? 'paragraph' : 'heading', level: value === 'p' ? 1 : Number(value.slice(1)) as ContentBlock['level'] } : item))
                          }}
                          className="h-9 rounded-[9px] border border-[#d7deea] bg-white px-2 text-xs font-semibold"
                        >
                          <option value="p">Stycke</option>
                          {[1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={`h${level}`}>H{level}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, bold: !item.bold } : item))}
                          className={`h-9 rounded-[9px] border px-3 text-xs font-bold ${block.bold ? 'border-[#0866ff] bg-[#eff6ff] text-[#0866ff]' : 'border-[#d7deea] bg-white text-[#344054]'}`}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlocks((current) => current.length > 1 ? current.filter((item) => item.id !== block.id) : current)}
                          className="ml-auto inline-flex h-9 items-center gap-1 rounded-[9px] border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700"
                          aria-label={`Ta bort block ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Ta bort
                        </button>
                      </div>
                      <textarea
                        value={block.text}
                        onChange={(event) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, text: event.target.value } : item))}
                        rows={block.type === 'heading' ? 2 : 5}
                        className={richFieldClass}
                        placeholder={block.type === 'heading' ? 'Rubriktext' : 'Brödtext'}
                      />
                    </div>
                  ))}
                </div>
              </section>
              <input name="post_type" type="hidden" value="news" />
            </>
          ) : (
            <>
              <input name="name" className={fieldClass} required minLength={3} maxLength={160} placeholder="Kampanjnamn" />
              <input name="subject" className={fieldClass} required minLength={3} maxLength={180} placeholder="Amnesrad" />
              <input name="market" className={fieldClass} required defaultValue="SE" maxLength={2} aria-label="Marknad" />
              <input name="language" className={fieldClass} required defaultValue="sv" maxLength={5} aria-label="Språk" />
              <input name="source_article_id" className={fieldClass} placeholder="Artikel-ID (valfritt - hämtar artikelns innehåll)" />
              <textarea name="content_text" rows={5} className="rounded-[10px] border border-[#d7deea] p-3 text-sm outline-none focus:border-[#0866ff] md:col-span-2" placeholder="Kampanjinnehåll för utkastet" />
            </>
          )}
          {error ? <p role="alert" className="text-sm font-bold text-red-700 md:col-span-2">{error}</p> : null}
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#101828] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">
            {mode === 'content' ? <Upload className="h-4 w-4" /> : null}
            {busy ? 'Skapar...' : 'Skapa utkast'}
          </button>
        </form>
      ) : null}
    </section>
  )
}

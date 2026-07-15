'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type ImportRow = {
  rowNumber: number
  valid: boolean
  errors: Array<{ field: string; message: string }>
  data: {
    referenceNumber: string | null
    category: string
    title: string
    price: number | null
    currency: string
    countryCode: string
    city: string
  }
}

type ImportPreview = {
  rows: ImportRow[]
  validRows: number
  invalidRows: number
  errors: Array<{ field: string; message: string }>
  quota?: {
    planKey: string
    limit: number
    used: number
    remaining: number
  }
}

type ImportResult = {
  success?: boolean
  created?: number
  listingIds?: string[]
  error?: string
}

type Copy = {
  templateTitle: string
  templateText: string
  downloadTemplate: string
  uploadTitle: string
  uploadText: string
  chooseFile: string
  validate: string
  importDrafts: string
  validating: string
  importing: string
  ready: string
  fileErrors: string
  row: string
  titleColumn: string
  category: string
  price: string
  location: string
  status: string
  valid: string
  invalid: string
  quota: string
  created: string
  openListings: string
}

export function CompanyImportClient({
  locale,
  copy,
}: {
  locale: PublicLocale
  copy: Copy
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'preview' | 'import' | null>(null)

  const canImport = Boolean(preview && preview.validRows > 0 && preview.invalidRows === 0 && preview.errors.length === 0)
  const quotaText = useMemo(() => {
    if (!preview?.quota) return ''
    return `${preview.quota.used}/${preview.quota.limit} used - ${preview.quota.remaining} remaining`
  }, [preview])

  async function submit(mode: 'preview' | 'import') {
    if (!file) return
    setBusy(mode)
    setError('')
    setResult(null)
    const form = new FormData()
    form.append('csv', file)
    const response = await fetch(mode === 'preview' ? '/api/account/company/import/preview' : '/api/account/company/import', {
      method: 'POST',
      body: form,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(String(data.error || 'The import could not be processed.'))
      if (data.rows) setPreview(data)
    } else if (mode === 'preview') {
      setPreview(data)
    } else {
      setResult(data)
      setPreview(null)
      setFile(null)
    }
    setBusy(null)
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)]">
        <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.templateTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{copy.templateText}</p>
          <a href="/templates/autorell-business-import.csv" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">
            <FileSpreadsheet className="h-4 w-4" />
            {copy.downloadTemplate}
          </a>
        </div>

        <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
            <Upload className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.uploadTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.uploadText}</p>
          <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-dashed border-[#b8c7dc] bg-[#f8fbff] px-4 py-4 text-sm font-semibold text-[#344054]">
            <span className="min-w-0 truncate">{file?.name || copy.chooseFile}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null)
                setPreview(null)
                setResult(null)
                setError('')
              }}
            />
          </label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={!file || busy !== null}
              onClick={() => submit('preview')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d0d8e6] bg-white px-4 text-sm font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy === 'preview' ? copy.validating : copy.validate}
            </button>
            <button
              type="button"
              disabled={!canImport || busy !== null}
              onClick={() => submit('import')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#b8c7dc]"
            >
              {busy === 'import' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy === 'import' ? copy.importing : copy.importDrafts}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#ffd0d0] bg-[#fff5f5] p-4 text-sm font-semibold text-[#b42318]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {result?.success ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#bad7ff] bg-[#eef5ff] p-4 text-sm font-semibold text-[#0b3b7a]">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{copy.created}: {result.created}</span>
          <Link href={localizePublicHref(locale, '/account/company/listings')} className="rounded-[10px] bg-[#0866ff] px-4 py-2 text-white">
            {copy.openListings}
          </Link>
        </div>
      ) : null}

      {preview ? (
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf3] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.ready}</h2>
              {quotaText ? <p className="mt-1 text-sm text-[#667085]">{copy.quota}: {quotaText}</p> : null}
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-[#0866ff]">{copy.valid}: {preview.validRows}</span>
              <span className="rounded-full bg-[#fff5f5] px-3 py-1 text-[#b42318]">{copy.invalid}: {preview.invalidRows}</span>
            </div>
          </div>
          {preview.errors.length ? (
            <div className="border-b border-[#e4eaf3] bg-[#fff8f1] px-5 py-3 text-sm text-[#9a3412]">
              <p className="font-bold">{copy.fileErrors}</p>
              {preview.errors.map((item) => <p key={`${item.field}-${item.message}`}>{item.message}</p>)}
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8fbff] text-xs font-bold uppercase tracking-[.12em] text-[#667085]">
                <tr>
                  <th className="px-5 py-3">{copy.row}</th>
                  <th className="px-5 py-3">{copy.titleColumn}</th>
                  <th className="px-5 py-3">{copy.category}</th>
                  <th className="px-5 py-3">{copy.price}</th>
                  <th className="px-5 py-3">{copy.location}</th>
                  <th className="px-5 py-3">{copy.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7]">
                {preview.rows.slice(0, 80).map((row) => (
                  <tr key={row.rowNumber} className="align-top">
                    <td className="px-5 py-4 font-semibold text-[#475467]">{row.rowNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#101828]">{row.data.title || '-'}</p>
                      <p className="text-xs text-[#667085]">{row.data.referenceNumber || '-'}</p>
                    </td>
                    <td className="px-5 py-4 text-[#475467]">{row.data.category}</td>
                    <td className="px-5 py-4 text-[#475467]">{row.data.price ? `${row.data.price} ${row.data.currency}` : '-'}</td>
                    <td className="px-5 py-4 text-[#475467]">{row.data.city}, {row.data.countryCode}</td>
                    <td className="px-5 py-4">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5ff] px-2.5 py-1 text-xs font-bold text-[#0866ff]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {copy.valid}
                        </span>
                      ) : (
                        <div className="max-w-sm text-xs font-semibold text-[#b42318]">
                          {row.errors.map((item) => <p key={`${row.rowNumber}-${item.field}-${item.message}`}>{item.field}: {item.message}</p>)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}

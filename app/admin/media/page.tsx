import Image from 'next/image'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminEmpty, AdminFilters, AdminPageHeader, AdminPagination, AdminTable, Badge } from '../AdminUI'
import { formatDate, getPage, getParam, pageRange, queryToUrlSearchParams, type AdminSearchParams } from '../admin-helpers'
import AdminMediaUploader from './AdminMediaUploader'

export const dynamic = 'force-dynamic'

type MediaRow = {
  id: string
  url: string
  objectPath: string
  format: string
  width: number | null
  height: number | null
  size: number | null
  altText: string
  usageCount: number
  status: string
  createdAt: string
}

function isMissingTable(message?: string) {
  return Boolean(message && (message.includes("Could not find the table") || message.includes('schema cache') || message.includes('does not exist')))
}

export default async function AdminMediaPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const params = await searchParams
  const q = getParam(params, 'q').trim().toLowerCase()
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const context = await requireAdminPermission('media.read')
  const { adminClient } = context

  const primary = await adminClient
    .from('media_assets')
    .select('id,object_path,mime_type,byte_size,width,height,alt_text,usage_count,status,created_at,public_url', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  let source: 'library' | 'listing-images' = 'library'
  let sourceMessage = ''
  let count = primary.count || 0
  let rows: MediaRow[] = []
  let loadError = primary.error && !isMissingTable(primary.error.message) ? primary.error.message : ''

  if (!primary.error) {
    rows = (primary.data || []).map((row) => ({
      id: String(row.id),
      url: String(row.public_url || ''),
      objectPath: String(row.object_path),
      format: String(row.mime_type).replace('image/', '').toUpperCase(),
      width: row.width,
      height: row.height,
      size: Number(row.byte_size || 0),
      altText: String(row.alt_text || ''),
      usageCount: Number(row.usage_count || 0),
      status: String(row.status),
      createdAt: String(row.created_at),
    }))
  } else if (isMissingTable(primary.error.message)) {
    source = 'listing-images'
    sourceMessage = 'Det nya CMS-biblioteket väntar på databasmigration. Tills dess visas riktiga bilder som redan används i fordonsannonser.'
    const fallback = await adminClient
      .from('marketplace_listing_images')
      .select('id,listing_id,avif_url,webp_url,width,height,avif_size_bytes,webp_size_bytes,original_filename,created_at,deleted_at', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to)
    count = fallback.count || 0
    loadError = fallback.error?.message || ''
    rows = (fallback.data || []).map((row) => ({
      id: String(row.id),
      url: String(row.avif_url || row.webp_url || ''),
      objectPath: String(row.original_filename || `Annonsbild ${row.id}`),
      format: row.avif_url ? 'AVIF' : 'WEBP',
      width: row.width,
      height: row.height,
      size: Number(row.avif_size_bytes || row.webp_size_bytes || 0),
      altText: 'Fordonsbild',
      usageCount: 1,
      status: 'active',
      createdAt: String(row.created_at),
    }))
  }

  const visibleRows = q
    ? rows.filter((row) => `${row.objectPath} ${row.altText} ${row.format}`.toLowerCase().includes(q))
    : rows

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader eyebrow="Bibliotek" title="Media" description="Sökbart bildbibliotek med tillgänglighetstext, dimensioner, användning och livscykelstatus." />
      {context.permissions.includes('media.manage') ? <AdminMediaUploader enabled={source === 'library'} /> : null}
      {sourceMessage ? (
        <div className="mb-6 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <span className="font-semibold">Begränsat läge:</span> {sourceMessage}
        </div>
      ) : null}
      <AdminFilters search={q} searchPlaceholder="Sök i media" />
      {loadError ? (
        <AdminEmpty text="Media kunde inte hämtas just nu. Försök igen eller kontrollera systemstatus." />
      ) : !visibleRows.length ? (
        <AdminEmpty text={source === 'library' ? 'Inga mediafiler matchar filtret.' : 'Inga aktiva annonsbilder matchar filtret.'} />
      ) : (
        <>
          <AdminTable columns={['Förhandsvisning', 'Fil', 'Format', 'Dimensioner', 'Storlek', 'Användning', 'Status', 'Uppladdad']}>
            {visibleRows.map((row) => (
              <tr key={row.id} className="hover:bg-[#f8fafc]">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-[#e4e7ec] bg-[#f2f4f7]">
                    {row.url ? <Image src={row.url} alt={row.altText} fill sizes="80px" className="object-cover" unoptimized /> : null}
                  </div>
                </td>
                <td className="max-w-[260px] px-4 py-4"><span className="line-clamp-2 break-all text-sm text-[#344054]">{row.objectPath}</span></td>
                <td className="px-4 py-4 text-[#475467]">{row.format}</td>
                <td className="px-4 py-4 text-[#475467]">{row.width && row.height ? `${row.width} × ${row.height}` : 'Saknas'}</td>
                <td className="px-4 py-4 text-[#475467]">{row.size ? `${Math.max(1, Math.round(row.size / 1024))} kB` : 'Saknas'}</td>
                <td className="px-4 py-4 text-[#475467]">{row.usageCount}</td>
                <td className="px-4 py-4"><Badge label={row.status === 'active' ? 'Aktiv' : row.status} tone={row.status === 'active' ? 'green' : 'gray'} /></td>
                <td className="px-4 py-4 text-[#475467]">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination page={page} hasNext={page * 20 < count} basePath="/admin/media" query={queryToUrlSearchParams(params)} />
        </>
      )}
    </main>
  )
}

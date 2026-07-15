import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'
import { processAdminMedia } from '@/lib/content/media-processing'

const BUCKET = 'autorell-media'

export async function GET() {
  const auth = await requireAdminRoute('media.read')
  if ('error' in auth) return auth.error
  const { data, error } = await auth.adminClient.from('media_assets').select('id,alt_text,public_url,variants').eq('status', 'active').order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ assets: (data || []).map((asset) => {
    const variants = (asset.variants || {}) as Record<string, { url?: string }>
    return { id: asset.id, altText: asset.alt_text, url: variants.thumbnail?.url || asset.public_url }
  }) })
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute('media.manage')
  if ('error' in auth) return auth.error
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Välj en bildfil.' }, { status: 400 })
    const altText = String(form.get('altText') || '').trim()
    const caption = String(form.get('caption') || '').trim()
    if (altText.length < 3) return NextResponse.json({ error: 'Alt-text måste vara minst 3 tecken.' }, { status: 400 })
    const processed = await processAdminMedia(file)
    const assetId = randomUUID()
    const day = new Date().toISOString().slice(0, 10)
    const base = `cms/${day}/${assetId}`
    const originalExtension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
    const originalPath = `${base}/original.${originalExtension}`
    const uploadedPaths: string[] = []

    const upload = async (path: string, body: Buffer, contentType: string) => {
      const { error } = await auth.adminClient.storage.from(BUCKET).upload(path, body, { contentType, cacheControl: '31536000', upsert: false })
      if (error) throw error
      uploadedPaths.push(path)
      return auth.adminClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    }

    try {
      const publicUrl = await upload(originalPath, processed.original, file.type)
      const variants: Record<string, { url: string; path: string; width: number; height: number; byteSize: number; mimeType: string }> = {}
      for (const [name, variant] of Object.entries(processed.variants)) {
        const path = `${base}/${name}.${variant.extension}`
        variants[name] = { url: await upload(path, variant.body, variant.contentType), path, width: variant.width, height: variant.height, byteSize: variant.size, mimeType: variant.contentType }
      }
      const record = {
        id: assetId, bucket: BUCKET, object_path: originalPath, mime_type: file.type, byte_size: file.size,
        width: processed.width, height: processed.height, alt_text: altText, caption: caption || null,
        focal_point: { x: 0.5, y: 0.5 }, usage_count: 0, status: 'active', uploaded_by: auth.user.id,
        original_filename: file.name, original_mime_type: file.type,
        checksum_sha256: createHash('sha256').update(processed.original).digest('hex'), public_url: publicUrl, variants,
      }
      const { error } = await auth.adminClient.from('media_assets').insert(record)
      if (error) throw error
      await writeAdminAuditLog({ adminClient: auth.adminClient, actorUserId: auth.user.id, actorRole: auth.primaryRole, permission: 'media.manage', action: 'media_uploaded', targetType: 'media_asset', targetId: assetId, afterData: { ...record, checksum_sha256: '[stored]' }, metadata: { variantCount: Object.keys(variants).length } })
      return NextResponse.json({ success: true, id: assetId, publicUrl }, { status: 201 })
    } catch (error) {
      if (uploadedPaths.length) await auth.adminClient.storage.from(BUCKET).remove(uploadedPaths)
      throw error
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    const friendly = message.includes('IMAGE_SIGNATURE') ? 'Filens innehåll matchar inte bildformatet.' : message.includes('IMAGE_SIZE') ? 'Bilden måste vara mindre än 15 MB.' : message.includes('UNSUPPORTED') ? 'Endast JPG, PNG, WebP och AVIF stöds.' : message.includes('schema cache') || message.includes('bucket') || message.includes('not found') ? 'Mediabibliotekets migration eller storage-bucket är inte aktiverad ännu.' : 'Bilden kunde inte laddas upp.'
    return NextResponse.json({ error: friendly }, { status: 400 })
  }
}

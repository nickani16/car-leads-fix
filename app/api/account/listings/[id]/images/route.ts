import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { processMarketplaceImage, type ProcessedMarketplaceImage } from '@/lib/marketplace/image-processing'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300

type UploadedImage = {
  cardUrl: string
  listingUrl: string
  fullscreenUrl: string
  cardPath: string
  listingPath: string
  fullscreenPath: string
  width: number
  height: number
  listingBytes: number
  fullscreenBytes: number
  filename: string
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({ key: `listing-images:${user.id}:${getClientIp(request)}`, limit: 20, windowMs: 60 * 60 * 1000 })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const { id } = await context.params
  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,images,expires_at')
    .eq('id', id)
    .maybeSingle()
  if (!listing || listing.seller_user_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const form = await request.formData()
  const files = form.getAll('images').filter((value): value is File => value instanceof File && value.size > 0)
  const existingImages = Array.isArray(listing.images) ? listing.images.filter((value): value is string => typeof value === 'string') : []
  if (!files.length || existingImages.length + files.length > 20 || files.some((file) => file.size > 25 * 1024 * 1024)) {
    return NextResponse.json({ error: 'Välj bilder så att annonsen har 1–20 bilder, max 25 MB per bild.' }, { status: 400 })
  }

  const uploaded: UploadedImage[] = []
  try {
    for (const [index, file] of files.entries()) uploaded.push(await uploadImage(admin, file, user.id, existingImages.length + index))
    const nextImages = [...existingImages, ...uploaded.map((image) => image.cardUrl)]
    const { error: updateError } = await admin
      .from('marketplace_listings')
      .update({ images: nextImages, updated_at: new Date().toISOString() })
      .eq('id', listing.id)
      .eq('seller_user_id', user.id)
    if (updateError) throw updateError

    const { error: metadataError } = await admin.from('marketplace_listing_images').insert(uploaded.map((image, index) => ({
      listing_id: listing.id,
      seller_user_id: user.id,
      position: existingImages.length + index,
      avif_url: image.fullscreenUrl,
      webp_url: image.listingUrl,
      storage_avif_path: image.fullscreenPath,
      storage_webp_path: image.listingPath,
      width: image.width,
      height: image.height,
      avif_size_bytes: image.fullscreenBytes,
      webp_size_bytes: image.listingBytes,
      original_filename: image.filename,
      expires_at: listing.expires_at,
      purge_after: listing.expires_at ? new Date(new Date(listing.expires_at).getTime() + 30 * 86_400_000).toISOString() : null,
    })))
    if (metadataError) console.warn('[listing-images] Metadata insert failed', { listingId: listing.id, error: metadataError.message })
    revalidateTag('marketplace-listings', 'max')
    return NextResponse.json({ success: true, images: nextImages })
  } catch (error) {
    await cleanup(admin, uploaded)
    console.error('[listing-images] Upload failed', { listingId: listing.id, error })
    return NextResponse.json({ error: imageError(error) }, { status: 400 })
  }
}

async function uploadImage(supabase: SupabaseClient, file: File, userId: string, index: number): Promise<UploadedImage> {
  const processed = await processMarketplaceImage(file)
  const stem = `${userId}/${crypto.randomUUID()}-${index}-${processed.baseName}`
  const cardPath = `${stem}/card.webp`
  const listingPath = `${stem}/listing.webp`
  const fullscreenPath = `${stem}/fullscreen.avif`
  const variants = [[cardPath, processed.card], [listingPath, processed.listing], [fullscreenPath, processed.fullscreen]] as const
  const results = await Promise.allSettled(variants.map(([path, variant]) => uploadVariant(supabase, path, variant)))
  const failed = results.find((result) => result.status === 'rejected')
  if (failed?.status === 'rejected') {
    await supabase.storage.from('marketplace-listings').remove(variants.flatMap(([path], i) => results[i]?.status === 'fulfilled' ? [path] : []))
    throw failed.reason
  }
  const url = (path: string) => supabase.storage.from('marketplace-listings').getPublicUrl(path).data.publicUrl
  return { cardUrl: url(cardPath), listingUrl: url(listingPath), fullscreenUrl: url(fullscreenPath), cardPath, listingPath, fullscreenPath, width: processed.listing.width, height: processed.listing.height, listingBytes: processed.listing.sizeBytes, fullscreenBytes: processed.fullscreen.sizeBytes, filename: processed.originalFilename }
}

async function uploadVariant(supabase: SupabaseClient, path: string, variant: ProcessedMarketplaceImage['card']) {
  const { error } = await supabase.storage.from('marketplace-listings').upload(path, variant.body, { cacheControl: '31536000', contentType: variant.contentType, upsert: false })
  if (error) throw error
}

async function cleanup(supabase: SupabaseClient, images: UploadedImage[]) {
  const paths = images.flatMap((image) => [image.cardPath, image.listingPath, image.fullscreenPath])
  if (paths.length) await supabase.storage.from('marketplace-listings').remove(paths)
}

function imageError(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'HEIC_NOT_SUPPORTED') return 'HEIC/HEIF stöds inte ännu. Välj JPG, PNG, WebP eller AVIF.'
  if (code === 'IMAGE_SIZE_INVALID') return 'En bild är tom eller större än 25 MB.'
  if (code === 'UNSUPPORTED_IMAGE_TYPE' || code === 'IMAGE_SIGNATURE_MISMATCH') return 'En fil har ett format eller innehåll som inte stöds.'
  return 'Bilderna kunde inte behandlas. Försök igen.'
}

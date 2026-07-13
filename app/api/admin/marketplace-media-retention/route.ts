import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRoute } from '@/lib/admin-route-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PurgeCandidate = {
  image_id: string
  listing_id: string
  storage_avif_path: string
  storage_webp_path: string
}

export async function POST(request: NextRequest) {
  const secret = process.env.MARKETPLACE_RETENTION_JOB_SECRET
  const authHeader = request.headers.get('authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    const auth = await requireAdminRoute('system.manage')
    if ('error' in auth) return auth.error
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('purge_expired_marketplace_listing_media', {
    p_batch_size: 250,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const candidates = (data || []) as PurgeCandidate[]
  const paths = [
    ...new Set(
      candidates
        .flatMap((candidate) => [
          candidate.storage_avif_path,
          candidate.storage_webp_path,
          cardPathForListingVariant(candidate.storage_webp_path),
        ])
        .filter(Boolean),
    ),
  ]

  if (paths.length) {
    const { error: removeError } = await admin.storage.from('marketplace-listings').remove(paths)
    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 })
    }
  }

  const imageIds = candidates.map((candidate) => candidate.image_id)
  if (imageIds.length) {
    const { error: markError } = await admin.rpc('mark_marketplace_listing_images_deleted', {
      p_image_ids: imageIds,
    })
    if (markError) {
      return NextResponse.json({ error: markError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    success: true,
    images: imageIds.length,
    storageObjects: paths.length,
  })
}

function cardPathForListingVariant(path: string) {
  return path.endsWith('/listing.webp')
    ? path.slice(0, -'/listing.webp'.length) + '/card.webp'
    : ''
}

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 15

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function storagePathFromSignedUrl(value: string) {
  try {
    const url = new URL(value)
    const marker = '/storage/v1/object/sign/leads/'
    const markerIndex = url.pathname.indexOf(marker)
    if (
      url.protocol !== 'https:' ||
      !url.hostname.endsWith('.supabase.co') ||
      markerIndex === -1
    ) {
      return null
    }
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const index = Number(new URL(request.url).searchParams.get('index') || '0')
    if (!uuidPattern.test(id) || !Number.isInteger(index) || index < 0 || index > 19) {
      return new Response(null, { status: 404 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new Response(null, { status: 401 })

    const admin = createAdminClient()
    const { data: dealer } = await admin
      .from('dealers')
      .select('id,status')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!dealer || dealer.status !== 'approved') {
      return new Response(null, { status: 403 })
    }

    const { data: lead } = await admin
      .from('leads')
      .select('images,seller_dealer_id')
      .eq('id', id)
      .eq('status', 'Active')
      .is('auction_closed_at', null)
      .maybeSingle()

    if (!lead || lead.seller_dealer_id === dealer.id) {
      return new Response(null, { status: 404 })
    }

    const images = Array.isArray(lead.images) ? (lead.images as string[]) : []
    const storagePath = images[index]
      ? storagePathFromSignedUrl(images[index])
      : null
    if (!storagePath) return new Response(null, { status: 404 })

    const { data: signedImage } = await admin.storage
      .from('leads')
      .createSignedUrl(storagePath, 60)
    if (!signedImage?.signedUrl) return new Response(null, { status: 404 })

    const sourceResponse = await fetch(signedImage.signedUrl, {
      signal: AbortSignal.timeout(8_000),
    })
    if (!sourceResponse.ok) return new Response(null, { status: 404 })

    const { default: sharp } = await import('sharp')
    const source = Buffer.from(await sourceResponse.arrayBuffer())
    const protectedImage = await sharp(source, {
      failOn: 'warning',
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86, effort: 4 })
      .toBuffer()

    return new Response(new Uint8Array(protectedImage), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
        'Content-Disposition': 'inline; filename="autorell-vehicle.webp"',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Protected dealer vehicle image failed', error)
    return new Response(null, { status: 404 })
  }
}

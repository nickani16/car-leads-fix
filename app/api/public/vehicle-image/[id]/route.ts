import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!uuidPattern.test(id)) {
      return new Response(null, { status: 404 })
    }

    const admin = createAdminClient()
    const { data: lead } = await admin
      .from('leads')
      .select('images')
      .eq('id', id)
      .eq('status', 'Active')
      .is('auction_closed_at', null)
      .gt('auction_ends_at', new Date().toISOString())
      .maybeSingle()

    const images = Array.isArray(lead?.images) ? (lead.images as string[]) : []
    const storagePath = images[0] ? storagePathFromSignedUrl(images[0]) : null
    if (!storagePath) {
      return new Response(null, { status: 404 })
    }

    const { data: signedImage } = await admin.storage
      .from('leads')
      .createSignedUrl(storagePath, 60)

    if (!signedImage?.signedUrl) {
      return new Response(null, { status: 404 })
    }

    const sourceResponse = await fetch(signedImage.signedUrl, {
      signal: AbortSignal.timeout(8_000),
    })
    if (!sourceResponse.ok) {
      return new Response(null, { status: 404 })
    }

    const source = Buffer.from(await sourceResponse.arrayBuffer())
    const protectedPreview = await sharp(source, {
      failOn: 'warning',
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize(120, 80, { fit: 'cover' })
      .blur(4.5)
      .resize(720, 480, { fit: 'fill', kernel: sharp.kernel.nearest })
      .modulate({ saturation: 0.72, brightness: 0.94 })
      .webp({ quality: 52, effort: 4 })
      .toBuffer()

    return new Response(new Uint8Array(protectedPreview), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
        'Content-Disposition': 'inline; filename="protected-vehicle.webp"',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Protected public vehicle image failed', error)
    return new Response(null, { status: 404 })
  }
}

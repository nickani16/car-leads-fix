import 'server-only'
import sharp from 'sharp'

export type MediaVariant = { body: Buffer; contentType: 'image/webp' | 'image/avif'; extension: 'webp' | 'avif'; width: number; height: number; size: number }
export type ProcessedMedia = { original: Buffer; width: number; height: number; variants: Record<'thumbnail' | 'newsCard' | 'mobile' | 'article' | 'social', MediaVariant> }

const MAX_BYTES = 15 * 1024 * 1024
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function processAdminMedia(file: File): Promise<ProcessedMedia> {
  const original = Buffer.from(await file.arrayBuffer())
  if (!TYPES.has(file.type)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
  if (!original.length || original.length > MAX_BYTES) throw new Error('IMAGE_SIZE_INVALID')
  if (!matchesSignature(original, file.type)) throw new Error('IMAGE_SIGNATURE_MISMATCH')
  const source = sharp(original, { failOn: 'error', limitInputPixels: 80_000_000, sequentialRead: true }).rotate()
  const metadata = await source.metadata()
  if (!metadata.width || !metadata.height) throw new Error('IMAGE_DIMENSIONS_INVALID')
  const [thumbnail, newsCard, mobile, article, social] = await Promise.all([
    encode(source, 320, 240, 'webp', 74, 'cover'),
    encode(source, 720, 480, 'webp', 76, 'cover'),
    encode(source, 720, 900, 'webp', 76, 'inside'),
    encode(source, 1600, 1000, 'avif', 62, 'inside'),
    encode(source, 1200, 630, 'webp', 80, 'cover'),
  ])
  return { original, width: metadata.width, height: metadata.height, variants: { thumbnail, newsCard, mobile, article, social } }
}

async function encode(source: sharp.Sharp, width: number, height: number, format: 'webp' | 'avif', quality: number, fit: 'inside' | 'cover'): Promise<MediaVariant> {
  let pipeline = source.clone().resize({ width, height, fit, withoutEnlargement: fit === 'inside' })
  pipeline = format === 'avif' ? pipeline.avif({ quality, effort: 4 }) : pipeline.webp({ quality, effort: 4, smartSubsample: true })
  const output = await pipeline.toBuffer({ resolveWithObject: true })
  return { body: output.data, contentType: format === 'avif' ? 'image/avif' : 'image/webp', extension: format, width: output.info.width, height: output.info.height, size: output.data.byteLength }
}

function matchesSignature(input: Buffer, type: string) {
  if (type === 'image/jpeg') return input.length >= 3 && input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff
  if (type === 'image/png') return input.length >= 8 && input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (type === 'image/webp') return input.length >= 12 && input.toString('ascii', 0, 4) === 'RIFF' && input.toString('ascii', 8, 12) === 'WEBP'
  if (type === 'image/avif') return input.length >= 12 && input.toString('ascii', 4, 8) === 'ftyp' && /avif|avis|mif1/.test(input.toString('ascii', 8, Math.min(32, input.length)))
  return false
}

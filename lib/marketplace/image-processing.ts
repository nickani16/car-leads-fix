import 'server-only'
import sharp from 'sharp'

export type ProcessedMarketplaceVariant = {
  body: Buffer
  contentType: 'image/avif' | 'image/webp'
  extension: 'avif' | 'webp'
  width: number
  height: number
  sizeBytes: number
}

export type ProcessedMarketplaceImage = {
  card: ProcessedMarketplaceVariant
  listing: ProcessedMarketplaceVariant
  fullscreen: ProcessedMarketplaceVariant
  baseName: string
  originalFilename: string
  originalContentType: string
  originalSizeBytes: number
}

const MAX_INPUT_BYTES = 25 * 1024 * 1024
const MAX_INPUT_PIXELS = 80_000_000
const SUPPORTED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

export async function processMarketplaceImage(file: File): Promise<ProcessedMarketplaceImage> {
  const input = Buffer.from(await file.arrayBuffer())
  validateImageUpload(file, input)

  const source = sharp(input, {
    failOn: 'error',
    limitInputPixels: MAX_INPUT_PIXELS,
    sequentialRead: true,
  }).rotate()

  const [card, listing, fullscreen] = await Promise.all([
    encodeVariant(source, 720, 540, 'webp', 74),
    encodeVariant(source, 1440, 1080, 'webp', 80),
    encodeVariant(source, 1920, 1440, 'avif', 60),
  ])

  return {
    card,
    listing,
    fullscreen,
    baseName: safeBaseName(file.name),
    originalFilename: file.name,
    originalContentType: file.type,
    originalSizeBytes: file.size,
  }
}

async function encodeVariant(
  source: sharp.Sharp,
  width: number,
  height: number,
  format: 'avif' | 'webp',
  quality: number,
): Promise<ProcessedMarketplaceVariant> {
  let pipeline = source.clone().resize({
    width,
    height,
    fit: 'inside',
    withoutEnlargement: true,
  })
  pipeline = format === 'avif'
    ? pipeline.avif({ quality, effort: 3, chromaSubsampling: '4:2:0' })
    : pipeline.webp({ quality, effort: 3, smartSubsample: true })
  const result = await pipeline.toBuffer({ resolveWithObject: true })
  return {
    body: result.data,
    contentType: format === 'avif' ? 'image/avif' : 'image/webp',
    extension: format,
    width: result.info.width,
    height: result.info.height,
    sizeBytes: result.data.byteLength,
  }
}

function validateImageUpload(file: File, input: Buffer) {
  if (!SUPPORTED_CONTENT_TYPES.has(file.type)) {
    if (['image/heic', 'image/heif'].includes(file.type)) {
      throw new Error('HEIC_NOT_SUPPORTED')
    }
    throw new Error('UNSUPPORTED_IMAGE_TYPE')
  }
  if (!input.length || input.length > MAX_INPUT_BYTES) {
    throw new Error('IMAGE_SIZE_INVALID')
  }
  if (!matchesImageSignature(input, file.type)) {
    throw new Error('IMAGE_SIGNATURE_MISMATCH')
  }
}

function matchesImageSignature(input: Buffer, contentType: string) {
  if (contentType === 'image/jpeg') {
    return input.length >= 3 && input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff
  }
  if (contentType === 'image/png') {
    return input.length >= 8 && input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  }
  if (contentType === 'image/webp') {
    return input.length >= 12 && input.toString('ascii', 0, 4) === 'RIFF' && input.toString('ascii', 8, 12) === 'WEBP'
  }
  if (contentType === 'image/avif') {
    if (input.length < 12 || input.toString('ascii', 4, 8) !== 'ftyp') return false
    const brands = input.toString('ascii', 8, Math.min(input.length, 32))
    return /avif|avis|mif1/.test(brands)
  }
  return false
}

function safeBaseName(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, '') || 'listing-image'
  return withoutExtension
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'listing-image'
}

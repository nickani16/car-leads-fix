import 'server-only'

export type ProcessedMarketplaceImage = {
  avif: Buffer
  webp: Buffer
  width: number | null
  height: number | null
  avifSizeBytes: number
  webpSizeBytes: number
  baseName: string
  originalFilename: string
}

const IMAGE_MAX_WIDTH = 1920
const IMAGE_MAX_HEIGHT = 1440
const AVIF_QUALITY = 58
const WEBP_QUALITY = 78
const MAX_INPUT_PIXELS = 50_000_000

export async function processMarketplaceImage(file: File): Promise<ProcessedMarketplaceImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image uploads are supported.')
  }

  const sharpModule = (await Function(
    'specifier',
    'return import(specifier)',
  )('sharp')) as typeof import('sharp')
  const sharp = sharpModule.default || sharpModule
  const input = Buffer.from(await file.arrayBuffer())
  const pipeline = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({
      width: IMAGE_MAX_WIDTH,
      height: IMAGE_MAX_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })

  const metadata = await pipeline.clone().metadata()
  const avif = await pipeline
    .clone()
    .avif({ quality: AVIF_QUALITY, effort: 4 })
    .toBuffer()
  const webp = await pipeline
    .clone()
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer()

  return {
    avif,
    webp,
    width: metadata.width || null,
    height: metadata.height || null,
    avifSizeBytes: avif.byteLength,
    webpSizeBytes: webp.byteLength,
    baseName: safeBaseName(file.name),
    originalFilename: file.name,
  }
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

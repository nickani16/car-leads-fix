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

type SubjectBounds = {
  left: number
  top: number
  width: number
  height: number
  imageWidth: number
  imageHeight: number
}

type VariantFrame = {
  width: number
  height: number
  targetFill: number
}

export async function processMarketplaceImage(file: File): Promise<ProcessedMarketplaceImage> {
  const input = Buffer.from(await file.arrayBuffer())
  validateImageUpload(file, input)

  const source = sharp(input, {
    failOn: 'error',
    limitInputPixels: MAX_INPUT_PIXELS,
    sequentialRead: true,
  }).rotate()

  const subjectBounds = await detectSubjectBounds(source)
  const [card, listing, fullscreen] = await Promise.all([
    encodeVariant(source, { width: 720, height: 540, targetFill: 0.93 }, 'webp', 74, subjectBounds),
    encodeVariant(source, { width: 1440, height: 1080, targetFill: 0.92 }, 'webp', 80, subjectBounds),
    encodeVariant(source, { width: 1920, height: 1440, targetFill: 0.9 }, 'avif', 60, subjectBounds),
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
  frame: VariantFrame,
  format: 'avif' | 'webp',
  quality: number,
  subjectBounds: SubjectBounds | null,
): Promise<ProcessedMarketplaceVariant> {
  let pipeline = source.clone()
  const crop = subjectBounds ? frameCropForSubject(subjectBounds, frame) : null
  if (crop) {
    pipeline = pipeline.extract(crop)
  }
  pipeline = pipeline.resize({
    width: frame.width,
    height: frame.height,
    fit: 'inside',
    withoutEnlargement: true,
  })
  pipeline = format === 'avif'
    ? pipeline.avif({ quality, effort: 4, chromaSubsampling: '4:2:0' })
    : pipeline.webp({ quality, effort: 4, smartSubsample: true })
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

async function detectSubjectBounds(source: sharp.Sharp): Promise<SubjectBounds | null> {
  const metadata = await source.clone().metadata()
  if (!metadata.width || !metadata.height) return null

  const sample = await source
    .clone()
    .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const width = sample.info.width
  const height = sample.info.height
  const channels = sample.info.channels
  if (channels < 3 || width < 80 || height < 80) return null

  const background = estimateBorderBackground(sample.data, width, height, channels)
  if (!background) return null

  const threshold = Math.max(30, Math.min(74, background.deviation * 2.6))
  const rowCounts = new Array<number>(height).fill(0)
  const columnCounts = new Array<number>(width).fill(0)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels
      const distance = colorDistance(
        sample.data[index],
        sample.data[index + 1],
        sample.data[index + 2],
        background.r,
        background.g,
        background.b,
      )
      if (distance >= threshold) {
        rowCounts[y] += 1
        columnCounts[x] += 1
      }
    }
  }

  const minRowPixels = Math.max(4, Math.round(width * 0.018))
  const minColumnPixels = Math.max(4, Math.round(height * 0.018))
  const top = firstContentIndex(rowCounts, minRowPixels)
  const bottom = lastContentIndex(rowCounts, minRowPixels)
  const left = firstContentIndex(columnCounts, minColumnPixels)
  const right = lastContentIndex(columnCounts, minColumnPixels)
  if (top === -1 || bottom === -1 || left === -1 || right === -1) return null

  const sampleBounds = {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  }
  if (!isReliableSubjectBounds(sampleBounds, width, height, background.deviation)) return null

  const scaleX = metadata.width / width
  const scaleY = metadata.height / height
  const leftOnSource = Math.max(0, Math.floor(sampleBounds.left * scaleX))
  const topOnSource = Math.max(0, Math.floor(sampleBounds.top * scaleY))
  return {
    left: leftOnSource,
    top: topOnSource,
    width: Math.min(metadata.width - leftOnSource, Math.ceil(sampleBounds.width * scaleX)),
    height: Math.min(metadata.height - topOnSource, Math.ceil(sampleBounds.height * scaleY)),
    imageWidth: metadata.width,
    imageHeight: metadata.height,
  }
}

function estimateBorderBackground(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): { r: number; g: number; b: number; deviation: number } | null {
  const border = Math.max(8, Math.round(Math.min(width, height) * 0.045))
  let count = 0
  let r = 0
  let g = 0
  let b = 0
  const samples: Array<[number, number, number]> = []

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (x >= border && x < width - border && y >= border && y < height - border) continue
      const index = (y * width + x) * channels
      const sample: [number, number, number] = [data[index], data[index + 1], data[index + 2]]
      samples.push(sample)
      r += sample[0]
      g += sample[1]
      b += sample[2]
      count += 1
    }
  }
  if (!count) return null

  r /= count
  g /= count
  b /= count
  const deviation = samples.reduce((sum, sample) => {
    return sum + colorDistance(sample[0], sample[1], sample[2], r, g, b)
  }, 0) / count

  return { r, g, b, deviation }
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
) {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function firstContentIndex(counts: number[], minimum: number) {
  for (let index = 0; index < counts.length; index += 1) {
    if (counts[index] >= minimum) return index
  }
  return -1
}

function lastContentIndex(counts: number[], minimum: number) {
  for (let index = counts.length - 1; index >= 0; index -= 1) {
    if (counts[index] >= minimum) return index
  }
  return -1
}

function isReliableSubjectBounds(
  bounds: Pick<SubjectBounds, 'left' | 'top' | 'width' | 'height'>,
  imageWidth: number,
  imageHeight: number,
  backgroundDeviation: number,
) {
  const widthRatio = bounds.width / imageWidth
  const heightRatio = bounds.height / imageHeight
  const areaRatio = (bounds.width * bounds.height) / (imageWidth * imageHeight)
  if (backgroundDeviation > 46) return false
  if (widthRatio < 0.18 || heightRatio < 0.16 || areaRatio < 0.035) return false
  if (widthRatio > 0.96 && heightRatio > 0.96) return false
  return true
}

function frameCropForSubject(bounds: SubjectBounds, frame: VariantFrame): sharp.Region | null {
  const frameAspect = frame.width / frame.height
  const crop = cropAroundSubject(bounds, bounds.imageWidth, bounds.imageHeight, frameAspect, frame.targetFill)
  if (!crop) return null
  if (crop.width >= bounds.imageWidth - 2 && crop.height >= bounds.imageHeight - 2) return null
  return crop
}

function cropAroundSubject(
  bounds: SubjectBounds,
  imageWidth: number,
  imageHeight: number,
  targetAspect: number,
  targetFill: number,
): sharp.Region | null {
  const desiredWidthFromSubject = bounds.width / targetFill
  const desiredHeightFromSubject = bounds.height / targetFill
  let cropWidth = Math.max(desiredWidthFromSubject, desiredHeightFromSubject * targetAspect)
  let cropHeight = cropWidth / targetAspect
  if (cropHeight < desiredHeightFromSubject) {
    cropHeight = desiredHeightFromSubject
    cropWidth = cropHeight * targetAspect
  }

  if (cropWidth > imageWidth) {
    cropWidth = imageWidth
    cropHeight = cropWidth / targetAspect
  }
  if (cropHeight > imageHeight) {
    cropHeight = imageHeight
    cropWidth = cropHeight * targetAspect
  }
  if (cropWidth < bounds.width || cropHeight < bounds.height) return null

  const centerX = bounds.left + bounds.width / 2
  const centerY = bounds.top + bounds.height / 2
  const left = Math.min(Math.max(0, centerX - cropWidth / 2), imageWidth - cropWidth)
  const top = Math.min(Math.max(0, centerY - cropHeight / 2), imageHeight - cropHeight)
  const roundedLeft = Math.round(left)
  const roundedTop = Math.round(top)

  return {
    left: roundedLeft,
    top: roundedTop,
    width: Math.max(1, Math.min(imageWidth - roundedLeft, Math.round(cropWidth))),
    height: Math.max(1, Math.min(imageHeight - roundedTop, Math.round(cropHeight))),
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

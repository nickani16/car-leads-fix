import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import sharp from 'sharp'
import ts from 'typescript'

const processingSource = await readFile('lib/marketplace/image-processing.ts', 'utf8')
const listingRouteSource = await readFile('app/api/account/listings/route.ts', 'utf8')
const listingFormSource = await readFile('app/konto/annonser/ny/NewListingForm.tsx', 'utf8')
const nextConfigSource = await readFile('next.config.ts', 'utf8')
const require = createRequire(import.meta.url)

test('sharp is statically imported and traced into the listings function', () => {
  assert.match(processingSource, /import sharp from 'sharp'/)
  assert.doesNotMatch(processingSource, /Function\([\s\S]*import\(specifier\)/)
  assert.match(nextConfigSource, /outputFileTracingIncludes/)
  assert.match(nextConfigSource, /node_modules\/sharp\/\*\*\/\*/)
})

test('JPG, PNG, WebP and AVIF can produce bounded card, listing and fullscreen variants', async () => {
  const { processMarketplaceImage } = loadImageProcessingModule()
  const source = sharp({
    create: {
      width: 2400,
      height: 1800,
      channels: 3,
      background: { r: 32, g: 128, b: 224 },
    },
  })
  const inputs = await Promise.all([
    source.clone().jpeg({ quality: 90 }).toBuffer(),
    source.clone().png().toBuffer(),
    source.clone().webp({ quality: 90 }).toBuffer(),
    source.clone().avif({ quality: 70 }).toBuffer(),
  ])

  const contentTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const extensions = ['jpg', 'png', 'webp', 'avif']

  for (const [index, input] of inputs.entries()) {
    const processed = await processMarketplaceImage(
      new File([input], `vehicle.${extensions[index]}`, { type: contentTypes[index] }),
    )
    assert.ok(processed.card.width <= 720 && processed.card.height <= 540)
    assert.ok(processed.listing.width <= 1440 && processed.listing.height <= 1080)
    assert.ok(processed.fullscreen.width <= 1920 && processed.fullscreen.height <= 1440)
    assert.ok(processed.card.body.length > 0)
    assert.ok(processed.listing.body.length > 0)
    assert.ok(processed.fullscreen.body.length > 0)
  }
})

test('safe inside framing keeps the complete vehicle visible without subject cropping', async () => {
  const { processMarketplaceImage } = loadImageProcessingModule()
  const source = sharp({
    create: {
      width: 2400,
      height: 1800,
      channels: 3,
      background: { r: 246, g: 246, b: 244 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 1400,
            height: 620,
            channels: 4,
            background: { r: 26, g: 35, b: 46, alpha: 1 },
          },
        }).png().toBuffer(),
        left: 500,
        top: 650,
      },
    ])
    .jpeg({ quality: 92 })

  const input = await source.toBuffer()
  const processed = await processMarketplaceImage(new File([input], 'vehicle.jpg', { type: 'image/jpeg' }))
  const card = await sharp(processed.card.body).raw().toBuffer({ resolveWithObject: true })
  const bounds = darkPixelBounds(card.data, card.info.width, card.info.height, card.info.channels)

  assert.equal(processed.card.width, 720)
  assert.equal(processed.card.height, 540)
  assert.ok(bounds, 'expected the synthetic vehicle subject to remain visible')
  assert.ok(bounds.width / processed.card.width >= 0.55)
  assert.ok(bounds.width / processed.card.width <= 0.62)
  assert.ok(bounds.left > 0 && bounds.top > 0)
  assert.ok(bounds.left + bounds.width < processed.card.width)
  assert.ok(bounds.top + bounds.height < processed.card.height)
})

test('a large vertical mobile image is accepted and remains vertical in every variant', async () => {
  const { processMarketplaceImage } = loadImageProcessingModule()
  const width = 1200
  const height = 2000
  const input = await sharp(randomBytes(width * height * 3), {
    raw: { width, height, channels: 3 },
  }).png({ compressionLevel: 0 }).toBuffer()
  assert.ok(input.byteLength > 6 * 1024 * 1024)

  const processed = await processMarketplaceImage(
    new File([input], 'large-vertical.png', { type: 'image/png' }),
  )
  for (const variant of [processed.card, processed.listing, processed.fullscreen]) {
    assert.ok(variant.height > variant.width)
    assert.ok(variant.body.byteLength > 0)
  }
})

test('unsupported and spoofed files are rejected with stable error codes', async () => {
  const { processMarketplaceImage } = loadImageProcessingModule()
  const jpeg = await sharp({
    create: { width: 320, height: 240, channels: 3, background: '#0866ff' },
  }).jpeg().toBuffer()

  await assert.rejects(
    processMarketplaceImage(new File([jpeg], 'vehicle.heic', { type: 'image/heic' })),
    /HEIC_NOT_SUPPORTED/,
  )
  await assert.rejects(
    processMarketplaceImage(new File([jpeg], 'vehicle.png', { type: 'image/png' })),
    /IMAGE_SIGNATURE_MISMATCH/,
  )
  await assert.rejects(
    processMarketplaceImage(new File(['not an image'], 'notes.txt', { type: 'text/plain' })),
    /UNSUPPORTED_IMAGE_TYPE/,
  )
  assert.match(listingRouteSource, /HEIC\/HEIF stöds inte ännu\. Välj JPG, PNG, WebP eller AVIF\./)
})

test('listing creation processes images sequentially and stores card URLs separately', () => {
  assert.match(listingRouteSource, /for \(const \[index, file\] of files\.entries\(\)\)/)
  assert.doesNotMatch(listingRouteSource, /Promise\.all\(\s*files\.map/)
  assert.match(listingRouteSource, /Promise\.allSettled\([\s\S]*variants\.map/)
  assert.match(listingRouteSource, /const images = uploadedImages\.map\(\(image\) => image\.cardUrl\)/)
  assert.match(listingRouteSource, /storageListingPath/)
  assert.match(listingRouteSource, /storageFullscreenPath/)
})

function loadImageProcessingModule() {
  const sanitizedSource = processingSource.replace(/import 'server-only'\r?\n/, '')
  const transpiled = ts.transpileModule(sanitizedSource, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const cjsModule = { exports: {} }
  vm.runInNewContext(transpiled, {
    Buffer,
    File,
    console,
    exports: cjsModule.exports,
    module: cjsModule,
    require,
  })
  return cjsModule.exports
}

function darkPixelBounds(data, width, height, channels) {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels
      if (data[index] < 90 && data[index + 1] < 100 && data[index + 2] < 115) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }
  }
  if (right < left || bottom < top) return null
  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  }
}

test('client accepts only supported formats and processes selected images without a memory burst', () => {
  assert.match(listingFormSource, /image\/jpeg,image\/png,image\/webp,image\/avif/)
  assert.doesNotMatch(listingFormSource, /accept="[^"]*(?:heic|heif)/i)
  assert.match(listingFormSource, /for \(const file of selected\)[\s\S]*await compressImage\(file\)/)
  assert.match(listingFormSource, /Anslutningen avbröts\. Dina uppgifter finns kvar/)
  assert.match(listingFormSource, /listingRequestTimeoutMs = 60_000/)
  assert.match(listingFormSource, /180_000/)
})

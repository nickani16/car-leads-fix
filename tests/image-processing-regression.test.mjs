import assert from 'node:assert/strict'
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

  for (const input of inputs) {
    const normalized = sharp(input, { failOn: 'error', limitInputPixels: 80_000_000 }).rotate()
    const card = await normalized.clone().resize({ width: 720, height: 540, fit: 'inside' }).webp({ quality: 74 }).toBuffer({ resolveWithObject: true })
    const listing = await normalized.clone().resize({ width: 1440, height: 1080, fit: 'inside' }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true })
    const fullscreen = await normalized.clone().resize({ width: 1920, height: 1440, fit: 'inside' }).avif({ quality: 60 }).toBuffer({ resolveWithObject: true })
    assert.ok(card.info.width <= 720 && card.info.height <= 540)
    assert.ok(listing.info.width <= 1440 && listing.info.height <= 1080)
    assert.ok(fullscreen.info.width <= 1920 && fullscreen.info.height <= 1440)
    assert.ok(card.data.length > 0 && listing.data.length > 0 && fullscreen.data.length > 0)
  }
})

test('vehicle subject framing trims empty margins while keeping the full subject visible', async () => {
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
  assert.ok(bounds.width / processed.card.width >= 0.9)
  assert.ok(bounds.left > 0 && bounds.top > 0)
  assert.ok(bounds.left + bounds.width < processed.card.width)
  assert.ok(bounds.top + bounds.height < processed.card.height)
})

test('listing creation processes images sequentially and stores card URLs separately', () => {
  assert.match(listingRouteSource, /for \(const \[index, file\] of files\.entries\(\)\)/)
  assert.doesNotMatch(listingRouteSource, /Promise\.all\(\s*files\.map/)
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

test('client accepts supported formats and keeps individual failures recoverable', () => {
  assert.match(listingFormSource, /image\/jpeg,image\/png,image\/webp,image\/avif/)
  assert.match(listingFormSource, /Promise\.allSettled/)
  assert.match(listingFormSource, /Anslutningen avbröts\. Dina uppgifter finns kvar/)
  assert.match(listingFormSource, /180_000/)
})

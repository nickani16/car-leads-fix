import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import sharp from 'sharp'

const processingSource = await readFile('lib/marketplace/image-processing.ts', 'utf8')
const listingRouteSource = await readFile('app/api/account/listings/route.ts', 'utf8')
const listingFormSource = await readFile('app/konto/annonser/ny/NewListingForm.tsx', 'utf8')
const nextConfigSource = await readFile('next.config.ts', 'utf8')

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

test('listing creation processes images sequentially and stores card URLs separately', () => {
  assert.match(listingRouteSource, /for \(const \[index, file\] of files\.entries\(\)\)/)
  assert.doesNotMatch(listingRouteSource, /Promise\.all\(\s*files\.map/)
  assert.match(listingRouteSource, /const images = uploadedImages\.map\(\(image\) => image\.cardUrl\)/)
  assert.match(listingRouteSource, /storageListingPath/)
  assert.match(listingRouteSource, /storageFullscreenPath/)
})

test('client accepts supported formats and keeps individual failures recoverable', () => {
  assert.match(listingFormSource, /image\/jpeg,image\/png,image\/webp,image\/avif/)
  assert.match(listingFormSource, /Promise\.allSettled/)
  assert.match(listingFormSource, /Anslutningen avbröts\. Dina uppgifter finns kvar/)
  assert.match(listingFormSource, /180_000/)
})

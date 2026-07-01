import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'

const source = 'public/autorell-favicon-master.png'

const outputs = [
  ['app/icon.png', 512],
  ['app/apple-icon.png', 180],
  ['public/favicon-16.png', 16],
  ['public/favicon-32.png', 32],
  ['public/favicon-48.png', 48],
  ['public/favicon-96.png', 96],
  ['public/android-chrome-192x192.png', 192],
  ['public/android-chrome-512x512.png', 512],
  ['public/icon-72.png', 72],
  ['public/icon-96.png', 96],
  ['public/icon-128.png', 128],
  ['public/icon-144.png', 144],
  ['public/icon-152.png', 152],
  ['public/icon-167.png', 167],
  ['public/icon-180.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-384.png', 384],
  ['public/icon-512.png', 512],
  ['public/icon-maskable-512.png', 512],
  ['public/apple-touch-icon.png', 180],
]

await Promise.all(
  outputs.map(([path, size]) =>
    sharp(source)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path),
  ),
)

const icoSizes = [16, 32, 48]
const icoImages = await Promise.all(
  icoSizes.map((size) =>
    sharp(source)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer(),
  ),
)
const headerSize = 6 + icoImages.length * 16
const fileSize =
  headerSize + icoImages.reduce((total, image) => total + image.length, 0)
const ico = Buffer.alloc(fileSize)

ico.writeUInt16LE(0, 0)
ico.writeUInt16LE(1, 2)
ico.writeUInt16LE(icoImages.length, 4)

let imageOffset = headerSize
icoImages.forEach((image, index) => {
  const size = icoSizes[index]
  const entryOffset = 6 + index * 16
  ico.writeUInt8(size, entryOffset)
  ico.writeUInt8(size, entryOffset + 1)
  ico.writeUInt8(0, entryOffset + 2)
  ico.writeUInt8(0, entryOffset + 3)
  ico.writeUInt16LE(1, entryOffset + 4)
  ico.writeUInt16LE(32, entryOffset + 6)
  ico.writeUInt32LE(image.length, entryOffset + 8)
  ico.writeUInt32LE(imageOffset, entryOffset + 12)
  image.copy(ico, imageOffset)
  imageOffset += image.length
})

await writeFile('public/favicon.ico', ico)

const sourceImage = await readFile(source)
const faviconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <image width="512" height="512" href="data:image/png;base64,${sourceImage.toString('base64')}" />
</svg>
`

await writeFile('public/favicon.svg', faviconSvg)

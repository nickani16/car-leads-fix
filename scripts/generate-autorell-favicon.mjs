import sharp from 'sharp'

const source = 'public/autorell-favicon-master.png'

const outputs = [
  ['app/icon.png', 512],
  ['app/apple-icon.png', 180],
  ['public/favicon-16.png', 16],
  ['public/favicon-32.png', 32],
  ['public/favicon-48.png', 48],
  ['public/icon-96.png', 96],
  ['public/icon-144.png', 144],
  ['public/icon-192.png', 192],
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

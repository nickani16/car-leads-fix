import sharp from 'sharp'

const svg = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="76" fill="#0866ff"/>
  <text
    x="256"
    y="193"
    fill="#ffffff"
    font-family="Arial Black, Arial, sans-serif"
    font-size="470"
    font-weight="900"
    text-anchor="middle"
    dominant-baseline="central"
  >a</text>
</svg>`)

const outputs = [
  ['app/icon.png', 512],
  ['app/apple-icon.png', 180],
  ['public/favicon-48.png', 48],
  ['public/autorell-favicon-master.png', 512],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/icon-maskable-512.png', 512],
  ['public/apple-touch-icon.png', 180],
]

await Promise.all(
  outputs.map(([path, size]) =>
    sharp(svg)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path),
  ),
)

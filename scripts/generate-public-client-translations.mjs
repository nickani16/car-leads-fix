import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceFiles = [
  'app/components/PublicHeader.tsx',
  'app/components/PublicFooter.tsx',
  'app/components/CookieConsent.tsx',
  'app/components/HomeHeroVehicleSearch.tsx',
  'app/components/AuthModal.tsx',
  'app/components/EmailCodeAuth.tsx',
  'lib/marketplace.ts',
  'lib/marketplace-body-types.ts',
  'lib/category-landings.ts',
]
const clientLocales = ['fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']
const source = sourceFiles
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n')
const full = JSON.parse(
  fs.readFileSync(path.join(root, 'lib/generated-public-translations.json'), 'utf8'),
)
const keys = Object.keys(full.en).filter((key) => source.includes(key))
const compact = Object.fromEntries(
  clientLocales.map((locale) => [
    locale,
    Object.fromEntries(
      keys.flatMap((key) =>
        Object.hasOwn(full[locale] || {}, key) ? [[key, full[locale][key]]] : [],
      ),
    ),
  ]),
)

fs.writeFileSync(
  path.join(root, 'lib/generated-public-client-translations.json'),
  `${JSON.stringify(compact)}\n`,
  'utf8',
)
console.log(`Wrote ${keys.length} client translation keys for ${clientLocales.length} locales.`)

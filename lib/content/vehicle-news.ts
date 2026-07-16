import 'server-only'

import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export type PublicNewsCategory = {
  id: string
  key: string
  label: string
}

export type PublicNewsArticle = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: Record<string, unknown>
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
  category: PublicNewsCategory | null
  tags: string[]
  imageUrl: string | null
  imageAlt: string
  imageCaption: string | null
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  viewCount: number
  relatedPostIds: string[]
}

export type PublicNewsBodyBlock = {
  type: 'paragraph' | 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  bold: boolean
}

const fallbackCategories: PublicNewsCategory[] = [
  { id: 'cars', key: 'cars', label: 'Bilar' },
  { id: 'trucks', key: 'trucks', label: 'Lastbilar' },
  { id: 'agriculture', key: 'agriculture', label: 'Lantbruksmaskiner' },
]

const fallbackArticles: PublicNewsArticle[] = [
  {
    id: 'fallback-sell-trucks-on-autorell',
    slug: 'sell-trucks-on-autorell',
    title: 'Sälja lastbil på Autorell: så fungerar processen från annons till seriös kontakt',
    excerpt: 'En praktisk guide för åkerier, företag och privata säljare som vill nå fler köpare när de säljer lastbil online.',
    body: articleDoc([
      ['heading', 2, 'Varför sälja lastbil via en europeisk marknadsplats?'],
      ['paragraph', 1, 'Att sälja en lastbil handlar ofta om mer än att lägga upp några bilder och vänta på samtal. Köparen vill förstå skick, utrustning, användningsområde, historik och total kostnad. På Autorell byggs annonsflödet för att göra just den informationen tydlig, så att rätt köpare snabbare kan avgöra om fordonet passar deras verksamhet.'],
      ['paragraph', 1, 'För åkerier och företag kan marknaden dessutom vara större än den lokala regionen. En dragbil, skåplastbil, kylbil eller tippbil kan vara mer attraktiv i en annan del av Europa beroende på efterfrågan, säsong och användningsområde. Därför är det viktigt att annonsen är strukturerad, sökbar och lätt att jämföra.'],
      ['heading', 2, 'Så förbereder du en stark lastbilsannons'],
      ['paragraph', 1, 'Börja med tydliga bilder från flera vinklar: front, sidor, hytt, lastutrymme, chassi, däck, instrumentpanel och eventuella skador. En ärlig annons skapar bättre dialog och minskar risken för onödiga frågor. Lägg också till uppgifter som miltal, årsmodell, växellåda, drivmedel, axelkonfiguration, totalvikt, lastkapacitet och servicehistorik.'],
      ['paragraph', 1, 'På Autorell är målet att säljaren ska kunna presentera fordonet professionellt utan att behöva bygga en egen försäljningssida. För företag med abonnemang blir det extra viktigt att annonserna hålls uppdaterade, eftersom köpare ofta jämför flera objekt samtidigt.'],
      ['heading', 2, 'Vad händer när annonsen är publicerad?'],
      ['paragraph', 1, 'När lastbilen ligger ute kan köpare hitta den via sök, kategori, marknad och relevanta filter. En bra rubrik gör stor skillnad. Skriv hellre konkret, till exempel “Volvo FH dragbil 2020 med Euro 6 och servicehistorik”, än en allmän rubrik som bara säger “Fin lastbil säljes”.'],
      ['paragraph', 1, 'När en intressent hör av sig bör du ha dokumentation redo: registreringsuppgifter, serviceunderlag, besiktningsinformation och tydliga betalningsvillkor. Det ger ett seriöst intryck och gör att affären kan gå snabbare.'],
      ['heading', 2, 'Autorell gör försäljningen enklare'],
      ['paragraph', 1, 'Autorell samlar fordon från flera europeiska marknader på ett ställe. För dig som säljer lastbil betyder det att annonsen kan nå fler relevanta köpare, samtidigt som processen hålls enkel: skapa annons, fyll i uppgifter, ladda upp bilder och hantera kontakterna från ett och samma konto.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T08:00:00.000Z',
    updatedAt: '2026-07-16T08:00:00.000Z',
    readingTime: 4,
    category: fallbackCategories[1],
    tags: ['Sälja lastbil', 'Lastbilar', 'Företag', 'Transport'],
    imageUrl: '/category-trucks-hero.jpg',
    imageAlt: 'Lastbil på väg genom skogsparti',
    imageCaption: null,
    seoTitle: 'Sälja lastbil på Autorell | Guide för företag och åkerier',
    metaDescription: 'Så säljer du lastbil på Autorell: bilder, annonstext, fordonsdata och processen från publicering till seriös köparkontakt.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
  {
    id: 'fallback-sell-car-privately-online',
    slug: 'sell-car-privately-online',
    title: 'Sälja bil privat online: steg för steg till en tryggare och bättre annons',
    excerpt: 'Så gör du bilen mer lättsåld med rätt bilder, tydlig information och ett tryggt säljflöde på Autorell.',
    body: articleDoc([
      ['heading', 2, 'En bra bilannons börjar innan du skriver rubriken'],
      ['paragraph', 1, 'När du säljer bil privat är första intrycket avgörande. Köparen jämför ofta flera bilar i samma prisklass och bestämmer snabbt vilka annonser som känns seriösa. Därför behöver bilder, rubrik och beskrivning arbeta tillsammans. Tvätta bilen, ta bilder i dagsljus och visa både helhet och detaljer.'],
      ['paragraph', 1, 'Fotografera utsida, interiör, bagageutrymme, instrumentpanel, däck och eventuella märken eller skador. Det är bättre att vara tydlig från början än att låta köparen upptäcka saker senare. En transparent annons sparar tid och bygger förtroende.'],
      ['heading', 2, 'Vad ska finnas med i beskrivningen?'],
      ['paragraph', 1, 'Beskriv bilens skick, utrustning, servicehistorik och varför den säljs. Skriv konkret: årsmodell, miltal, drivmedel, växellåda, besiktning, vinterdäck, nyservad eller större reparationer. Om bilen har skador, säg det tydligt. Seriösa köpare uppskattar ärlighet.'],
      ['paragraph', 1, 'En bra rubrik kan exempelvis vara “Volkswagen Golf 1.5 TSI 2021 med låg miltal och servicebok”. Den hjälper både köpare och sökfunktionen att förstå bilen snabbare.'],
      ['heading', 2, 'Så hjälper Autorell privatpersoner'],
      ['paragraph', 1, 'Autorell är byggt för att göra fordonsannonser tydliga och jämförbara. Du kan skapa en annons, lägga in fordonets viktigaste uppgifter och göra bilen synlig för köpare som söker efter märke, modell, plats och kategori. Det gör processen enklare än att sprida samma information manuellt i flera kanaler.'],
      ['paragraph', 1, 'För privatpersoner är målet enkelt: en professionell annons utan krångel. Ju bättre information du lägger in, desto större chans att rätt köpare kontaktar dig från början.'],
      ['heading', 2, 'Tänk på säkerheten'],
      ['paragraph', 1, 'Bestäm hur provkörning ska ske, kontrollera identitet vid affär och använd säkra betalningsmetoder. Lämna inte ifrån dig bilen innan betalningen är bekräftad. En tydlig process skyddar både säljare och köpare.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T07:30:00.000Z',
    updatedAt: '2026-07-16T07:30:00.000Z',
    readingTime: 4,
    category: fallbackCategories[0],
    tags: ['Sälja bil', 'Privatförsäljning', 'Bilannons', 'Trygg affär'],
    imageUrl: '/category-cars-hero-family.webp',
    imageAlt: 'Familj vid bil utanför ett hem',
    imageCaption: null,
    seoTitle: 'Sälja bil privat online | Guide till en bättre bilannons',
    metaDescription: 'Guide för dig som vill sälja bil privat online. Se hur bilder, rubrik, beskrivning och trygg process hjälper dig hitta rätt köpare.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
  {
    id: 'fallback-sell-tractors-and-farm-machinery',
    slug: 'sell-tractors-and-farm-machinery',
    title: 'Sälja traktor och lantbruksmaskiner: så når du rätt köpare',
    excerpt: 'Lantbruksmaskiner kräver tydliga uppgifter, bra bilder och rätt kategori. Så bygger du en annons som fungerar.',
    body: articleDoc([
      ['heading', 2, 'Köpare av lantbruksmaskiner söker specifikt'],
      ['paragraph', 1, 'Den som letar efter traktor, spruta, balpress, plog eller lastare vet ofta exakt vilken kapacitet och utrustning som behövs. Därför måste annonsen vara konkret. Märke, modell, årsmodell, timmar, effekt, däck, hydraulik, frontlastare, redskap och servicehistorik är uppgifter som snabbt avgör om objektet är relevant.'],
      ['paragraph', 1, 'Autorells kategorier gör det enklare att placera maskinen rätt. En traktor ska inte försvinna bland vanliga bilar, och en lantbruksköpare ska kunna filtrera fram rätt typ av maskin utan onödigt arbete.'],
      ['heading', 2, 'Bilderna ska visa skick och funktion'],
      ['paragraph', 1, 'Ta bilder i god belysning och visa maskinen från alla sidor. Lägg extra fokus på däck, redskapsfästen, hytt, reglage, hydraulik, motorutrymme och slitagepunkter. Om maskinen har tillbehör eller redskap som ingår, fotografera även dem separat.'],
      ['paragraph', 1, 'För dyrare lantbruksmaskiner kan en tydlig annons minska antalet irrelevanta frågor. Köparen vill ofta veta om maskinen kan användas direkt, om service är dokumenterad och om transport kan ordnas.'],
      ['heading', 2, 'Sälj över en bredare marknad'],
      ['paragraph', 1, 'Efterfrågan på lantbruksmaskiner varierar mellan regioner och säsonger. En maskin som är svårsåld lokalt kan vara attraktiv i en annan marknad. Genom att strukturera annonsen på Autorell kan objektet bli lättare att hitta för köpare som söker efter rätt kategori, märke och användningsområde.'],
      ['paragraph', 1, 'Det gör Autorell särskilt relevant för lantbrukare, maskinhandlare och företag som vill sälja mer professionellt utan att bygga egna tekniska lösningar.'],
      ['heading', 2, 'En tydlig annons skapar bättre affärer'],
      ['paragraph', 1, 'Ju mer komplett annonsen är, desto snabbare kan en seriös köpare fatta beslut. Ange pris, skick, plats, transportmöjlighet och kontaktväg. Då blir processen enklare för båda parter och chansen ökar att maskinen hamnar hos rätt köpare.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T07:00:00.000Z',
    updatedAt: '2026-07-16T07:00:00.000Z',
    readingTime: 4,
    category: fallbackCategories[2],
    tags: ['Sälja traktor', 'Lantbruksmaskiner', 'Traktor', 'Maskinhandel'],
    imageUrl: '/category-agriculture-hero.jpg',
    imageAlt: 'Lantbruksmaskin på fält i solnedgång',
    imageCaption: null,
    seoTitle: 'Sälja traktor och lantbruksmaskiner | Guide för bättre annonser',
    metaDescription: 'Så säljer du traktor och lantbruksmaskiner online med tydliga bilder, rätt kategori, maskindata och en seriös säljprocess.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
]

function articleDoc(blocks: Array<['heading' | 'paragraph', number, string]>) {
  return {
    type: 'doc',
    content: blocks.map(([type, level, text]) => ({
      type,
      level,
      text,
      bold: false,
    })),
  }
}

function languageForMarket(market: string) {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'de' || normalized === 'at') return 'de'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'es') return 'es'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'it') return 'it'
  if (normalized === 'nl' || normalized === 'be') return 'nl'
  if (normalized === 'fi') return 'fi'
  if (normalized === 'dk') return 'da'
  return 'en'
}

function localizedCategory(translations: unknown, language: string, fallback: string) {
  if (!translations || typeof translations !== 'object') return fallback
  const values = translations as Record<string, unknown>
  return String(values[language] || values.en || fallback)
}

function createContentAdmin() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

function mapArticle(row: Record<string, unknown>, media: Record<string, unknown> | null): PublicNewsArticle {
  const categoryRow = row.content_categories as Record<string, unknown> | null
  const category = categoryRow ? {
    id: String(categoryRow.id),
    key: String(categoryRow.category_key),
    label: localizedCategory(categoryRow.translations, String(row.language), String(categoryRow.category_key)),
  } : null
  const variants = media?.variants && typeof media.variants === 'object'
    ? media.variants as Record<string, { url?: string } | undefined>
    : {}
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt || ''),
    body: row.body && typeof row.body === 'object' ? row.body as Record<string, unknown> : {},
    author: String(row.author_name || 'Autorell Redaktion'),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
    readingTime: Number(row.reading_time_minutes || 1),
    category,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    imageUrl: variants.article?.url || variants.newsCard?.url || variants.thumbnail?.url || String(media?.public_url || '') || null,
    imageAlt: String(media?.alt_text || row.title),
    imageCaption: media?.caption ? String(media.caption) : null,
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    metaDescription: row.meta_description ? String(row.meta_description) : null,
    canonicalUrl: row.canonical_url ? String(row.canonical_url) : null,
    viewCount: Number(row.view_count || 0),
    relatedPostIds: Array.isArray(row.related_post_ids) ? row.related_post_ids.map(String) : [],
  }
}

const publicSelect = 'id,slug,title,excerpt,body,language,market,author_name,published_at,updated_at,reading_time_minutes,tags,seo_title,meta_description,canonical_url,view_count,related_post_ids,hero_media_id,content_categories(id,category_key,translations)'

export async function getVehicleNews(market: string, page = 1, pageSize = 12) {
  const admin = createContentAdmin()
  if (!admin) return { articles: fallbackNewsPage(page, pageSize), categories: fallbackCategories, count: fallbackArticles.length, unavailable: false }
  const language = languageForMarket(market)
  const from = Math.max(0, page - 1) * pageSize
  const { data, count, error } = await admin
    .from('content_posts')
    .select(publicSelect, { count: 'exact' })
    .eq('post_type', 'news')
    .eq('status', 'published')
    .eq('market', market.toUpperCase())
    .eq('language', language)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return { articles: fallbackNewsPage(page, pageSize), categories: fallbackCategories, count: fallbackArticles.length, unavailable: false }
  const rows = (data || []) as unknown as Record<string, unknown>[]
  const mediaIds = rows.map((row) => String(row.hero_media_id || '')).filter(Boolean)
  const { data: mediaRows } = mediaIds.length
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').in('id', mediaIds)
    : { data: [] }
  const mediaById = new Map((mediaRows || []).map((item) => [String(item.id), item as Record<string, unknown>]))
  const { data: categoryRows } = await admin
    .from('content_categories')
    .select('id,category_key,translations')
    .eq('is_active', true)
    .order('sort_order')

  return {
    articles: rows.length ? rows.map((row) => mapArticle(row, mediaById.get(String(row.hero_media_id)) || null)) : fallbackNewsPage(page, pageSize),
    categories: rows.length && categoryRows?.length ? ((categoryRows || []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      key: String(row.category_key),
      label: localizedCategory(row.translations, language, String(row.category_key)),
    })) : fallbackCategories,
    count: rows.length ? count || 0 : fallbackArticles.length,
    unavailable: false,
  }
}

export async function getVehicleNewsArticle(market: string, slug: string, previewToken?: string) {
  const admin = createContentAdmin()
  if (!admin) {
    const fallback = fallbackArticles.find((article) => article.slug === slug)
    return fallback ? { article: fallback, preview: false } : null
  }
  const language = languageForMarket(market)
  let previewPostId = ''
  if (previewToken) {
    const tokenHash = createHash('sha256').update(previewToken).digest('hex')
    const { data: token } = await admin
      .from('content_preview_tokens')
      .select('post_id')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    previewPostId = String(token?.post_id || '')
  }

  let query = admin.from('content_posts').select(publicSelect).eq('slug', slug).eq('market', market.toUpperCase()).eq('language', language)
  query = previewPostId
    ? query.eq('id', previewPostId)
    : query.eq('status', 'published').lte('published_at', new Date().toISOString())
  const { data: row, error } = await query.maybeSingle()
  if (error || !row) {
    const fallback = fallbackArticles.find((article) => article.slug === slug)
    return fallback ? { article: fallback, preview: false } : null
  }
  const typedRow = row as unknown as Record<string, unknown>
  const { data: media } = typedRow.hero_media_id
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').eq('id', String(typedRow.hero_media_id)).maybeSingle()
    : { data: null }
  return { article: mapArticle(typedRow, media as Record<string, unknown> | null), preview: Boolean(previewPostId) }
}

function fallbackNewsPage(page: number, pageSize: number) {
  const from = Math.max(0, page - 1) * pageSize
  return fallbackArticles.slice(from, from + pageSize)
}

export function articleBodyText(body: Record<string, unknown>) {
  return articleBodyBlocks(body).map((block) => block.text)
}

export function articleBodyBlocks(body: Record<string, unknown>): PublicNewsBodyBlock[] {
  const content = Array.isArray(body.content) ? body.content : []
  return content.map((block): PublicNewsBodyBlock | null => {
    if (!block || typeof block !== 'object') return null
    const value = block as Record<string, unknown>
    const text = typeof value.text === 'string' ? value.text.trim() : ''
    if (!text) return null
    const type = value.type === 'heading' ? 'heading' : 'paragraph'
    const level = Number(value.level)
    return {
      type,
      level: type === 'heading' && level >= 1 && level <= 6 ? level as PublicNewsBodyBlock['level'] : 1,
      text,
      bold: Boolean(value.bold),
    }
  }).filter((block): block is PublicNewsBodyBlock => Boolean(block))
}

import { GET as getSitemapIndex } from '@/app/sitemap.xml/route'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  return getSitemapIndex(request)
}

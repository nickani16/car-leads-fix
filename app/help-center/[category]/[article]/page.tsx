import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { HelpCenterArticlePage } from '@/app/components/HelpCenterPages'
import { createPublicMetadata } from '@/lib/public-seo'
import { getHelpCenterArticle, localizedText } from '@/lib/help-center'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; article: string }>
}) {
  const { category, article: articleSlug } = await params
  const article = getHelpCenterArticle(category, articleSlug)
  if (!article) return {}
  const { locale } = await publicRequestContext()
  return createPublicMetadata({
    title: `${localizedText(locale, article.title)} - Autorell`,
    description: localizedText(locale, article.summary),
    path: `/help-center/${category}/${article.slug}`,
    locale,
  })
}

export default async function HelpArticleRoute({
  params,
}: {
  params: Promise<{ category: string; article: string }>
}) {
  const { category, article } = await params
  if (!getHelpCenterArticle(category, article)) notFound()
  const { locale, marketCode } = await publicRequestContext()
  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <HelpCenterArticlePage locale={locale} marketCode={marketCode} categorySlug={category} articleSlug={article} />
      <PublicFooter locale={locale} />
    </main>
  )
}

async function publicRequestContext() {
  const headerStore = await headers()
  const requestedLocale = headerStore.get('x-autorell-language') || 'sv'
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'sv'
  return { locale, marketCode: headerStore.get('x-autorell-market') || undefined }
}

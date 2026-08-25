import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { HelpCenterCategory } from '@/app/components/HelpCenterPages'
import { createPublicMetadata } from '@/lib/public-seo'
import { getHelpCenterCategory, localizedText } from '@/lib/help-center'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params
  const category = getHelpCenterCategory(categorySlug)
  if (!category) return {}
  const { locale } = await publicRequestContext()
  const categoryTitle = localizedText(locale, category.title)
  return createPublicMetadata({
    title: `${categoryTitle} - Autorell`,
    description: localizedText(locale, category.description),
    path: `/help-center/${category.slug}`,
    locale,
  })
}

export default async function HelpCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params
  if (!getHelpCenterCategory(categorySlug)) notFound()
  const { locale, marketCode } = await publicRequestContext()
  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <HelpCenterCategory locale={locale} marketCode={marketCode} categorySlug={categorySlug} />
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

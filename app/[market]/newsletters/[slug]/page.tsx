import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import { getNewsletter, newsletterText } from '@/lib/newsletters/public'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params, searchParams }: { params: Promise<{ market: string; slug: string }>; searchParams: Promise<{ preview?: string }> }): Promise<Metadata> {
  const { market, slug } = await params; const preview = (await searchParams).preview
  const result = await getNewsletter(market, slug, preview)
  return result ? { title: `${result.campaign.subject} | Autorell`, description: result.campaign.preview_text || result.campaign.introduction, robots: result.preview ? { index: false, follow: false, noarchive: true } : undefined } : {}
}
export default async function NewsletterPage({ params, searchParams }: { params: Promise<{ market: string; slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { market, slug } = await params; const preview = (await searchParams).preview
  const result = await getNewsletter(market, slug, preview); if (!result) notFound()
  const campaign = result.campaign; const locale = market === 'se' ? 'sv' : market === 'de' ? 'de' : 'en'
  return <main className="min-h-screen bg-white text-[#101828]"><PublicHeader locale={locale} marketCode={market.toUpperCase()} />
    {result.preview ? <div className="bg-amber-100 px-4 py-3 text-center text-sm font-bold text-amber-900">Säkert testutskick – inte publikt och indexeras inte.</div> : null}
    <article className="mx-auto max-w-[820px] px-5 py-12 sm:px-8 sm:py-16"><Link href={`/${market}/newsletters`} className="text-sm font-bold text-[#0866ff]">Nyhetsbrevsarkiv</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Autorell nyhetsbrev</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">{campaign.subject}</h1><p className="mt-6 text-xl leading-8 text-[#667085]">{campaign.introduction || campaign.preview_text}</p><div className="mt-10 whitespace-pre-wrap text-lg leading-8 text-[#344054]">{newsletterText(campaign.content)}</div></article>
    <PublicFooter locale={locale} /></main>
}

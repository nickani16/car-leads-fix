import Link from 'next/link'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import { getPublicNewsletters } from '@/lib/newsletters/public'

export const dynamic = 'force-dynamic'

export default async function NewslettersPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  const items = await getPublicNewsletters(market)
  const locale = market === 'se' ? 'sv' : market === 'de' ? 'de' : 'en'
  return <main className="min-h-screen bg-[#f6f8fc] text-[#101828]"><PublicHeader locale={locale} marketCode={market.toUpperCase()} />
    <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Autorell</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Nyhetsbrevsarkiv</h1><p className="mt-5 max-w-2xl text-lg text-[#667085]">Publicerade utskick om fordon, marknaden och tryggare affärer.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">{items.map((item) => <Link key={item.id} href={`/${market}/newsletters/${item.slug}`} className="rounded-2xl border border-[#dce3ee] bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><p className="text-xs text-[#667085]">{new Date(item.public_at || item.sent_at).toLocaleDateString('sv-SE')}</p><h2 className="mt-3 text-xl font-bold">{item.subject}</h2><p className="mt-3 text-sm leading-6 text-[#667085]">{item.preview_text || item.introduction}</p></Link>)}</div>
      {!items.length ? <p className="mt-10 rounded-2xl border border-dashed p-8 text-[#667085]">Inga publika nyhetsbrev ännu.</p> : null}
    </section><PublicFooter locale={locale} /></main>
}

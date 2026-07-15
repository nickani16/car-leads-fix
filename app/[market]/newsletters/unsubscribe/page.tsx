import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'

export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ market: string }>; searchParams: Promise<{ token?: string; done?: string; error?: string }> }) {
  const { market } = await params; const query = await searchParams; const locale = market === 'se' ? 'sv' : market === 'de' ? 'de' : 'en'
  return <main className="min-h-screen bg-[#f6f8fc]"><PublicHeader locale={locale} marketCode={market.toUpperCase()} /><section className="mx-auto max-w-[620px] px-5 py-20"><div className="rounded-2xl border border-[#dce3ee] bg-white p-8 shadow-sm"><h1 className="text-3xl font-bold">Avsluta prenumeration</h1>{query.done ? <p className="mt-4 text-[#475467]">Din prenumeration är avslutad.</p> : query.error ? <p className="mt-4 text-red-700">Länken är ogiltig eller har gått ut.</p> : <><p className="mt-4 text-[#667085]">Bekräfta att du inte längre vill få Autorells nyhetsbrev.</p><form method="post" action="/api/newsletter/unsubscribe" className="mt-6"><input type="hidden" name="token" value={query.token || ''}/><input type="hidden" name="market" value={market}/><button className="rounded-xl bg-[#101828] px-5 py-3 font-bold text-white">Bekräfta avregistrering</button></form></>}</div></section><PublicFooter locale={locale} /></main>
}

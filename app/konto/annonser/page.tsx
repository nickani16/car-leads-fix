import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AccountListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto/annonser')

  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select('id,title,status,category,price,currency,created_at')
    .eq('seller_user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">
            Konto
          </p>
          <h1 className="mt-3 text-4xl tracking-[-.04em]">Dina annonser</h1>
        </div>
        <Link
          href="/salj-fordon"
          className="rounded-[14px] bg-[#0866ff] px-5 py-3 text-sm font-bold text-white"
        >
          Skapa annons
        </Link>
      </div>

      <div className="mt-8 grid gap-3">
        {data?.length ? (
          data.map((listing) => (
            <article key={listing.id} className="rounded-[18px] border bg-white p-5">
              <strong>{listing.title}</strong>
              <p className="mt-1 text-sm text-[#667085]">
                {listing.category} · {listing.status} ·{' '}
                {Number(listing.price).toLocaleString('sv-SE')} {listing.currency}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed bg-white p-10 text-center text-[#667085]">
            Du har inga annonser ännu.
          </div>
        )}
      </div>
    </main>
  )
}

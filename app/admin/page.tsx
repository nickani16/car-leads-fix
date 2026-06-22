import { CheckCircle2, Clock3, FileText, PauseCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const supabase = createAdminClient()
  const [{ count: published }, { count: review }, { count: paused }, { data }] =
    await Promise.all([
      supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_review'),
      supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'paused'),
      supabase
        .from('marketplace_listings')
        .select('id,title,category,status,country_code,price,currency,seller_name,created_at')
        .order('created_at', { ascending: false })
        .limit(30),
    ])

  return (
    <main className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">
        Marketplace operations
      </p>
      <h1 className="mt-3 text-4xl tracking-[-.04em]">
        Listings and platform quality
      </h1>
      <p className="mt-3 max-w-3xl text-[#667085]">
        Moderate listings, monitor marketplace health and support user accounts.
        Autorell is not a buyer, bidder or contracting vehicle seller.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric icon={CheckCircle2} label="Published" value={published || 0} />
        <Metric icon={Clock3} label="Pending review" value={review || 0} />
        <Metric icon={PauseCircle} label="Paused" value={paused || 0} />
      </section>

      <section className="mt-8 overflow-hidden rounded-[22px] border border-[#e1e5ec] bg-white">
        <div className="border-b border-[#e1e5ec] px-5 py-4">
          <h2 className="font-bold">Latest listings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase tracking-[.08em] text-[#667085]">
              <tr>
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Market</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((listing) => (
                <tr key={listing.id} className="border-t border-[#eaecf0]">
                  <td className="px-5 py-4"><strong>{listing.title}</strong><span className="mt-1 block text-xs text-[#667085]">{listing.category} · {listing.id}</span></td>
                  <td className="px-5 py-4">{listing.seller_name}</td>
                  <td className="px-5 py-4">{listing.country_code}</td>
                  <td className="px-5 py-4">{Number(listing.price).toLocaleString()} {listing.currency}</td>
                  <td className="px-5 py-4">{listing.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
  label: string
  value: number
}) {
  return (
    <article className="rounded-[20px] border border-[#e1e5ec] bg-white p-6">
      <Icon className="h-5 w-5 text-[#0866ff]" />
      <strong className="mt-5 block text-3xl">{value}</strong>
      <span className="mt-1 block text-sm text-[#667085]">{label}</span>
    </article>
  )
}

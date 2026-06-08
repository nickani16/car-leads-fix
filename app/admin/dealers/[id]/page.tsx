import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminPageHeader,
  Badge,
  DetailCard,
  DetailGrid,
} from '../../AdminUI'
import DealerStatusActions from '../../DealerStatusActions'

export default async function AdminDealerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { adminClient } = await requireAdmin()
  const { data: dealer } = await adminClient
    .from('dealers')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!dealer) notFound()

  const [{ data: bids }, { data: deals }, { data: acceptance }] =
    await Promise.all([
      adminClient
        .from('bids')
        .select('id,lead_id,amount,created_at,is_winner')
        .eq('dealer_id', dealer.user_id)
        .order('created_at', { ascending: false }),
      adminClient
        .from('deals')
        .select('id,status,winning_bid_amount,buyer_total_amount,created_at')
        .eq('buyer_dealer_id', dealer.id)
        .order('created_at', { ascending: false }),
      adminClient
        .from('dealer_legal_acceptances')
        .select(
          'accepted_by_name,accepted_email,dealer_terms_version,privacy_notice_version,accepted_at,ip_address,user_agent'
        )
        .eq('user_id', dealer.user_id)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Dealer detail"
        title={dealer.company_name || 'Unnamed dealer'}
        description={`${dealer.contact_person || 'No contact person'} · ${dealer.email || 'No email'}`}
        backHref="/admin/dealers"
      />

      <div className="mb-7 flex flex-wrap items-center gap-3">
        <Badge
          label={dealer.status || 'pending'}
          tone={
            dealer.status === 'approved'
              ? 'green'
              : dealer.status === 'rejected'
                ? 'red'
                : 'amber'
          }
        />
        <Badge
          label={dealer.country_code || dealer.country || 'Unknown country'}
          tone="gray"
        />
        <Badge label={`${bids?.length || 0} bids`} />
        <Badge label={`${deals?.length || 0} won deals`} tone="blue" />
      </div>

      <div className="grid gap-7 xl:grid-cols-[1fr_.8fr]">
        <div className="space-y-7">
          <DetailCard title="Company and contact">
            <DetailGrid
              items={[
                { label: 'Company', value: dealer.company_name },
                { label: 'VAT number', value: dealer.vat_number },
                { label: 'Country', value: dealer.country },
                { label: 'Country code', value: dealer.country_code },
                { label: 'Contact person', value: dealer.contact_person },
                { label: 'Email', value: dealer.email },
                { label: 'Phone', value: dealer.phone },
                { label: 'Auth user ID', value: dealer.user_id },
                { label: 'Created', value: dealer.created_at },
              ]}
            />
          </DetailCard>

          <DetailCard title="Account decision">
            <p className="mb-5 text-sm leading-6 text-[#62686c]">
              Approve only after company, VAT, authorised contact and legal
              acceptance have been verified.
            </p>
            <DealerStatusActions
              dealerId={dealer.id}
              currentStatus={dealer.status || 'pending'}
            />
          </DetailCard>

          <DetailCard title="Legal acceptance">
            {acceptance ? (
              <DetailGrid
                items={[
                  { label: 'Accepted by', value: acceptance.accepted_by_name },
                  { label: 'Email', value: acceptance.accepted_email },
                  { label: 'Dealer terms', value: acceptance.dealer_terms_version },
                  { label: 'Privacy notice', value: acceptance.privacy_notice_version },
                  { label: 'Accepted at', value: acceptance.accepted_at },
                  { label: 'IP address', value: acceptance.ip_address },
                  { label: 'User agent', value: acceptance.user_agent },
                ]}
              />
            ) : (
              <p className="text-sm text-amber-700">
                No recorded legal acceptance. Do not approve this account
                without manual review.
              </p>
            )}
          </DetailCard>
        </div>

        <div className="space-y-7">
          <DetailCard title={`Recent bids (${bids?.length || 0})`}>
            <div className="space-y-3">
              {bids?.slice(0, 12).map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between rounded-[14px] bg-[#f8f7f3] p-4"
                >
                  <div>
                    <p className="font-medium">
                      €{Number(bid.amount).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#73797c]">
                      Lead {bid.lead_id}
                    </p>
                  </div>
                  {bid.is_winner && <Badge label="Winner" tone="green" />}
                </div>
              ))}
              {!bids?.length && <p className="text-sm text-[#73797c]">No bids.</p>}
            </div>
          </DetailCard>

          <DetailCard title={`Won deals (${deals?.length || 0})`}>
            <div className="space-y-3">
              {deals?.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-[14px] bg-[#f8f7f3] p-4"
                >
                  <div className="flex justify-between gap-4">
                    <p className="font-medium">
                      €{Number(deal.winning_bid_amount).toLocaleString()}
                    </p>
                    <Badge label={deal.status} />
                  </div>
                  <p className="mt-1 text-xs text-[#73797c]">
                    Buyer total €{Number(deal.buyer_total_amount).toLocaleString()}
                  </p>
                </div>
              ))}
              {!deals?.length && (
                <p className="text-sm text-[#73797c]">No won deals.</p>
              )}
            </div>
          </DetailCard>
        </div>
      </div>
    </main>
  )
}


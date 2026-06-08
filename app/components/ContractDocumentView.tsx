import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Badge } from '@/app/admin/AdminUI'
import PrintContractButton from './PrintContractButton'

type ContractDocument = {
  id: string
  document_type: string
  version: number
  status: string
  template_version: string
  snapshot: Record<string, unknown>
  content_hash: string
  created_at: string
}

type Party = {
  legal_name?: string | null
  email?: string | null
  phone?: string | null
  registration_number?: string | null
  vat_number?: string | null
  registered_address?: string | null
  country_code?: string | null
}

type Vehicle = {
  reg?: string | null
  make?: string | null
  model?: string | null
  model_year?: string | null
  miles?: string | null
  vin?: string | null
  fuel_type?: string | null
  gearbox?: string | null
  damage?: string | null
  damage_description?: string | null
}

type Pricing = {
  currency?: string
  winning_bid_amount?: number | string
  seller_net_amount?: number | string
  commission_amount?: number | string
  transport_fee?: number | string
  export_document_fee?: number | string
  buyer_total_amount?: number | string
}

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const documentNames: Record<string, string> = {
  seller_purchase_agreement: 'Seller agreement',
  buyer_resale_agreement: 'Buyer agreement',
}

function objectValue<T>(snapshot: Record<string, unknown>, key: string): T {
  return (snapshot[key] || {}) as T
}

export default function ContractDocumentView({
  document,
  backHref,
}: {
  document: ContractDocument
  backHref: string
}) {
  const snapshot = document.snapshot || {}
  const vehicle = objectValue<Vehicle>(snapshot, 'vehicle')
  const pricing = objectValue<Pricing>(snapshot, 'pricing')
  const autorell = objectValue<Party>(snapshot, 'autorell')
  const seller = objectValue<Party>(snapshot, 'seller')
  const buyer = objectValue<Party>(snapshot, 'buyer')
  const otherParty = document.document_type === 'seller_purchase_agreement'
    ? seller
    : buyer
  const otherPartyTitle =
    document.document_type === 'seller_purchase_agreement' ? 'Seller' : 'Buyer'
  const blockers = Array.isArray(snapshot.blockers)
    ? snapshot.blockers.filter((item): item is string => typeof item === 'string')
    : []
  const ready = document.status === 'ready'
  const sentOrSigned = ['sent', 'signed'].includes(document.status)

  return (
    <main className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#62686c]"
      >
        <ArrowLeft size={16} />
        Back to contracts
      </Link>

      <section className="overflow-hidden rounded-[24px] border border-[#deddd7] bg-white shadow-[0_24px_70px_rgba(32,33,36,.07)]">
        <header className="border-b border-[#e7e5df] bg-[#faf9f6] px-7 py-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#73797c]">
                Autorell contract draft
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                {documentNames[document.document_type] || document.document_type}
              </h1>
              <p className="mt-2 text-sm text-[#62686c]">
                Version {document.version} · {document.template_version}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={document.status} tone={ready ? 'green' : 'amber'} />
              <Badge label="locked snapshot" tone="gray" />
            </div>
          </div>
          {!sentOrSigned && (
            <div className="mt-6 rounded-[16px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>DRAFT - NOT FOR SIGNATURE.</strong>{' '}
              {ready
                ? 'Required data is complete, but legal wording and the signing workflow must still be approved.'
                : 'This document cannot be sent until all blockers are cleared and legal wording is approved.'}
            </div>
          )}
        </header>

        <div className="grid gap-6 p-7 lg:grid-cols-2">
          <Panel title="Vehicle">
            <Data label="Registration" value={vehicle.reg} />
            <Data label="Vehicle" value={`${vehicle.make || ''} ${vehicle.model || ''}`} />
            <Data label="Model year" value={vehicle.model_year} />
            <Data label="Mileage" value={vehicle.miles} />
            <Data label="VIN" value={vehicle.vin} />
            <Data label="Fuel" value={vehicle.fuel_type} />
            <Data label="Gearbox" value={vehicle.gearbox} />
            <Data label="Declared condition" value={vehicle.damage} />
            <Data label="Damage notes" value={vehicle.damage_description} />
          </Panel>

          <Panel title="Pricing">
            <Data label="Currency" value={pricing.currency || 'EUR'} />
            <Data label="Winning bid" value={formatMoney(pricing.winning_bid_amount)} />
            <Data label="Seller net amount" value={formatMoney(pricing.seller_net_amount)} />
            <Data label="Autorell fee" value={formatMoney(pricing.commission_amount)} />
            <Data label="Transport" value={formatMoney(pricing.transport_fee)} />
            <Data label="Export/documentation" value={formatMoney(pricing.export_document_fee)} />
            <Data label="Buyer total" value={formatMoney(pricing.buyer_total_amount)} />
          </Panel>

          <Panel title="Autorell">
            <Data label="Legal name" value={autorell.legal_name} />
            <Data label="Registration number" value={autorell.registration_number} />
            <Data label="VAT number" value={autorell.vat_number} />
            <Data label="Registered address" value={autorell.registered_address} />
            <Data label="Country" value={autorell.country_code} />
            <Data label="Email" value={autorell.email} />
          </Panel>

          <Panel title={otherPartyTitle}>
            <Data label="Legal name" value={otherParty.legal_name} />
            <Data label="Registration number" value={otherParty.registration_number} />
            <Data label="VAT number" value={otherParty.vat_number} />
            <Data label="Registered address" value={otherParty.registered_address} />
            <Data label="Country" value={otherParty.country_code} />
            <Data label="Email" value={otherParty.email} />
            <Data label="Phone" value={otherParty.phone} />
          </Panel>
        </div>

        <section className="border-t border-[#e7e5df] p-7">
          <div className="flex items-start gap-3 rounded-[16px] bg-[#f6f8f9] p-5">
            <ShieldCheck className="mt-0.5 text-[#52768a]" size={20} />
            <div className="min-w-0">
              <h2 className="font-semibold">Integrity record</h2>
              <p className="mt-1 break-all text-xs text-[#62686c]">
                SHA-256: {document.content_hash}
              </p>
              <p className="mt-2 text-xs text-[#62686c]">
                Created {new Date(document.created_at).toLocaleString('sv-SE')}
              </p>
            </div>
          </div>

          {blockers.length > 0 && (
            <div className="mt-5 rounded-[16px] border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-950">
                Remaining blockers
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-amber-900">
                {blockers.map((blocker) => (
                  <li key={blocker}>{blocker.replaceAll('_', ' ')}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </section>

      <PrintContractButton />
    </main>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[18px] border border-[#deddd7] bg-[#fbfaf7] p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <dl className="space-y-3">{children}</dl>
    </section>
  )
}

function Data({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#858a8c]">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm text-[#242424]">
        {value || 'Missing'}
      </dd>
    </div>
  )
}

function formatMoney(value?: string | number | null) {
  return money.format(Number(value || 0))
}

import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import PrintContractButton from './PrintContractButton'

type ContractDocument = {
  id: string
  deal_id: string
  document_type: string
  version: number
  status: string
  template_version: string
  snapshot: Record<string, unknown>
  content_hash: string
  created_at: string
  final_approved_at?: string | null
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
  inspection_fee?: number | string
  transport_fee?: number | string
  export_document_fee?: number | string
  buyer_total_amount?: number | string
}

type DealSnapshot = {
  origin_country?: string | null
  origin_city?: string | null
  origin_postal_code?: string | null
  destination_country?: string | null
  destination_city?: string | null
  destination_postal_code?: string | null
  inspection_fee?: number | string | null
  inspection_name?: string | null
}

type ContractTerm = {
  title?: string
  text?: string
}

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const documentNames: Record<string, string> = {
  seller_purchase_agreement: 'Vehicle Purchase Agreement',
  buyer_resale_agreement: 'Vehicle Sale Agreement',
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
  const deal = objectValue<DealSnapshot>(snapshot, 'deal')
  const autorell = objectValue<Party>(snapshot, 'autorell')
  const seller = objectValue<Party>(snapshot, 'seller')
  const buyer = objectValue<Party>(snapshot, 'buyer')
  const snapshotTerms = Array.isArray(snapshot.terms)
    ? snapshot.terms.filter(
        (item): item is ContractTerm =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as ContractTerm).title === 'string' &&
          typeof (item as ContractTerm).text === 'string'
      )
    : []
  const counterparty =
    document.document_type === 'seller_purchase_agreement' ? seller : buyer
  const counterpartyTitle =
    document.document_type === 'seller_purchase_agreement' ? 'Seller' : 'Buyer'
  const blockers = Array.isArray(snapshot.blockers)
    ? snapshot.blockers.filter((item): item is string => typeof item === 'string')
    : []
  const ready = document.status === 'ready'
  const finalApproved = Boolean(document.final_approved_at)
  const sentOrSigned = ['sent', 'signed'].includes(document.status)

  return (
    <main className="contract-review mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="contract-toolbar mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-[#62686c]"
        >
          <ArrowLeft size={16} />
          Back to contracts
        </Link>
        <PrintContractButton />
      </div>

      <article className="contract-sheet relative overflow-hidden bg-white">
        {!sentOrSigned && !finalApproved && (
          <div className="contract-watermark" aria-hidden="true">
            DRAFT
          </div>
        )}

        <header className="contract-document-header">
          <BrandLogo />
          <div className="contract-reference">
            <p>Document reference</p>
            <strong>{document.id.slice(0, 8).toUpperCase()}</strong>
            <span>Version {document.version}</span>
          </div>
        </header>

        <section className="contract-title-block">
          <p className="contract-kicker">Autorell transaction document</p>
          <h1>{documentNames[document.document_type] || 'Vehicle Agreement'}</h1>
          <p>
            Deal reference {document.deal_id} · Generated{' '}
            {new Date(document.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </section>

        {!sentOrSigned && (
          <section className={`contract-notice ${ready ? 'contract-notice-ready' : ''}`}>
            <strong>
              {finalApproved
                ? 'FINAL VERSION - APPROVED FOR SIGNATURE'
                : 'DRAFT - NOT FOR SIGNATURE'}
            </strong>
            <p>
              {finalApproved
                ? 'Autorell has approved this exact document version for the electronic signing workflow. It becomes executed only after all required signatures have been completed.'
                : ready
                ? 'Required transaction data is complete. Final legal wording and signing approval remain outstanding.'
                : 'Required transaction information is incomplete. This document has no signing effect.'}
            </p>
          </section>
        )}

        <section className="contract-section">
          <SectionHeading number="01" title="Contracting parties" />
          <div className="contract-party-grid">
            <PartyCard title="Autorell" party={autorell} />
            <PartyCard title={counterpartyTitle} party={counterparty} />
          </div>
        </section>

        <section className="contract-section">
          <SectionHeading number="02" title="Vehicle" />
          <dl className="contract-data-grid">
            <Data label="Registration" value={vehicle.reg} important />
            <Data
              label="Make and model"
              value={[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
              important
            />
            <Data label="Model year" value={vehicle.model_year} />
            <Data label="Mileage" value={vehicle.miles} />
            <Data label="VIN" value={vehicle.vin} />
            <Data label="Fuel" value={vehicle.fuel_type} />
            <Data label="Transmission" value={vehicle.gearbox} />
            <Data label="Declared condition" value={vehicle.damage} />
          </dl>
          {vehicle.damage_description && (
            <div className="contract-note">
              <span>Condition notes</span>
              <p>{vehicle.damage_description}</p>
            </div>
          )}
        </section>

        <section className="contract-section">
          <SectionHeading number="03" title="Commercial terms" />
          <div className="contract-price-box">
            {document.document_type === 'seller_purchase_agreement' ? (
              <>
                <PriceLine label="Purchase price payable to seller" value={pricing.seller_net_amount} primary />
                <PriceLine label="Winning dealer bid" value={pricing.winning_bid_amount} />
              </>
            ) : (
              <>
                <PriceLine label="Vehicle price" value={pricing.winning_bid_amount} />
                <PriceLine label="Autorell buyer fee" value={pricing.commission_amount} />
                <PriceLine
                  label={deal.inspection_name || 'Autorell Verified Inspection'}
                  value={pricing.inspection_fee || deal.inspection_fee}
                />
                <PriceLine label="Transport" value={pricing.transport_fee} />
                <PriceLine label="Export and documentation" value={pricing.export_document_fee} />
                <PriceLine label="Total payable by buyer" value={pricing.buyer_total_amount} primary />
              </>
            )}
            <p className="contract-currency">Currency: {pricing.currency || 'EUR'}</p>
            <p className="contract-currency">
              Route:{' '}
              {formatLocation(
                deal.origin_city,
                deal.origin_postal_code,
                deal.origin_country
              )}{' '}
              →{' '}
              {formatLocation(
                deal.destination_city,
                deal.destination_postal_code,
                deal.destination_country
              )}
            </p>
          </div>
        </section>

        <section className="contract-section">
          <SectionHeading number="04" title="Transaction framework" />
          <div className="contract-clauses">
            {(snapshotTerms.length > 0
              ? snapshotTerms
              : legacyTerms
            ).map((term) => (
              <Clause
                key={term.title}
                title={term.title || ''}
                text={term.text || ''}
              />
            ))}
          </div>
        </section>

        {blockers.length > 0 && (
          <section className="contract-section contract-blockers">
            <SectionHeading number="05" title="Outstanding information" />
            <ul>
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker.replaceAll('_', ' ')}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="contract-integrity">
          <ShieldCheck size={19} />
          <div>
            <strong>Document integrity record</strong>
            <p>SHA-256 {document.content_hash}</p>
            <p>
              Template {document.template_version} · Status {document.status}
              {document.final_approved_at
                ? ` · Approved ${new Date(document.final_approved_at).toLocaleString('en-GB')}`
                : ''}
            </p>
          </div>
        </footer>
      </article>
    </main>
  )
}

const legacyTerms: ContractTerm[] = [
  {
    title: 'Vehicle and disclosures',
    text: 'The vehicle identity, mileage, declared condition and supporting information shown in this document form part of the transaction record.',
  },
  {
    title: 'Payment and completion',
    text: "Payment, collection, document release and completion are subject to Autorell's final approved transaction terms and verification requirements.",
  },
  {
    title: 'Risk and ownership',
    text: 'Risk and ownership transfer at the point specified in the final signed agreement and handover documentation.',
  },
  {
    title: 'Status of this draft',
    text: 'This generated document is a locked transaction snapshot. It is not binding until released through the approved signing workflow and signed by the required parties.',
  },
]

function formatLocation(
  city?: string | null,
  postalCode?: string | null,
  country?: string | null
) {
  return [postalCode, city, country].filter(Boolean).join(' ') || 'Pending'
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="contract-section-heading">
      <span>{number}</span>
      <h2>{title}</h2>
    </div>
  )
}

function PartyCard({ title, party }: { title: string; party: Party }) {
  return (
    <section className="contract-party-card">
      <p className="contract-party-label">{title}</p>
      <h3>{party.legal_name || 'Information pending'}</h3>
      {party.registration_number && <p>Registration no. {party.registration_number}</p>}
      {party.vat_number && <p>VAT no. {party.vat_number}</p>}
      {party.registered_address && <p>{party.registered_address}</p>}
      {party.country_code && <p>{party.country_code}</p>}
      {party.email && <p>{party.email}</p>}
      {party.phone && <p>{party.phone}</p>}
    </section>
  )
}

function Data({ label, value, important = false }: { label: string; value?: string | number | null; important?: boolean }) {
  if (!value) return null
  return (
    <div className={important ? 'contract-data-important' : ''}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function PriceLine({ label, value, primary = false }: { label: string; value?: string | number | null; primary?: boolean }) {
  return (
    <div className={primary ? 'contract-price-primary' : ''}>
      <span>{label}</span>
      <strong>{money.format(Number(value || 0))}</strong>
    </div>
  )
}

function Clause({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

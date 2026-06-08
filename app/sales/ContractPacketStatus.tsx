import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react'
import { Badge } from '@/app/admin/AdminUI'

const blockerLabels: Record<string, string> = {
  seller_legal_name: 'Seller legal name',
  seller_registered_address: 'Seller registered address',
  buyer_legal_name: 'Buyer legal name',
  buyer_vat_number: 'Buyer VAT number',
  autorell_legal_entity: 'Autorell company number and registered address',
}

export default function ContractPacketStatus({
  packet,
  activeDocumentCount,
  latestVersion,
}: {
  packet:
    | {
        status: string
        blockers: unknown
        template_version: string
        generated_at: string
      }
    | undefined
  activeDocumentCount: number
  latestVersion: number
}) {
  if (!packet) {
    return (
      <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Contract packet has not been generated yet.
      </div>
    )
  }

  const blockers = Array.isArray(packet.blockers)
    ? packet.blockers.filter((item): item is string => typeof item === 'string')
    : []
  const ready = packet.status === 'draft_ready'

  return (
    <div
      className={`mt-5 rounded-[16px] border p-4 ${
        ready
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {ready ? (
          <CheckCircle2 className="mt-0.5 text-emerald-700" size={19} />
        ) : (
          <AlertTriangle className="mt-0.5 text-amber-700" size={19} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">Contract packet</p>
            <Badge
              label={packet.status.replaceAll('_', ' ')}
              tone={ready ? 'green' : 'amber'}
            />
          </div>
          <p className="mt-1 flex items-center gap-2 text-xs text-[#697074]">
            <FileText size={14} />
            {activeDocumentCount} current documents · version {latestVersion} ·{' '}
            {packet.template_version}
          </p>
          {blockers.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-amber-900">
              {blockers.map((blocker) => (
                <li key={blocker}>
                  Missing: {blockerLabels[blocker] || blocker}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

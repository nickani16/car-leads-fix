export const AUTORELL_ESTIMATED_TRANSPORT_FEE = 850
export const AUTORELL_EXPORT_DOCUMENT_FEE = 149

export function calculateEstimatedBuyerTotal(bidAmount: number) {
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) return 0

  return (
    bidAmount +
    AUTORELL_ESTIMATED_TRANSPORT_FEE +
    AUTORELL_EXPORT_DOCUMENT_FEE
  )
}

export const AUTORELL_BUYER_FEE = 399
export const AUTORELL_INSPECTION_FEE = 249
export const AUTORELL_ESTIMATED_TRANSPORT_FEE = 850
export const AUTORELL_EXPORT_DOCUMENT_FEE = 149

export function calculateEstimatedBuyerTotal(bidAmount: number) {
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) return 0

  return (
    bidAmount +
    AUTORELL_BUYER_FEE +
    AUTORELL_INSPECTION_FEE +
    AUTORELL_ESTIMATED_TRANSPORT_FEE +
    AUTORELL_EXPORT_DOCUMENT_FEE
  )
}

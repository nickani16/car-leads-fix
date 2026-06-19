export const AUTORELL_BUYER_FEE_PERCENT = 0.03
export const AUTORELL_MINIMUM_BUYER_FEE = 750
export const AUTORELL_INSPECTION_FEE = 249
export const AUTORELL_ESTIMATED_TRANSPORT_FEE = 850
export const AUTORELL_EXPORT_DOCUMENT_FEE = 149

export function calculateBuyerFee(vehiclePrice: number) {
  if (!Number.isFinite(vehiclePrice) || vehiclePrice <= 0) return 0

  return (
    Math.round(
      Math.max(
        AUTORELL_MINIMUM_BUYER_FEE,
        vehiclePrice * AUTORELL_BUYER_FEE_PERCENT
      ) * 100
    ) / 100
  )
}

export function calculateEstimatedBuyerTotal(bidAmount: number) {
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) return 0

  return (
    bidAmount +
    calculateBuyerFee(bidAmount) +
    AUTORELL_INSPECTION_FEE +
    AUTORELL_ESTIMATED_TRANSPORT_FEE +
    AUTORELL_EXPORT_DOCUMENT_FEE
  )
}

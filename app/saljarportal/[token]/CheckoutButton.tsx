import ListingPackageCheckoutButton from '@/app/components/ListingPackageCheckoutButton'
import type { ListingPackage } from '@/lib/listing-packages'

export default function CheckoutButton({
  token,
  packageId,
  disabled,
}: {
  token: string
  packageId: ListingPackage
  disabled?: boolean
}) {
  return (
    <ListingPackageCheckoutButton
      token={token}
      packageId={packageId}
      disabled={disabled}
    />
  )
}

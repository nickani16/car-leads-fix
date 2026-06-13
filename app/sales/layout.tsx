import { requireSales } from '@/lib/sales-auth'
import InactivityLogout from '@/app/components/InactivityLogout'
import SalesShell from './SalesShell'

export default async function SalesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { staffUser } = await requireSales()

  return (
    <>
      <InactivityLogout />
      <SalesShell name={staffUser.display_name || staffUser.email}>
        {children}
      </SalesShell>
    </>
  )
}

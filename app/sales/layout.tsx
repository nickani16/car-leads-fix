import { requireSales } from '@/lib/sales-auth'
import SalesShell from './SalesShell'

export default async function SalesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { staffUser } = await requireSales()

  return (
    <SalesShell name={staffUser.display_name || staffUser.email}>
      {children}
    </SalesShell>
  )
}

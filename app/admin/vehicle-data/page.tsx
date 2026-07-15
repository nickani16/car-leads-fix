import { marketplaceCategories } from '@/lib/marketplace'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, AdminTable, Badge } from '../AdminUI'

export default async function AdminVehicleDataPage() {
  await requireAdminPermission('vehicle_data.read')
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Taxonomi"
        title="Fordonsdata"
        description="Aktiva fordonskategorier och deras lokaliserade publika namn. Taxonomin är kodstyrd eftersom ändringar påverkar sök, SEO och befintliga annonser."
      />
      <AdminTable columns={['Nyckel', 'Svenska', 'English', 'Deutsch', 'Status']}>
        {marketplaceCategories.map((category) => (
          <tr key={category.slug} className="hover:bg-[#f8fafc]">
            <td className="px-4 py-4 font-mono text-xs">{category.slug}</td>
            <td className="px-4 py-4 font-bold">{category.labels.sv}</td>
            <td className="px-4 py-4">{category.labels.en}</td>
            <td className="px-4 py-4">{category.labels.de}</td>
            <td className="px-4 py-4"><Badge label="Aktiv" tone="green" /></td>
          </tr>
        ))}
      </AdminTable>
    </main>
  )
}

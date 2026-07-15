import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, AdminTable, Badge } from '../AdminUI'

const markets = [
  ['SE', 'Svenska', 'SEK'],
  ['DE', 'Deutsch', 'EUR'],
  ['FR', 'Français', 'EUR'],
  ['IT', 'Italiano', 'EUR'],
  ['ES', 'Español', 'EUR'],
  ['NL', 'Nederlands', 'EUR'],
  ['BE', 'Nederlands / Français', 'EUR'],
  ['AT', 'Deutsch', 'EUR'],
  ['FI', 'Suomi / Svenska', 'EUR'],
  ['DK', 'Dansk', 'DKK'],
  ['PL', 'Polski', 'PLN'],
]

export default async function AdminMarketsPage() {
  await requireAdminPermission('markets.read')
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Lokalisering"
        title="Marknader & språk"
        description="Plattformens aktiverade marknader, lokala språk och betalvalutor. Ändringar görs via granskad konfiguration för att skydda URL:er, priser och översättningar."
      />
      <AdminTable columns={['Marknad', 'Språk', 'Valuta', 'Status']}>
        {markets.map(([country, language, currency]) => (
          <tr key={country} className="hover:bg-[#f8fafc]">
            <td className="px-4 py-4 font-bold">{country}</td>
            <td className="px-4 py-4">{language}</td>
            <td className="px-4 py-4">{currency}</td>
            <td className="px-4 py-4"><Badge label="Aktiv" tone="green" /></td>
          </tr>
        ))}
      </AdminTable>
    </main>
  )
}

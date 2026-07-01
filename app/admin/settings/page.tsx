import { requireAdmin } from '@/lib/admin-auth'
import { AdminPageHeader, DetailCard, DetailGrid } from '../AdminUI'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const { adminUser } = await requireAdmin()

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="System"
        title="Inställningar"
        description="Admininställningar och säkerhetsprinciper för Autorells interna kontrollcenter."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <DetailCard title="Din adminroll">
          <DetailGrid
            items={[
              { label: 'Roll', value: adminUser.role },
              { label: 'Aktiv', value: adminUser.is_active ? 'Ja' : 'Nej' },
            ]}
          />
        </DetailCard>
        <DetailCard title="Moderationspolicy">
          <div className="space-y-4 text-sm leading-7 text-[#475467]">
            <p>
              Annonser publiceras utan manuell godkännandekö när paket- och betalningslogik tillåter det.
              Säljaren ansvarar för uppgifterna i annonsen.
            </p>
            <p>
              Admin kan i efterhand flagga, avpublicera, pausa eller mjukradera annonsen när uppgifter är
              felaktiga, vilseledande eller misstänkt bedrägliga.
            </p>
            <p>
              Radering, avpublicering och kontostängning kräver bekräftelse och intern anledning.
            </p>
          </div>
        </DetailCard>
      </div>
    </main>
  )
}

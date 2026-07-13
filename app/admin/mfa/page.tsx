import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import AdminMfaSetup from './AdminMfaSetup'

export const dynamic = 'force-dynamic'

export default async function AdminMfaPage() {
  const auth = await requireAdmin()
  if (auth.assuranceLevel === 'aal2') redirect('/admin')

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">Säkerhetskrav</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101828]">Aktivera tvåfaktorsautentisering</h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          Alla administratörer måste verifiera en TOTP-kod innan kontrollcentret eller dess API:er kan användas.
        </p>
        <AdminMfaSetup />
      </div>
    </main>
  )
}

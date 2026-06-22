import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto')
  const { data: profile } = await supabase.from('marketplace_profiles').select('*').eq('user_id', user.id).single()
  return <main className="mx-auto max-w-[1000px] px-5 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Autorell-konto</p><h1 className="mt-3 text-4xl tracking-[-.04em]">Din profil</h1><p className="mb-8 mt-3 text-[#667085]">Kontaktuppgifterna används för annonser, meddelanden och säkrare affärer.</p><ProfileForm profile={profile} /></main>
}

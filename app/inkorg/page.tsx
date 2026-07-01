import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InboxGatewayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(
    user
      ? '/account/messages'
      : '/se',
  )
}

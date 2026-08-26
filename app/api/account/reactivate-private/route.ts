import { NextResponse } from 'next/server'
import { reactivateSelfDeletedPrivateProfile } from '@/lib/account-profile-bootstrap'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  try {
    const reactivated = await reactivateSelfDeletedPrivateProfile(user.id)
    return NextResponse.json({ success: true, reactivated })
  } catch (error) {
    console.error('Private account reactivation failed', { error, userId: user.id })
    return NextResponse.json(
      { error: 'The account could not be reactivated.' },
      { status: 500 },
    )
  }
}

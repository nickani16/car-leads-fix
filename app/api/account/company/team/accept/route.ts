import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  acceptCompanyTeamInvitationForUser,
  acceptLatestCompanyTeamInvitationForUser,
  CompanyTeamInvitationError,
} from '@/lib/company-team-acceptance'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in with the email address that received the invitation.' }, { status: 401 })

    const body = (await request.json()) as Record<string, unknown>
    const token = String(body.token || '').trim()
    const destinationHint = request.headers.get('referer') || undefined

    const admin = createAdminClient()
    if (token.length < 24) {
      const fallback = await acceptLatestCompanyTeamInvitationForUser(admin, {
        userId: user.id,
        userEmail: user.email,
        destinationHint,
      })
      if (fallback) return NextResponse.json({ success: true, destination: fallback.destination })
      return NextResponse.json({ error: 'The invitation is invalid.' }, { status: 400 })
    }

    const result = await acceptCompanyTeamInvitationForUser(admin, {
      token,
      userId: user.id,
      userEmail: user.email,
      destinationHint,
    })

    return NextResponse.json({ success: true, destination: result.destination })
  } catch (error) {
    if (error instanceof CompanyTeamInvitationError) {
      if ([400, 404, 410].includes(error.status)) {
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const fallback = await acceptLatestCompanyTeamInvitationForUser(createAdminClient(), {
              userId: user.id,
              userEmail: user.email,
              destinationHint: request.headers.get('referer') || undefined,
            })
            if (fallback) return NextResponse.json({ success: true, destination: fallback.destination })
          }
        } catch (fallbackError) {
          console.error('[company-team-accept] fallback failed', fallbackError)
        }
      }
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[company-team-accept] failed', error)
    return NextResponse.json({ error: 'The invitation could not be accepted.' }, { status: 500 })
  }
}

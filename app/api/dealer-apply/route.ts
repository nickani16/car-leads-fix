import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  DEALER_TERMS_VERSION,
  PRIVACY_NOTICE_VERSION,
} from '@/lib/legal'

type DealerApplication = {
  companyName?: string
  vatNumber?: string
  country?: string
  contactPerson?: string
  email?: string
  phone?: string
  password?: string
  acceptsDealerTerms?: boolean
  acknowledgesPrivacyNotice?: boolean
}

function clean(value: string | undefined) {
  return value?.trim() || ''
}

export async function POST(request: Request) {
  const body = (await request.json()) as DealerApplication
  const companyName = clean(body.companyName)
  const vatNumber = clean(body.vatNumber)
  const country = clean(body.country)
  const contactPerson = clean(body.contactPerson)
  const email = clean(body.email).toLowerCase()
  const phone = clean(body.phone)
  const password = body.password || ''

  if (
    !companyName ||
    !vatNumber ||
    !country ||
    !contactPerson ||
    !email ||
    !phone ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: 'Complete all required application fields.' },
      { status: 400 }
    )
  }

  if (!body.acceptsDealerTerms || !body.acknowledgesPrivacyNotice) {
    return NextResponse.json(
      {
        error:
          'You must accept the Dealer Terms and acknowledge the Privacy Notice.',
      },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json(
      { error: 'Dealer applications are temporarily unavailable.' },
      { status: 503 }
    )
  }

  const acceptedAt = new Date().toISOString()
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || null
  const userAgent = request.headers.get('user-agent')
  const requestUrl = new URL(request.url)

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { data, error: signUpError } = await authClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback?next=/login`,
      data: {
        company_name: companyName,
        vat_number: vatNumber,
        country,
        contact_person: contactPerson,
        phone,
        dealer_terms_version: DEALER_TERMS_VERSION,
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
        legal_accepted_at: acceptedAt,
        legal_accepted_by_name: contactPerson,
      },
    },
  })

  if (signUpError || !data.user) {
    return NextResponse.json(
      { error: signUpError?.message || 'The account could not be created.' },
      { status: 400 }
    )
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { error: acceptanceError } = await adminClient
    .from('dealer_legal_acceptances')
    .insert({
      user_id: data.user.id,
      accepted_by_name: contactPerson,
      accepted_email: email,
      dealer_terms_version: DEALER_TERMS_VERSION,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      dealer_terms_accepted: true,
      privacy_notice_acknowledged: true,
      accepted_at: acceptedAt,
      ip_address: ipAddress,
      user_agent: userAgent,
      source: 'dealer_application',
    })

  if (acceptanceError) {
    await adminClient.auth.admin.deleteUser(data.user.id)
    console.error('Dealer legal acceptance error:', acceptanceError)

    return NextResponse.json(
      {
        error:
          'Your legal acceptance could not be recorded. No account was created.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}


import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPublicLanguage } from '@/lib/public-i18n'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown
      consent?: unknown
      website?: unknown
      locale?: unknown
      category?: unknown
      sourceUrl?: unknown
    }

    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true })
    }

    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 320) : ''
    if (!emailPattern.test(email) || body.consent !== true) {
      return NextResponse.json({ error: 'Invalid newsletter subscription.' }, { status: 400 })
    }

    const locale =
      typeof body.locale === 'string' &&
      (body.locale === 'sv' || body.locale === 'de' || isPublicLanguage(body.locale))
        ? body.locale
        : 'en'
    const category =
      typeof body.category === 'string' ? body.category.trim().slice(0, 80) : null
    const sourceUrl =
      typeof body.sourceUrl === 'string' ? body.sourceUrl.trim().slice(0, 500) : null
    const now = new Date().toISOString()
    const supabase = createAdminClient()
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      {
        email,
        locale,
        category_slug: category,
        source_url: sourceUrl,
        status: 'subscribed',
        consent_at: now,
        unsubscribed_at: null,
        updated_at: now,
      },
      { onConflict: 'email' },
    )

    if (error) {
      console.error('Newsletter subscription error:', error)
      return NextResponse.json({ error: 'Newsletter subscription failed.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter route error:', error)
    return NextResponse.json({ error: 'Newsletter subscription failed.' }, { status: 500 })
  }
}

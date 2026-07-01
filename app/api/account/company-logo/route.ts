import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

const MAX_LOGO_SIZE = 2 * 1024 * 1024
const LOGO_BUCKET = 'marketplace-company-assets'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Inte inloggad.' }, { status: 401 })
  const uploadLimit = checkRateLimit({
    key: `company-logo:${user.id}:${getClientIp(request)}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (uploadLimit.limited) return rateLimitJson(uploadLimit.retryAfter)

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type,company_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.account_type !== 'business' || !profile.company_id) {
    return NextResponse.json({ error: 'Endast företagskonton kan ladda upp logotyp.' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('logo')
  if (
    !(file instanceof File) ||
    !file.type.startsWith('image/') ||
    file.size <= 0 ||
    file.size > MAX_LOGO_SIZE
  ) {
    return NextResponse.json(
      { error: 'Ladda upp en bildlogotyp under 2 MB.' },
      { status: 400 },
    )
  }

  const extension = file.type.includes('png')
    ? 'png'
    : file.type.includes('webp')
      ? 'webp'
      : 'jpg'
  const path = `logos/${profile.company_id}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await admin.storage
    .from(LOGO_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: publicUrl } = admin.storage.from(LOGO_BUCKET).getPublicUrl(path)
  const logoUrl = publicUrl.publicUrl

  const now = new Date().toISOString()
  await Promise.all([
    admin
      .from('marketplace_companies')
      .update({ logo_url: logoUrl, updated_at: now })
      .eq('id', profile.company_id),
    admin
      .from('marketplace_profiles')
      .update({ logo_url: logoUrl, updated_at: now })
      .eq('user_id', user.id),
  ])

  return NextResponse.json({ logoUrl })
}

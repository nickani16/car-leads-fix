import { NextResponse } from 'next/server'
import { runInternalSupportTask } from '@/lib/ai/support-chat'
import { requireSupportAdminRoute } from '@/lib/support/permissions'

export async function POST(request: Request) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json()) as {
    text?: string
    source_language?: string
    target_language?: string
  }
  const text = String(body.text || '').trim()
  const target = String(body.target_language || 'sv')
  if (!text) return NextResponse.json({ error: 'text is required.' }, { status: 400 })

  const translation =
    (await runInternalSupportTask(
      `Oversatt foljande text fran ${body.source_language || 'okant sprak'} till ${target}. Returnera endast oversattningen.\n\n${text}`,
    )) || text

  return NextResponse.json({ translation })
}

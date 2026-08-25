import { NextResponse } from 'next/server'
import { processDealerImportQueue, scheduleDueDealerImportRuns } from '@/lib/dealer-import/worker'
import { sendEndingPilotNotifications } from '@/lib/business-pilot-scheduler'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'Cron is not configured.' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [scheduled, pilotNotifications] = await Promise.all([
      scheduleDueDealerImportRuns(50),
      sendEndingPilotNotifications(),
    ])
    const results = await processDealerImportQueue(1)
    return NextResponse.json({ scheduled, pilotNotifications, processed: results.length, results })
  } catch (error) {
    console.error('[dealer-import-cron] queue processing failed', error)
    return NextResponse.json({ error: 'Dealer import queue failed.' }, { status: 500 })
  }
}

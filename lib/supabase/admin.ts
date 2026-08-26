import 'server-only'
import { createClient } from '@supabase/supabase-js'

type AdminClientOptions = {
  signal?: AbortSignal
  timeoutMs?: number
}

export function createAdminClient(options: AdminClientOptions = {}) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    ...(options.signal || options.timeoutMs
      ? { global: { fetch: createAbortableFetch(options) } }
      : {}),
  })
}

function createAbortableFetch(options: AdminClientOptions): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController()
    const abort = () => controller.abort()
    const signals = [options.signal, init?.signal].filter(Boolean) as AbortSignal[]
    signals.forEach((signal) => {
      if (signal.aborted) controller.abort()
      else signal.addEventListener('abort', abort, { once: true })
    })
    const timeout = options.timeoutMs ? setTimeout(abort, options.timeoutMs) : undefined

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      if (timeout) clearTimeout(timeout)
      signals.forEach((signal) => signal.removeEventListener('abort', abort))
    }
  }
}

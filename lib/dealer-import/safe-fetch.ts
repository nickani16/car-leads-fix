import 'server-only'

import { lookup as dnsLookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import { isIP, type LookupFunction } from 'node:net'

const DEFAULT_USER_AGENT = 'AutorellInventoryBot/1.0 (+https://www.autorell.com/business/inventory-import)'

export type SafeFetchOptions = {
  maxBytes?: number
  timeoutMs?: number
  maxRedirects?: number
  allowedHosts?: ReadonlySet<string>
  acceptedContentTypes?: string[]
  acceptHeader?: string
}

export type SafeFetchResult = {
  url: string
  status: number
  contentType: string
  headers: http.IncomingHttpHeaders
  body: Buffer
}

export async function safeFetchText(rawUrl: string, options: SafeFetchOptions = {}) {
  const result = await safeFetchBuffer(rawUrl, options)
  return { ...result, text: result.body.toString('utf8') }
}

export async function safeFetchBuffer(rawUrl: string, options: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const maxRedirects = options.maxRedirects ?? 3
  let current = validateOutboundUrl(rawUrl, options.allowedHosts)

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const result = await requestOnce(current, options)
    if (![301, 302, 303, 307, 308].includes(result.status)) return result
    const location = result.headers.location
    if (!location) throw new Error('IMPORT_REDIRECT_WITHOUT_LOCATION')
    if (redirects === maxRedirects) throw new Error('IMPORT_TOO_MANY_REDIRECTS')
    current = validateOutboundUrl(new URL(location, current).toString(), options.allowedHosts)
  }

  throw new Error('IMPORT_TOO_MANY_REDIRECTS')
}

export function validateOutboundUrl(rawUrl: string, allowedHosts?: ReadonlySet<string>) {
  let url: URL
  try { url = new URL(rawUrl) } catch { throw new Error('IMPORT_URL_INVALID') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('IMPORT_PROTOCOL_BLOCKED')
  if (url.username || url.password) throw new Error('IMPORT_URL_CREDENTIALS_BLOCKED')
  if (url.port && !((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443'))) {
    throw new Error('IMPORT_NON_STANDARD_PORT_BLOCKED')
  }

  const hostname = normalizeHostname(url.hostname)
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('IMPORT_PRIVATE_HOST_BLOCKED')
  }
  if (isIP(hostname) && !isPublicIpAddress(hostname)) throw new Error('IMPORT_PRIVATE_IP_BLOCKED')
  if (!isIP(hostname) && !hostname.includes('.')) throw new Error('IMPORT_HOSTNAME_INVALID')
  if (allowedHosts && !allowedHosts.has(hostname)) throw new Error('IMPORT_REDIRECT_HOST_BLOCKED')
  url.hostname = hostname
  url.hash = ''
  return url
}

export function isPublicIpAddress(value: string) {
  const address = normalizeHostname(value).split('%')[0]
  const version = isIP(address)
  if (version === 4) {
    const octets = address.split('.').map(Number)
    const [first, second, third] = octets
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 0) ||
      (first === 192 && second === 168) ||
      (first === 198 && (second === 18 || second === 19 || second === 51 && third === 100)) ||
      (first === 203 && second === 0 && third === 113)
    )
  }
  if (version === 6) {
    const lower = address.toLowerCase()
    if (lower.startsWith('::ffff:')) return isPublicIpAddress(lower.slice(7))
    const firstGroup = Number.parseInt(lower.split(':')[0] || '0', 16)
    return !(
      lower === '::' || lower === '::1' ||
      lower.startsWith('fc') || lower.startsWith('fd') ||
      (firstGroup >= 0xfe80 && firstGroup <= 0xfebf) ||
      firstGroup >= 0xff00 ||
      lower.startsWith('2001:db8:') ||
      lower.startsWith('2001:db8::')
    )
  }
  return false
}

async function requestOnce(url: URL, options: SafeFetchOptions): Promise<SafeFetchResult> {
  const records = await dnsLookup(url.hostname, { all: true, verbatim: true })
  if (!records.length || records.some((record) => !isPublicIpAddress(record.address))) {
    throw new Error('IMPORT_DNS_PRIVATE_OR_EMPTY')
  }
  const timeoutMs = options.timeoutMs ?? 10_000
  const deadline = Date.now() + timeoutMs
  const candidates = [...records].sort((left, right) => left.family === right.family ? 0 : left.family === 4 ? -1 : 1)
  let lastError: Error | null = null

  for (const selected of candidates) {
    const remainingTimeout = deadline - Date.now()
    if (remainingTimeout <= 0) break
    try {
      return await requestPinnedAddress(url, { ...options, timeoutMs: remainingTimeout }, selected)
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error))
      if (['IMPORT_RESPONSE_TOO_LARGE', 'IMPORT_CONTENT_TYPE_BLOCKED'].includes(normalized.message)) throw normalized
      lastError = normalized
    }
  }

  throw lastError || new Error('IMPORT_REQUEST_TIMEOUT')
}

async function requestPinnedAddress(
  url: URL,
  options: SafeFetchOptions,
  selected: { address: string; family: number },
): Promise<SafeFetchResult> {
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024
  const timeoutMs = options.timeoutMs ?? 10_000
  const transport = url.protocol === 'https:' ? https : http

  const pinnedLookup = ((_hostname, lookupOptions, callback) => {
    if (typeof lookupOptions === 'object' && lookupOptions.all) {
      callback(null, [selected])
      return
    }
    callback(null, selected.address, selected.family)
  }) as LookupFunction

  return new Promise((resolve, reject) => {
    let settled = false
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      reject(error)
    }
    const request = transport.request(url, {
      method: 'GET',
      lookup: pinnedLookup,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: options.acceptHeader || 'text/html,application/xhtml+xml,application/xml,text/xml,text/plain;q=0.8',
        'Accept-Encoding': 'identity',
        Connection: 'close',
      },
      timeout: timeoutMs,
    }, (response) => {
      const status = response.statusCode || 0
      const contentType = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
      const contentLength = Number(response.headers['content-length'] || 0)
      if (contentLength > maxBytes) {
        response.destroy()
        fail(new Error('IMPORT_RESPONSE_TOO_LARGE'))
        return
      }
      if (![301, 302, 303, 307, 308].includes(status) && options.acceptedContentTypes?.length && contentType && !options.acceptedContentTypes.some((allowed) => contentType === allowed || contentType.startsWith(`${allowed}/`))) {
        response.destroy()
        fail(new Error('IMPORT_CONTENT_TYPE_BLOCKED'))
        return
      }

      const chunks: Buffer[] = []
      let size = 0
      response.on('data', (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        size += buffer.length
        if (size > maxBytes) {
          response.destroy(new Error('IMPORT_RESPONSE_TOO_LARGE'))
          return
        }
        chunks.push(buffer)
      })
      response.on('error', (error) => fail(error instanceof Error ? error : new Error(String(error))))
      response.on('end', () => {
        if (settled) return
        settled = true
        resolve({ url: url.toString(), status, contentType, headers: response.headers, body: Buffer.concat(chunks) })
      })
    })
    request.on('timeout', () => request.destroy(new Error('IMPORT_REQUEST_TIMEOUT')))
    request.on('error', (error) => fail(error instanceof Error ? error : new Error(String(error))))
    request.end()
  })
}

function normalizeHostname(value: string) {
  return value.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
}

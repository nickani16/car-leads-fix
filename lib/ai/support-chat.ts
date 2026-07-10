import 'server-only'
import { ESCALATION_MESSAGE, CUSTOMER_SUPPORT_SYSTEM_PROMPT, INTERNAL_SUPPORT_SYSTEM_PROMPT } from './support-prompts'
import { createOpenAiChatCompletion } from './openai'
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, type SupportCategory, type SupportPriority } from '@/lib/support/tickets'

export type SupportAiResult = {
  answer: string
  language: string
  escalation_required: boolean
  escalation_reason: string | null
  suggested_category: SupportCategory
  suggested_priority: SupportPriority
  risk_level: 'low' | 'normal' | 'high'
}

const escalationTerms = [
  'human',
  'person',
  'refund',
  'payment',
  'gdpr',
  'legal',
  'lawyer',
  'fraud',
  'scam',
  'stolen',
  'blocked',
  'suspended',
  'verification',
  'polis',
  'bedrageri',
  'stulen',
  'aterbetal',
  'återbetal',
  'jurid',
  'radera konto',
]

export function fallbackSupportAi(message: string, locale = 'sv'): SupportAiResult {
  const normalized = message.toLowerCase()
  const shouldEscalate = escalationTerms.some((term) => normalized.includes(term))
  const language = detectLanguage(message, locale)
  const answer = shouldEscalate
    ? ESCALATION_MESSAGE
    : language === 'sv'
      ? 'Jag kan guida dig. Beskriv gärna vilket steg du är på och om det gäller konto, annons, betalning eller meddelanden.'
      : 'I can guide you. Please describe which step you are on and whether it concerns an account, listing, payment or messages.'

  return {
    answer,
    language,
    escalation_required: shouldEscalate,
    escalation_reason: shouldEscalate ? 'Sensitive or manual-review topic detected.' : null,
    suggested_category: inferCategory(message),
    suggested_priority: shouldEscalate ? 'high' : 'normal',
    risk_level: shouldEscalate ? 'high' : 'normal',
  }
}

export async function answerCustomerSupport({
  message,
  history,
  locale,
}: {
  message: string
  history: { role: string; message: string }[]
  locale?: string | null
}) {
  const context = history
    .slice(-12)
    .map((item) => `${item.role}: ${item.message}`)
    .join('\n')

  const content = await createOpenAiChatCompletion({
    responseFormatJson: true,
    messages: [
      { role: 'system', content: CUSTOMER_SUPPORT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Aktuell locale: ${locale || 'unknown'}\nChatthistorik:\n${context}\n\nKundens senaste meddelande:\n${message}`,
      },
    ],
  })

  if (!content) return fallbackSupportAi(message, locale || 'sv')

  try {
    const parsed = JSON.parse(content) as Partial<SupportAiResult>
    return normalizeAiResult(parsed, message, locale || 'sv')
  } catch {
    return {
      ...fallbackSupportAi(message, locale || 'sv'),
      answer: content,
    }
  }
}

export async function runInternalSupportTask(prompt: string) {
  return (
    (await createOpenAiChatCompletion({
      messages: [
        { role: 'system', content: INTERNAL_SUPPORT_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.15,
    })) || ''
  )
}

export async function runInternalSupportJsonTask(prompt: string) {
  const content = await createOpenAiChatCompletion({
    responseFormatJson: true,
    messages: [
      { role: 'system', content: INTERNAL_SUPPORT_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.15,
  })
  if (!content) return null
  try {
    return JSON.parse(content) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizeAiResult(
  parsed: Partial<SupportAiResult>,
  message: string,
  locale: string,
): SupportAiResult {
  const fallback = fallbackSupportAi(message, locale)
  const category = SUPPORT_CATEGORIES.includes(parsed.suggested_category as SupportCategory)
    ? (parsed.suggested_category as SupportCategory)
    : fallback.suggested_category
  const priority = SUPPORT_PRIORITIES.includes(parsed.suggested_priority as SupportPriority)
    ? (parsed.suggested_priority as SupportPriority)
    : fallback.suggested_priority

  return {
    answer: String(parsed.answer || fallback.answer),
    language: String(parsed.language || fallback.language),
    escalation_required: Boolean(parsed.escalation_required || fallback.escalation_required),
    escalation_reason: parsed.escalation_reason ? String(parsed.escalation_reason) : fallback.escalation_reason,
    suggested_category: category,
    suggested_priority: priority,
    risk_level: parsed.risk_level === 'high' || parsed.risk_level === 'low' ? parsed.risk_level : fallback.risk_level,
  }
}

function inferCategory(message: string): SupportCategory {
  const value = message.toLowerCase()
  if (value.includes('betal') || value.includes('payment') || value.includes('refund')) return 'payment'
  if (value.includes('gdpr') || value.includes('radera') || value.includes('delete')) return 'gdpr'
  if (value.includes('fraud') || value.includes('scam') || value.includes('bedrager')) return 'fraud'
  if (value.includes('annons') || value.includes('listing') || value.includes('vehicle')) return 'listing'
  if (value.includes('foretag') || value.includes('business') || value.includes('verification')) return 'business_account'
  if (value.includes('konto') || value.includes('account') || value.includes('login')) return 'account'
  return 'other'
}

function detectLanguage(message: string, locale: string) {
  if (/[åäö]/i.test(message)) return 'sv'
  if (/[éèêàç]/i.test(message)) return 'fr'
  if (/[ñáíóú]/i.test(message)) return 'es'
  return locale || 'en'
}

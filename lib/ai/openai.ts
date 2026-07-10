import 'server-only'

type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function createOpenAiChatCompletion({
  messages,
  temperature = 0.2,
  responseFormatJson = false,
}: {
  messages: OpenAiMessage[]
  temperature?: number
  responseFormatJson?: boolean
}) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SUPPORT_MODEL || 'gpt-4o-mini',
      messages,
      temperature,
      response_format: responseFormatJson ? { type: 'json_object' } : undefined,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return data.choices?.[0]?.message?.content || null
}

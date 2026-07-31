import { redirect } from 'next/navigation'

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function safeReturnPath(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/api/')) {
    return ''
  }
  return next
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = searchParams ? await searchParams : {}
  const next = safeReturnPath(query.next)
  const params = new URLSearchParams({ auth: 'login' })
  if (next) params.set('next', next)
  redirect(`/?${params.toString()}`)
}

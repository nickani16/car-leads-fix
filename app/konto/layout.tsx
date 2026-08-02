import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const returnTo = accountReturnPath(requestHeaders.get('x-autorell-pathname'), locale)
    redirect(`${localizePublicHref(locale, '/login')}?next=${encodeURIComponent(returnTo)}`)
  }

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <div className="min-h-[70vh]">{children}</div>
      <PublicFooter locale={locale} />
    </div>
  )
}

function accountReturnPath(value: string | null, locale: Parameters<typeof localizePublicHref>[0]) {
  const fallback = localizePublicHref(locale, '/account')
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/api/')) {
    return fallback
  }
  if (value === '/account' || value.startsWith('/account/')) {
    return localizePublicHref(locale, value)
  }
  return value
}

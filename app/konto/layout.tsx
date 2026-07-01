import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import InactivityLogout from '@/app/components/InactivityLogout'
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

  if (!user) redirect(localizePublicHref(locale, '/login'))

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <InactivityLogout />
      <PublicHeader locale={locale} marketCode={marketCode} />
      <div className="min-h-[70vh]">{children}</div>
      <PublicFooter locale={locale} />
    </div>
  )
}

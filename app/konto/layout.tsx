import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, HelpCircle, MessageCircle, UserRound } from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import InactivityLogout from '@/app/components/InactivityLogout'
import AccountLogoutButton from './AccountLogoutButton'
import { createClient } from '@/lib/supabase/server'
import { getAccountCopy } from '@/lib/account-i18n'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto')
  const { data: profile } = await supabase.from('marketplace_profiles').select('display_name,account_type,locale').eq('user_id', user.id).maybeSingle()
  if (!profile) redirect('/registrera')
  const locale: PublicLocale =
    profile.locale === 'sv' || profile.locale === 'de' || isPublicLanguage(profile.locale)
      ? profile.locale
      : 'en'
  const copy = getAccountCopy(locale)
  const links = [
    ['/konto', copy.profile, UserRound],
    ['/konto/annonser', copy.listings, FileText],
    ['/konto/meddelanden', copy.messages, MessageCircle],
    ['/hjalpcenter', copy.support, HelpCircle],
  ] as const
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#101828]">
      <InactivityLogout />
      <header className="border-b border-[#e1e5ec] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/"><BrandLogo /></Link>
          <span className="text-sm font-semibold">{profile.display_name}</span>
        </div>
        <nav className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-5 pb-3 sm:px-8">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold text-[#475467] hover:bg-[#eef4ff] hover:text-[#0866ff]">
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
          <div className="ml-auto"><AccountLogoutButton /></div>
        </nav>
      </header>
      {children}
    </div>
  )
}

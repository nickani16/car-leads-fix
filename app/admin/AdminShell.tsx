'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import AccountLogoutButton from '../konto/AccountLogoutButton'

const navigation = [
  { label: 'Marketplace', href: '/admin', icon: LayoutDashboard },
  { label: 'Access', href: '/admin/access', icon: UsersRound },
] as const

export default function AdminShell({
  role,
  email,
  children,
}: {
  role: string
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#101828]">
      <header className="sticky top-0 z-40 border-b border-[#e1e5ec] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-[1380px] items-center gap-6 px-5 sm:px-8 lg:px-12">
          <Link href="/admin" className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden text-xs font-bold uppercase tracking-[.16em] text-[#667085] sm:block">
              Marketplace admin
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[13px] px-4 text-sm font-semibold ${
                  pathname === href
                    ? 'bg-[#eef4ff] text-[#0866ff]'
                    : 'text-[#475467] hover:bg-[#f7f8fb]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 border-l border-[#e4e7ec] pl-5 lg:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="max-w-48 truncate text-xs text-[#667085]">
              {email} · {role.replaceAll('_', ' ')}
            </span>
            <AccountLogoutButton />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[#eaecf0] px-4 py-2 md:hidden">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-2 rounded-[12px] px-3 py-2 text-xs font-semibold">
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  )
}

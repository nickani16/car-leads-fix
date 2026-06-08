'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BriefcaseBusiness, LayoutDashboard } from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import LogoutButton from '@/app/dealer/LogoutButton'

const navigation = [
  { href: '/sales', label: 'Deal pipeline', icon: LayoutDashboard },
  { href: '/sales/notifications', label: 'Notifications', icon: Bell },
]

export default function SalesShell({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="h-2 bg-[#B4D9EF]" />
      <header className="sticky top-0 z-40 border-b border-[#deddd7] bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-3.5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/sales" aria-label="Autorell Sales Portal">
              <BrandLogo />
            </Link>
            <nav className="flex items-center gap-1.5">
              {navigation.map((item) => {
                const Icon = item.icon
                const active =
                  item.href === '/sales'
                    ? pathname === '/sales'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-3 py-2.5 text-xs font-normal transition sm:px-4 sm:text-sm ${
                      active
                        ? 'bg-[#B4D9EF] text-[#242424]'
                        : 'text-[#62686c] hover:bg-[#f3f2ee]'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden text-right lg:block">
              <p className="max-w-48 truncate text-sm font-medium">{name}</p>
              <p className="flex items-center justify-end gap-1.5 text-xs text-emerald-700">
                <BriefcaseBusiness size={13} />
                Sales access
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}

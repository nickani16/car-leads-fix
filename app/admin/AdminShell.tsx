import Link from 'next/link'
import {
  BarChart3,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldCheck,
  Store,
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import LogoutButton from '../dealer/LogoutButton'

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin#leads', icon: FileText },
  { label: 'Auctions', href: '/admin#auctions', icon: Gavel },
  { label: 'Dealers', href: '/admin#dealers', icon: Store },
  { label: 'Deals', href: '/admin#deals', icon: BarChart3 },
]

export default function AdminShell({
  role,
  email,
  children,
}: {
  role: string
  email: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="h-2 bg-[#B4D9EF]" />
      <header className="sticky top-0 z-40 border-b border-[#deddd7] bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-3.5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/admin" aria-label="Autorell Admin">
              <BrandLogo />
            </Link>
            <nav className="hidden items-center gap-1.5 lg:flex">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-normal text-[#62686c] transition hover:bg-[#f3f2ee] hover:text-[#202124]"
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden text-right xl:block">
              <p className="max-w-56 truncate text-sm font-medium text-[#202124]">
                {email}
              </p>
              <p className="flex items-center justify-end gap-1.5 text-xs text-emerald-700">
                <ShieldCheck size={13} />
                {role.replace('_', ' ')}
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


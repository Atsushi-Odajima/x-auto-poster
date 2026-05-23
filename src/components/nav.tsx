'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: '🏠' },
  { href: '/accounts', label: 'アカウント', icon: '👤' },
  { href: '/themes', label: 'テーマ', icon: '✍️' },
  { href: '/queue', label: 'キュー', icon: '📅' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-bottom z-50 md:hidden">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              active ? 'text-[#1d9bf0]' : 'text-gray-500'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8 px-3">
        <span className="text-2xl font-bold text-[#1d9bf0]">𝕏</span>
        <span className="ml-2 font-semibold text-gray-800">Auto Poster</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1d9bf0]/10 text-[#1d9bf0]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <span className="text-lg">🚪</span>
        ログアウト
      </button>
    </aside>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? '登録に失敗しました')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-[#1d9bf0] mb-2">𝕏</div>
          <h1 className="text-2xl font-bold text-gray-900">X Auto Poster</h1>
          <p className="text-gray-500 text-sm mt-1">新規アカウント登録</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                placeholder="8文字以上"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1d9bf0] text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors"
            >
              {isPending ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-[#1d9bf0] font-medium hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

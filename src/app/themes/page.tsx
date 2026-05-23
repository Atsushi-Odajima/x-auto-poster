'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'

type Theme = {
  id: string
  title: string
  description: string
  tone: string
  language: string
  createdAt: string
  _count: { posts: number }
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    tone: 'engaging',
    language: 'ja',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/themes')
      .then((r) => r.json())
      .then((data) => { setThemes(data); setLoading(false) })
  }, [])

  const createTheme = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const theme = await res.json()
        setThemes([theme, ...themes])
        setForm({ title: '', description: '', tone: 'engaging', language: 'ja' })
        setShowForm(false)
      } else {
        const data = await res.json()
        setError(data.error ?? '作成に失敗しました')
      }
    })
  }

  const toneLabels: Record<string, string> = {
    engaging: '共感・エンゲージメント重視',
    informative: '情報提供・教育的',
    humorous: 'ユーモア・親しみやすい',
    promotional: 'プロモーション・宣伝',
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">テーマ</h1>
          <p className="text-gray-500 text-sm mt-1">投稿テーマを管理・生成</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1d9bf0] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#1a8cd8] transition-colors"
        >
          {showForm ? 'キャンセル' : '+ 新規テーマ'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">新しいテーマを作成</h2>
          <form onSubmit={createTheme} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">テーマタイトル</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                placeholder="例: AI技術の最新トレンド"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">詳細・内容</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent resize-none"
                placeholder="例: AIの最新動向、ChatGPTやClaudeなどLLMの活用事例について発信したい"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">トーン</label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                >
                  <option value="engaging">共感重視</option>
                  <option value="informative">情報提供</option>
                  <option value="humorous">ユーモア</option>
                  <option value="promotional">プロモーション</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">言語</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1d9bf0] text-white rounded-xl py-2 font-semibold text-sm hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors"
            >
              {isPending ? '作成中...' : 'テーマを作成'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : themes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-3">✍️</div>
          <p className="text-gray-500 font-medium">テーマがまだありません</p>
          <p className="text-gray-400 text-sm mt-1">テーマを作成してAIで投稿を自動生成しましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/themes/${theme.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-[#1d9bf0] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{theme.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{theme.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {toneLabels[theme.tone] ?? theme.tone}
                    </span>
                    <span className="text-xs text-gray-400">{theme._count.posts}件の投稿</span>
                  </div>
                </div>
                <span className="text-gray-300 ml-2">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Theme = { id: string; title: string; description: string; tone: string; language: string }
type XAccount = { id: string; xUsername: string }
type Post = { id: string; content: string; status: string; scheduledAt: string | null }

export default function ThemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [themeId, setThemeId] = useState('')
  const [theme, setTheme] = useState<Theme | null>(null)
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [count, setCount] = useState(5)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      setThemeId(id)
      Promise.all([
        fetch(`/api/themes`).then((r) => r.json()),
        fetch(`/api/accounts`).then((r) => r.json()),
        fetch(`/api/posts?themeId=${id}`).then((r) => r.json()),
      ]).then(([themes, accs, allPosts]) => {
        const t = themes.find((th: Theme) => th.id === id)
        setTheme(t ?? null)
        setAccounts(accs)
        if (accs.length > 0) setSelectedAccount(accs[0].id)
        setPosts((allPosts as Post[]).filter((p) => (p as any).themeId === id))
      })
    })
  }, [params])

  const generate = () => {
    if (!selectedAccount) { setMsg('アカウントを選択してください'); return }
    setMsg('')
    startTransition(async () => {
      const res = await fetch(`/api/themes/${themeId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xAccountId: selectedAccount, count }),
      })
      if (res.ok) {
        const newPosts = await res.json()
        setPosts((prev) => [...newPosts, ...prev])
        setMsg(`${newPosts.length}件の投稿を生成・スケジュールしました`)
      } else {
        const data = await res.json()
        setMsg(data.error ?? '生成に失敗しました')
      }
    })
  }

  const statusLabel: Record<string, string> = {
    PENDING: '未処理', SCHEDULED: '予約済', POSTED: '投稿済', FAILED: '失敗',
  }
  const statusColor: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-600',
    SCHEDULED: 'bg-blue-100 text-blue-600',
    POSTED: 'bg-green-100 text-green-600',
    FAILED: 'bg-red-100 text-red-600',
  }

  if (!theme) return <div className="p-4 text-center text-gray-400">読み込み中...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">‹ 戻る</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{theme.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">AI投稿を生成</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500">
            先に<Link href="/accounts" className="text-[#1d9bf0]">Xアカウントを連携</Link>してください
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">投稿するアカウント</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>@{a.xUsername}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">生成件数: {count}件</label>
              <input
                type="range" min={1} max={10} value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1 w-full accent-[#1d9bf0]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1件</span><span>10件</span>
              </div>
            </div>
            {msg && (
              <div className={`text-sm rounded-lg px-3 py-2 ${
                msg.includes('しました') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>{msg}</div>
            )}
            <button
              onClick={generate}
              disabled={isPending}
              className="w-full bg-[#1d9bf0] text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'AIが投稿を生成中...' : '✨ AI投稿を生成・スケジュール'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              AIが自動でインプレッション最適な投稿を作り、時間をずらして予約します
            </p>
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">このテーマの投稿 ({posts.length}件)</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-3">
                <p className="text-sm text-gray-800">{post.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[post.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[post.status] ?? post.status}
                  </span>
                  {post.scheduledAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(post.scheduledAt).toLocaleString('ja-JP', {
                        month: 'numeric', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

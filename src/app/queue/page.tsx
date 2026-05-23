'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Post = {
  id: string
  content: string
  status: string
  scheduledAt: string | null
  postedAt: string | null
  theme: { title: string }
  xAccount: { xUsername: string }
}

const FILTERS = [
  { value: '', label: 'すべて' },
  { value: 'SCHEDULED', label: '予約済' },
  { value: 'POSTED', label: '投稿済' },
  { value: 'FAILED', label: '失敗' },
]

const statusColor: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-100 text-blue-600',
  POSTED: 'bg-green-100 text-green-600',
  FAILED: 'bg-red-100 text-red-600',
}
const statusLabel: Record<string, string> = {
  PENDING: '未処理', SCHEDULED: '予約済', POSTED: '投稿済', FAILED: '失敗',
}

function QueueContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState(searchParams.get('status') ?? '')
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const load = (f: string) => {
    setLoading(true)
    fetch(`/api/posts${f ? `?status=${f}` : ''}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { load(filter) }, [filter])

  const publish = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setPosts(posts.map((p) => (p.id === id ? { ...p, ...updated } : p)))
      }
    })
  }

  const deletePost = (id: string) => {
    if (!confirm('この投稿を削除しますか？')) return
    startTransition(async () => {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      setPosts(posts.filter((p) => p.id !== id))
    })
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">投稿キュー</h1>
        <p className="text-gray-500 text-sm mt-1">スケジュール済みの投稿を管理</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); load(f.value) }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#1d9bf0] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📅</div>
          <p>投稿がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[post.status] ?? 'bg-gray-100'}`}>
                  {statusLabel[post.status]}
                </span>
                <div className="flex items-center gap-2">
                  {post.status === 'SCHEDULED' && (
                    <button
                      onClick={() => publish(post.id)}
                      disabled={isPending}
                      className="text-xs text-[#1d9bf0] font-medium hover:underline disabled:opacity-50"
                    >
                      今すぐ投稿
                    </button>
                  )}
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={isPending}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-3">{post.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>@{post.xAccount.xUsername} · {post.theme.title}</span>
                {post.scheduledAt && post.status === 'SCHEDULED' && (
                  <span>
                    {new Date(post.scheduledAt).toLocaleString('ja-JP', {
                      month: 'numeric', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                )}
                {post.postedAt && (
                  <span>
                    投稿済: {new Date(post.postedAt).toLocaleString('ja-JP', {
                      month: 'numeric', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function QueuePage() {
  return (
    <Suspense>
      <QueueContent />
    </Suspense>
  )
}

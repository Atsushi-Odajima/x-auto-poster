'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type XAccount = {
  id: string
  xUsername: string
  displayName: string | null
  profileImageUrl: string | null
  isActive: boolean
  createdAt: string
  _count: { posts: number }
}

function AccountsContent() {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'connected') setMsg('Xアカウントを連携しました！')
    if (error === 'cancelled') setMsg('連携がキャンセルされました')
    if (error === 'failed') setMsg('連携に失敗しました。もう一度試してください')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((data) => { setAccounts(data); setLoading(false) })
  }, [])

  const connectAccount = () => {
    startTransition(async () => {
      const res = await fetch('/api/accounts', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setMsg(data.error ?? '連携リンクの取得に失敗しました')
      }
    })
  }

  const deleteAccount = (id: string) => {
    if (!confirm('このアカウントの連携を解除しますか？投稿データも削除されます。')) return
    startTransition(async () => {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      setAccounts(accounts.filter((a) => a.id !== id))
    })
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xアカウント</h1>
          <p className="text-gray-500 text-sm mt-1">複数アカウントを管理できます</p>
        </div>
        <button
          onClick={connectAccount}
          disabled={isPending}
          className="bg-[#1d9bf0] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors"
        >
          {isPending ? '接続中...' : '+ 連携'}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          msg.includes('しました') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-3">𝕏</div>
          <p className="text-gray-500 font-medium">アカウントが連携されていません</p>
          <p className="text-gray-400 text-sm mt-1">「連携」ボタンからXアカウントを追加してください</p>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 text-left">
            <strong>※ X APIキーが必要です</strong><br />
            .envファイルにX_API_KEYとX_API_SECRETを設定してください
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {account.xUsername[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">@{account.xUsername}</div>
                  <div className="text-xs text-gray-400">{account._count.posts}件の投稿</div>
                </div>
              </div>
              <button
                onClick={() => deleteAccount(account.id)}
                disabled={isPending}
                className="text-red-400 hover:text-red-600 text-sm transition-colors"
              >
                解除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsContent />
    </Suspense>
  )
}

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const [accountCount, themeCount, postStats, recentPosts] = await Promise.all([
    prisma.xAccount.count({ where: { userId: user!.id, isActive: true } }),
    prisma.theme.count({ where: { userId: user!.id } }),
    prisma.post.groupBy({
      by: ['status'],
      where: { xAccount: { userId: user!.id } },
      _count: true,
    }),
    prisma.post.findMany({
      where: { xAccount: { userId: user!.id } },
      include: {
        theme: { select: { title: true } },
        xAccount: { select: { xUsername: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = { PENDING: 0, SCHEDULED: 0, POSTED: 0, FAILED: 0 }
  for (const s of postStats) {
    if (s.status in stats) stats[s.status as keyof typeof stats] = s._count
  }

  const statusLabel = { PENDING: '未処理', SCHEDULED: '予定', POSTED: '投稿済', FAILED: '失敗' }
  const statusColor = {
    PENDING: 'text-gray-500',
    SCHEDULED: 'text-blue-500',
    POSTED: 'text-green-500',
    FAILED: 'text-red-500',
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          こんにちは、{user?.name ?? user?.email} さん
        </h1>
        <p className="text-gray-500 text-sm mt-1">X Auto Poster ダッシュボード</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/accounts" className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-[#1d9bf0] transition-colors">
          <div className="text-3xl font-bold text-[#1d9bf0]">{accountCount}</div>
          <div className="text-sm text-gray-500 mt-1">連携アカウント</div>
        </Link>
        <Link href="/themes" className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-[#1d9bf0] transition-colors">
          <div className="text-3xl font-bold text-gray-800">{themeCount}</div>
          <div className="text-sm text-gray-500 mt-1">テーマ数</div>
        </Link>
        <Link href="/queue?status=SCHEDULED" className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl font-bold text-blue-500">{stats.SCHEDULED}</div>
          <div className="text-sm text-gray-500 mt-1">予約投稿</div>
        </Link>
        <Link href="/queue?status=POSTED" className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
          <div className="text-3xl font-bold text-green-500">{stats.POSTED}</div>
          <div className="text-sm text-gray-500 mt-1">投稿済み</div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">最近の投稿</h2>
          <Link href="/queue" className="text-sm text-[#1d9bf0]">すべて見る</Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            まだ投稿がありません。<br />
            <Link href="/themes" className="text-[#1d9bf0] mt-2 inline-block">テーマを作成して投稿を生成</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <li key={post.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">@{post.xAccount.xUsername}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{post.theme.title}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${statusColor[post.status as keyof typeof statusColor]}`}>
                    {statusLabel[post.status as keyof typeof statusLabel]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {accountCount === 0 && (
        <Link
          href="/accounts"
          className="block bg-[#1d9bf0] text-white rounded-2xl p-4 text-center font-semibold hover:bg-[#1a8cd8] transition-colors"
        >
          Xアカウントを連携する →
        </Link>
      )}
    </div>
  )
}

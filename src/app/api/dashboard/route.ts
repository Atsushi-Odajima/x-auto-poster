import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [accounts, themes, postStats] = await Promise.all([
    prisma.xAccount.count({ where: { userId: user.id, isActive: true } }),
    prisma.theme.count({ where: { userId: user.id } }),
    prisma.post.groupBy({
      by: ['status'],
      where: { xAccount: { userId: user.id } },
      _count: true,
    }),
  ])

  const stats = { PENDING: 0, SCHEDULED: 0, POSTED: 0, FAILED: 0 }
  for (const s of postStats) stats[s.status as keyof typeof stats] = s._count

  const recentPosts = await prisma.post.findMany({
    where: { xAccount: { userId: user.id } },
    include: {
      theme: { select: { title: true } },
      xAccount: { select: { xUsername: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return NextResponse.json({ accounts, themes, stats, recentPosts })
}

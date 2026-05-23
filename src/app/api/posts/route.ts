import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const themeId = searchParams.get('themeId')

  const posts = await prisma.post.findMany({
    where: {
      xAccount: { userId: user.id },
      ...(status ? { status } : {}),
      ...(themeId ? { themeId } : {}),
    },
    include: {
      theme: { select: { title: true } },
      xAccount: { select: { xUsername: true, profileImageUrl: true } },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 100,
  })
  return NextResponse.json(posts)
}

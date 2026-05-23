import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { postTweet } from '@/lib/twitter'

export async function POST(_req: Request, ctx: RouteContext<'/api/posts/[id]/publish'>) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const post = await prisma.post.findFirst({
    where: { id, xAccount: { userId: user.id } },
    include: { xAccount: true },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.status === 'POSTED') return NextResponse.json({ error: '既に投稿済みです' }, { status: 400 })

  if (!process.env.X_API_KEY) {
    const updated = await prisma.post.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), xPostId: `mock_${Date.now()}` },
    })
    return NextResponse.json({ ...updated, mock: true })
  }

  try {
    const xPostId = await postTweet(
      post.xAccount.accessToken,
      post.xAccount.accessSecret,
      post.content
    )
    const updated = await prisma.post.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), xPostId },
    })
    return NextResponse.json(updated)
  } catch (err) {
    await prisma.post.update({ where: { id }, data: { status: 'FAILED' } })
    return NextResponse.json({ error: '投稿に失敗しました' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postTweet } from '@/lib/twitter'

// Called by a cron job or external scheduler every minute
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SCHEDULER_SECRET ?? 'dev-scheduler'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const due = await prisma.post.findMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
    include: { xAccount: true },
    take: 20,
  })

  const results = await Promise.allSettled(
    due.map(async (post) => {
      try {
        let xPostId: string
        if (!process.env.X_API_KEY) {
          xPostId = `mock_${Date.now()}`
        } else {
          xPostId = await postTweet(
            post.xAccount.accessToken,
            post.xAccount.accessSecret,
            post.content
          )
        }
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'POSTED', postedAt: new Date(), xPostId },
        })
        return { id: post.id, ok: true }
      } catch {
        await prisma.post.update({ where: { id: post.id }, data: { status: 'FAILED' } })
        return { id: post.id, ok: false }
      }
    })
  )

  return NextResponse.json({ processed: results.length, results })
}

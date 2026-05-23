import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generatePosts } from '@/lib/claude'

export async function POST(request: Request, ctx: RouteContext<'/api/themes/[id]/generate'>) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const theme = await prisma.theme.findFirst({ where: { id, userId: user.id } })
  if (!theme) return NextResponse.json({ error: 'テーマが見つかりません' }, { status: 404 })

  const { xAccountId, count } = await request.json()
  if (!xAccountId) return NextResponse.json({ error: 'アカウントを選択してください' }, { status: 400 })

  const account = await prisma.xAccount.findFirst({ where: { id: xAccountId, userId: user.id } })
  if (!account) return NextResponse.json({ error: 'アカウントが見つかりません' }, { status: 404 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic APIキーが設定されていません' }, { status: 503 })
  }

  const generated = await generatePosts(
    theme.title,
    theme.description,
    theme.tone,
    theme.language,
    count ?? 5
  )

  const now = new Date()
  const posts = await prisma.$transaction(
    generated.map((g) =>
      prisma.post.create({
        data: {
          themeId: id,
          xAccountId,
          content: g.content,
          status: 'SCHEDULED',
          scheduledAt: new Date(now.getTime() + g.scheduledMinutesFromNow * 60 * 1000),
        },
      })
    )
  )

  return NextResponse.json(posts, { status: 201 })
}

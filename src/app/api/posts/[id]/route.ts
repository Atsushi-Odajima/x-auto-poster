import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, ctx: RouteContext<'/api/posts/[id]'>) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const post = await prisma.post.findFirst({
    where: { id, xAccount: { userId: user.id } },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await request.json()
  const updated = await prisma.post.update({
    where: { id },
    data: {
      content: data.content ?? post.content,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : post.scheduledAt,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/posts/[id]'>) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const post = await prisma.post.findFirst({
    where: { id, xAccount: { userId: user.id } },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

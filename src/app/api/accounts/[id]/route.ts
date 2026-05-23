import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, ctx: RouteContext<'/api/accounts/[id]'>) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const account = await prisma.xAccount.findFirst({ where: { id, userId: user.id } })
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.xAccount.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

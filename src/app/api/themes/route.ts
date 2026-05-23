import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const themes = await prisma.theme.findMany({
    where: { userId: user.id },
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(themes)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, tone, language } = await request.json()
  if (!title || !description) {
    return NextResponse.json({ error: 'タイトルと説明は必須です' }, { status: 400 })
  }

  const theme = await prisma.theme.create({
    data: { userId: user.id, title, description, tone: tone ?? 'engaging', language: language ?? 'ja' },
  })
  return NextResponse.json(theme, { status: 201 })
}

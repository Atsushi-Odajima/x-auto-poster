import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAuthLink } from '@/lib/twitter'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accounts = await prisma.xAccount.findMany({
    where: { userId: user.id },
    select: {
      id: true, xUsername: true, displayName: true,
      profileImageUrl: true, isActive: true, createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(accounts)
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.X_API_KEY || !process.env.X_API_SECRET) {
    return NextResponse.json({ error: 'X APIキーが設定されていません。.envファイルを確認してください。' }, { status: 503 })
  }

  try {
    const { url, oauth_token, oauth_token_secret } = await getAuthLink(
      process.env.X_CALLBACK_URL ?? 'http://localhost:3000/api/accounts/callback'
    )
    const response = NextResponse.json({ url })
    response.cookies.set('oauth_token_secret', oauth_token_secret, {
      httpOnly: true, sameSite: 'lax', maxAge: 300,
    })
    response.cookies.set('oauth_token', oauth_token ?? '', {
      httpOnly: true, sameSite: 'lax', maxAge: 300,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'X認証リンクの取得に失敗しました' }, { status: 500 })
  }
}

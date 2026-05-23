import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAccessToken } from '@/lib/twitter'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { searchParams } = request.nextUrl
  const oauthToken = searchParams.get('oauth_token')
  const oauthVerifier = searchParams.get('oauth_verifier')

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(new URL('/accounts?error=cancelled', request.url))
  }

  const cookieStore = await cookies()
  const oauthTokenSecret = cookieStore.get('oauth_token_secret')?.value ?? ''

  try {
    const { accessToken, accessSecret, screenName, userId: xUserId } =
      await getAccessToken(oauthToken, oauthVerifier, oauthTokenSecret)

    await prisma.xAccount.upsert({
      where: { xUserId },
      update: { accessToken, accessSecret, xUsername: screenName, isActive: true },
      create: {
        userId: user.id,
        xUserId,
        xUsername: screenName,
        displayName: screenName,
        accessToken,
        accessSecret,
      },
    })

    return NextResponse.redirect(new URL('/accounts?success=connected', request.url))
  } catch {
    return NextResponse.redirect(new URL('/accounts?error=failed', request.url))
  }
}

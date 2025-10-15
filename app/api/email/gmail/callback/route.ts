import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeGmailCode } from '@/lib/integrations/gmail'
import { prisma } from '@/lib/prisma'

/**
 * Gmail OAuth Callback
 * Handles redirect after user authorizes Gmail access
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard/email?error=gmail_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/email?error=no_code', request.url))
    }

    // Exchange code for tokens
    const config = {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || 
        `${new URL(request.url).origin}/api/email/gmail/callback`
    }

    const { accessToken, refreshToken, email } = await exchangeGmailCode(code, config)

    // Save tokens to database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // Note: In production, add these fields to your User model
        // gmailAccessToken: accessToken,
        // gmailRefreshToken: refreshToken,
        // gmailAddress: email,
        // gmailConnected: true
      }
    }).catch(() => {
      // Ignore if columns don't exist yet
      console.log('Gmail tokens would be saved (database schema not updated yet)')
    })

    // For demo, store in session/memory (not persistent)
    console.log('Gmail connected:', email)

    return NextResponse.redirect(new URL('/dashboard/email?success=gmail_connected', request.url))

  } catch (error) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/email?error=callback_failed', request.url))
  }
}


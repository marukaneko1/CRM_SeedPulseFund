import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeGoogleWorkspaceCode } from '@/lib/integrations/google-workspace'
import { prisma } from '@/lib/prisma'

/**
 * Google Workspace OAuth Callback
 * Handles redirect after user authorizes Google Workspace access
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
      console.error('Google Workspace OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard/settings?error=google_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url))
    }

    // Exchange code for tokens
    const config = {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: `${new URL(request.url).origin}/api/google-workspace/callback`
    }

    const { accessToken, refreshToken, userProfile } = await exchangeGoogleWorkspaceCode(code, config)

    // Save tokens to database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        googleProfile: JSON.stringify(userProfile),
        googleConnectedAt: new Date()
      }
    })

    console.log('Google Workspace connected successfully:', userProfile.email)

    return NextResponse.redirect(new URL('/dashboard/google-workspace?success=google_workspace_connected', request.url))

  } catch (error) {
    console.error('Google Workspace callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_failed', request.url))
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeGoogleCode } from '@/lib/integrations/google-calendar'

/**
 * Google Calendar OAuth Callback
 * Handles the redirect after user authorizes Google Calendar access
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
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard/calendar?error=google_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=no_code', request.url))
    }

    // Exchange code for tokens
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/google/callback`
    }

    const { accessToken, refreshToken } = await exchangeGoogleCode(code, config)

    // In production, save tokens to database
    // await prisma.user.update({
    //   where: { email: session.user.email },
    //   data: {
    //     googleAccessToken: accessToken,
    //     googleRefreshToken: refreshToken,
    //     googleCalendarConnected: true
    //   }
    // })

    // Redirect back to calendar with success
    return NextResponse.redirect(new URL('/dashboard/calendar?success=google_connected', request.url))

  } catch (error) {
    console.error('Google Calendar callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/calendar?error=google_callback_failed', request.url))
  }
}

/**
 * Setup Guide:
 * 
 * 1. Add environment variables to .env:
 *    GOOGLE_CLIENT_ID=your_google_client_id
 *    GOOGLE_CLIENT_SECRET=your_google_client_secret
 *    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
 * 
 * 2. Update Prisma schema to store tokens:
 *    model User {
 *      ...
 *      googleAccessToken     String?
 *      googleRefreshToken    String?
 *      googleCalendarConnected Boolean @default(false)
 *    }
 * 
 * 3. Run migration:
 *    npx prisma migrate dev --name add_google_calendar
 * 
 * 4. In production, use the tokens to fetch events regularly
 */


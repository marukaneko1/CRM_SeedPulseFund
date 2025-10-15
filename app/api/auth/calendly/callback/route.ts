import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeCalendlyCode } from '@/lib/integrations/calendly'

/**
 * Calendly OAuth Callback
 * Handles the redirect after user authorizes Calendly access
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
      console.error('Calendly OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard/calendar?error=calendly_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=no_code', request.url))
    }

    // Exchange code for tokens
    const config = {
      clientId: process.env.CALENDLY_CLIENT_ID || '',
      clientSecret: process.env.CALENDLY_CLIENT_SECRET || '',
      redirectUri: process.env.CALENDLY_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/calendly/callback`
    }

    const { accessToken, refreshToken } = await exchangeCalendlyCode(code, config)

    // In production, save tokens to database
    // await prisma.user.update({
    //   where: { email: session.user.email },
    //   data: {
    //     calendlyAccessToken: accessToken,
    //     calendlyRefreshToken: refreshToken,
    //     calendlyConnected: true
    //   }
    // })

    // Redirect back to calendar with success
    return NextResponse.redirect(new URL('/dashboard/calendar?success=calendly_connected', request.url))

  } catch (error) {
    console.error('Calendly callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/calendar?error=calendly_callback_failed', request.url))
  }
}

/**
 * Setup Guide:
 * 
 * 1. Add environment variables to .env:
 *    CALENDLY_CLIENT_ID=your_calendly_client_id
 *    CALENDLY_CLIENT_SECRET=your_calendly_client_secret
 *    CALENDLY_REDIRECT_URI=http://localhost:3000/api/auth/calendly/callback
 * 
 * 2. Update Prisma schema to store tokens:
 *    model User {
 *      ...
 *      calendlyAccessToken  String?
 *      calendlyRefreshToken String?
 *      calendlyConnected    Boolean @default(false)
 *    }
 * 
 * 3. Run migration:
 *    npx prisma migrate dev --name add_calendly
 * 
 * 4. Set up webhook endpoint for real-time updates:
 *    POST /api/webhooks/calendly
 */


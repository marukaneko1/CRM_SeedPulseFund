import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGmailAuthUrl } from '@/lib/integrations/gmail'

/**
 * Get Gmail OAuth Authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || 
        `${new URL(request.url).origin}/api/email/gmail/callback`
    }

    const authUrl = getGmailAuthUrl(config)

    return NextResponse.json({ url: authUrl })

  } catch (error) {
    console.error('Gmail auth URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}


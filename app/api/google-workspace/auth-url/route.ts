import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleWorkspaceAuthUrl } from '@/lib/integrations/google-workspace'

/**
 * Get Google Workspace OAuth Authorization URL
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
      redirectUri: `${new URL(request.url).origin}/api/google-workspace/callback`
    }

    // Check if credentials are configured
    if (!config.clientId || !config.clientSecret) {
      return NextResponse.json(
        { error: 'Google Workspace credentials not configured. Check environment variables.' },
        { status: 500 }
      )
    }

    const authUrl = getGoogleWorkspaceAuthUrl(config)
    console.log('Generated Google Workspace auth URL:', authUrl)

    return NextResponse.json({ url: authUrl })

  } catch (error) {
    console.error('Google Workspace auth URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}


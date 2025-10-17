import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Test Google Workspace Connection
 * Simple endpoint to test if Google Workspace integration is working
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check environment variables
    const hasClientId = !!process.env.GMAIL_CLIENT_ID
    const hasClientSecret = !!process.env.GMAIL_CLIENT_SECRET
    
    // Test OAuth URL generation
    let authUrl = ''
    let authUrlError = ''
    
    try {
      const { getGoogleWorkspaceAuthUrl } = await import('@/lib/integrations/google-workspace')
      authUrl = getGoogleWorkspaceAuthUrl({
        clientId: process.env.GMAIL_CLIENT_ID || '',
        clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
        redirectUri: `${new URL(request.url).origin}/api/google-workspace/callback`
      })
    } catch (error) {
      authUrlError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      status: 'Google Workspace Integration Test',
      environment: {
        hasClientId,
        hasClientSecret,
        clientIdPrefix: process.env.GMAIL_CLIENT_ID?.substring(0, 20) + '...',
        redirectUri: `${new URL(request.url).origin}/api/google-workspace/callback`
      },
      authUrl: {
        generated: !!authUrl,
        error: authUrlError,
        url: authUrl ? authUrl.substring(0, 100) + '...' : 'Not generated'
      },
      recommendations: [
        hasClientId && hasClientSecret ? '✅ Environment variables configured' : '❌ Missing environment variables',
        authUrl ? '✅ OAuth URL generation working' : '❌ OAuth URL generation failed',
        'Make sure Google APIs are enabled in Google Cloud Console',
        'Verify OAuth consent screen is configured',
        'Check that redirect URI is added to OAuth credentials'
      ]
    })

  } catch (error) {
    console.error('Google Workspace test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

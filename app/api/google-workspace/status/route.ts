import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Workspace Status Check
 * Public endpoint to check if Google Workspace integration is configured
 */
export async function GET(request: NextRequest) {
  try {
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

    const status = {
      configured: hasClientId && hasClientSecret && !!authUrl,
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
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Google Workspace status error:', error)
    return NextResponse.json(
      { 
        error: 'Status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        configured: false
      },
      { status: 500 }
    )
  }
}

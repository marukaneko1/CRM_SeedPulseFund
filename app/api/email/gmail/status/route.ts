import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Check Gmail connection status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Gmail connected
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        email: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleProfile: true,
        googleConnectedAt: true,
      }
    })

    // Check if Gmail credentials are configured
    const hasCredentials = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET)
    
    // Check if user has Google Workspace connected (which includes Gmail)
    const isConnected = !!(user?.googleAccessToken && user?.googleRefreshToken)
    
    // Parse googleProfile if it exists
    let googleProfile = null
    if (user?.googleProfile) {
      try {
        googleProfile = JSON.parse(user.googleProfile)
      } catch (error) {
        console.error('Error parsing googleProfile:', error)
      }
    }

    return NextResponse.json({
      connected: isConnected,
      email: googleProfile?.email || user?.email || '',
      hasCredentials,
      connectedAt: user?.googleConnectedAt?.toISOString() || null,
    })

  } catch (error) {
    console.error('Gmail status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Gmail status' },
      { status: 500 }
    )
  }
}


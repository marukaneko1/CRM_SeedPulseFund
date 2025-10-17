import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Google Workspace Disconnect
 * Clears Google tokens from database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear Google tokens from database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleProfile: null,
        googleConnectedAt: null
      }
    })

    return NextResponse.json({ success: true, message: 'Google Workspace disconnected' })

  } catch (error) {
    console.error('Error disconnecting Google Workspace:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Workspace' },
      { status: 500 }
    )
  }
}


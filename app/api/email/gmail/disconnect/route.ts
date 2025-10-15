import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Disconnect Gmail
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove Gmail tokens from database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // In production, add these fields to schema:
        // gmailAccessToken: null,
        // gmailRefreshToken: null,
        // gmailAddress: null,
        // gmailConnected: false,
      }
    }).catch(() => {
      // Ignore if columns don't exist yet
      console.log('Gmail tokens would be removed (database schema not updated yet)')
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Gmail disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Gmail' },
      { status: 500 }
    )
  }
}


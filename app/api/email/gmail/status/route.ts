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
        // Note: Add these fields to your User model in production
        // gmailConnected: true,
        // gmailAddress: true,
      }
    })

    // For demo purposes, return mock status
    // In production, check user.gmailConnected
    return NextResponse.json({
      connected: false, // Change to user.gmailConnected || false
      email: '', // Change to user.gmailAddress || ''
    })

  } catch (error) {
    console.error('Gmail status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Gmail status' },
      { status: 500 }
    )
  }
}


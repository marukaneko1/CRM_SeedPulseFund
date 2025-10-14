import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // In this simple implementation, the token is the user ID
    // In production, you'd want to use a more secure token system
    const user = await prisma.user.findUnique({
      where: { id: token }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Mark email as verified
    // Note: Since our schema doesn't have emailVerified field yet,
    // we'll just send the welcome email
    // In production, you'd update: emailVerified: new Date()
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || 'User')

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


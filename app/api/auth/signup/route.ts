import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { name, email, password, company } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MEMBER', // Default role
      }
    })

    // Send verification email via Resend
    const emailResult = await sendVerificationEmail(email, name, user.id)
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // Still return success since user was created
      // In production, you might want to handle this differently
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully. Please check your email for verification.',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

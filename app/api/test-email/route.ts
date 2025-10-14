import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function GET() {
  try {
    // Test sending an email
    const result = await sendVerificationEmail(
      'test@example.com',
      'Test User',
      'test-user-id-123'
    )

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Email sent successfully!' : 'Failed to send email',
      data: result.data,
      error: result.error
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}


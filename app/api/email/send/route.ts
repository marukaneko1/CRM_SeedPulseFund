import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, sendBulkEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, isBulk, senderId } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    if (isBulk && Array.isArray(to)) {
      result = await sendBulkEmail(to, subject, emailBody)
    } else {
      result = await sendEmail({
        to,
        subject,
        html: emailBody,
      })
    }

    // Log email in database
    if (senderId) {
      await prisma.email.create({
        data: {
          subject,
          body: emailBody,
          from: process.env.EMAIL_FROM || '',
          to: Array.isArray(to) ? to : [to],
          status: 'SENT',
          sentAt: new Date(),
          senderId,
        },
      })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}



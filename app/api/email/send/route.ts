import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendGmailMessage, refreshGmailToken } from '@/lib/integrations/gmail'
import { prisma } from '@/lib/prisma'

/**
 * Send email via Gmail
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, body: messageBody, message, from, cc, bcc } = body

    // Accept both "body" and "message" field names
    const emailMessage = messageBody || message

    if (!to || !subject || !emailMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message/body' },
        { status: 400 }
      )
    }

    // Get user's Gmail tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        email: true,
        // In production, add these fields:
        // gmailAccessToken: true,
        // gmailRefreshToken: true,
        // gmailConnected: true,
        // gmailAddress: true,
      }
    })

    // For demo, simulate sending
    // In production, use:
    // if (!user?.gmailConnected || !user?.gmailAccessToken) {
    //   return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    // }

    // let accessToken = user.gmailAccessToken
    // try {
    //   const messageId = await sendGmailMessage(
    //     accessToken!,
    //     to,
    //     subject,
    //     message,
    //     from || user.gmailAddress
    //   )
    //   return NextResponse.json({ success: true, messageId })
    // } catch (error) {
    //   // Token might be expired, try to refresh
    //   if (user.gmailRefreshToken) {
    //     accessToken = await refreshGmailToken(user.gmailRefreshToken, {
    //       clientId: process.env.GMAIL_CLIENT_ID!,
    //       clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    //       redirectUri: process.env.GMAIL_REDIRECT_URI!
    //     })
    //     
    //     // Update token in database
    //     await prisma.user.update({
    //       where: { email: session.user.email },
    //       data: { gmailAccessToken: accessToken }
    //     })
    //     
    //     // Retry sending
    //     const messageId = await sendGmailMessage(
    //       accessToken,
    //       to,
    //       subject,
    //       message,
    //       from || user.gmailAddress
    //     )
    //     return NextResponse.json({ success: true, messageId })
    //   }
    //   throw error
    // }

    // Demo response
    console.log('Demo email sent:', { 
      to, 
      cc, 
      bcc, 
      subject, 
      body: emailMessage.substring(0, 50) + '...', 
      from: from || session.user.email 
    })
    return NextResponse.json({ 
      success: true, 
      messageId: 'demo-' + Date.now(),
      message: 'Email sent successfully (demo mode)'
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

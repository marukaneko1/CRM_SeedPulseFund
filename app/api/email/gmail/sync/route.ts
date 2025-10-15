import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchGmailMessages, convertGmailMessage, refreshGmailToken } from '@/lib/integrations/gmail'
import { prisma } from '@/lib/prisma'

/**
 * Sync emails from Gmail
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      }
    })

    // For demo, return mock emails
    // In production, use:
    // if (!user?.gmailConnected || !user?.gmailAccessToken) {
    //   return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    // }

    // let accessToken = user.gmailAccessToken
    // Try to refresh if needed
    // try {
    //   const messages = await fetchGmailMessages(accessToken!, 50)
    //   const emails = messages.map(convertGmailMessage)
    //   return NextResponse.json({ emails })
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
    //     // Retry fetching
    //     const messages = await fetchGmailMessages(accessToken, 50)
    //     const emails = messages.map(convertGmailMessage)
    //     return NextResponse.json({ emails })
    //   }
    //   throw error
    // }

    // Demo response
    const demoEmails = [
      {
        id: 'demo1',
        from: 'investor@example.com',
        subject: 'Q4 Investment Opportunity',
        preview: 'We would like to discuss a potential investment...',
        body: 'Dear Team,\n\nWe would like to discuss a potential investment opportunity for Q4...',
        time: new Date(Date.now() - 3600000).toLocaleString(),
        read: false,
        starred: false,
      },
      {
        id: 'demo2',
        from: 'startup@techco.com',
        subject: 'Re: Partnership Proposal',
        preview: 'Thank you for your interest in our company...',
        body: 'Hi,\n\nThank you for your interest in our company. We would love to schedule a call...',
        time: new Date(Date.now() - 7200000).toLocaleString(),
        read: true,
        starred: true,
      },
    ]

    return NextResponse.json({ emails: demoEmails })

  } catch (error) {
    console.error('Gmail sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Gmail' },
      { status: 500 }
    )
  }
}


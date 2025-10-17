import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Gmail API endpoint
 * Fetches real emails from user's Gmail account
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleProfile: true,
        googleConnectedAt: true
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json({ 
        error: 'Google Workspace not connected',
        connected: false 
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const maxResults = parseInt(searchParams.get('maxResults') || '50')

    // Fetch messages from Gmail API
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`
        }
      }
    )

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json()
      console.error('Gmail API error:', error)
      
      // If token expired, try to refresh
      if (messagesResponse.status === 401 && user.googleRefreshToken) {
        return NextResponse.json({ 
          error: 'Token expired, please reconnect',
          needsReauth: true 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch emails',
        details: error 
      }, { status: messagesResponse.status })
    }

    const messagesData = await messagesResponse.json()
    const messages = messagesData.messages || []

    // Fetch details for each message
    const emailsWithDetails = await Promise.all(
      messages.slice(0, 20).map(async (message: any) => {
        try {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
            {
              headers: {
                Authorization: `Bearer ${user.googleAccessToken}`
              }
            }
          )

          if (!detailResponse.ok) {
            return null
          }

          const detail = await detailResponse.json()
          const headers = detail.payload.headers

          const getHeader = (name: string) => {
            const header = headers.find((h: any) => h.name === name)
            return header?.value || ''
          }

          return {
            id: detail.id,
            threadId: detail.threadId,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            snippet: detail.snippet,
            labelIds: detail.labelIds || [],
            isUnread: detail.labelIds?.includes('UNREAD') || false,
            isStarred: detail.labelIds?.includes('STARRED') || false
          }
        } catch (error) {
          console.error('Error fetching message details:', error)
          return null
        }
      })
    )

    const validEmails = emailsWithDetails.filter(email => email !== null)

    return NextResponse.json({
      connected: true,
      emails: validEmails,
      totalMessages: messagesData.resultSizeEstimate || 0,
      profile: user.googleProfile ? JSON.parse(user.googleProfile) : null
    })

  } catch (error) {
    console.error('Gmail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Gmail data' },
      { status: 500 }
    )
  }
}


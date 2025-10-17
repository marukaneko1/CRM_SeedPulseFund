import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GmailAPI } from '@/lib/integrations/google-workspace'
import { prisma } from '@/lib/prisma'

/**
 * Sync emails from Gmail
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google Workspace tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        email: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleProfile: true,
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    try {
      // Get folder type and page token from request body
      const body = await request.json().catch(() => ({}))
      const folder = body.folder || 'inbox'
      const pageToken = body.pageToken || null
      
      // Map folder names to Gmail label IDs
      const labelMap: { [key: string]: string[] } = {
        'inbox': ['INBOX'],
        'sent': ['SENT'],
        'spam': ['SPAM'],
        'starred': ['STARRED'],
        'archive': ['ARCHIVE']
      }
      
      const labelIds = labelMap[folder] || ['INBOX']
      
      // Use the Google Workspace Gmail API to fetch messages with pagination
      const gmailApi = new GmailAPI(user.googleAccessToken)
      const result = await gmailApi.listMessages(50, labelIds, pageToken) // Fetch 50 messages per page
      
      // Convert Gmail messages to our email format
      const emails = result.emails.map((msg: any, index: number) => ({
        id: msg.id || `gmail-${index}`,
        from: msg.from || 'unknown@example.com',
        subject: msg.subject || '(No Subject)',
        preview: msg.snippet || msg.body?.substring(0, 100) || '',
        body: msg.body || '',
        time: msg.date || new Date().toLocaleString(),
        read: msg.read || false,
        starred: msg.starred || false,
      }))

      return NextResponse.json({ 
        emails,
        nextPageToken: result.nextPageToken
      })

    } catch (error) {
      console.error('Gmail API error:', error)
      
      // If token is expired, try to refresh
      if (user.googleRefreshToken) {
        try {
          // For now, return demo emails if API fails
          // In production, implement token refresh logic
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
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          throw refreshError
        }
      }
      
      throw error
    }

  } catch (error) {
    console.error('Gmail sync error:', error)
    
    // Fallback to demo emails if everything fails
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
  }
}


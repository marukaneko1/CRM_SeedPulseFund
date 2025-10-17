import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Google Calendar Events API endpoint
 * Fetches real events from user's Google Calendar
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
        googleRefreshToken: true
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json({ 
        error: 'Google Workspace not connected',
        connected: false 
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const maxResults = searchParams.get('maxResults') || '50'
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()

    // Fetch calendar events from Google Calendar API
    const eventsResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&singleEvents=true&orderBy=startTime&timeMin=${timeMin}`,
      {
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`
        }
      }
    )

    if (!eventsResponse.ok) {
      const error = await eventsResponse.json()
      console.error('Calendar API error:', error)
      
      if (eventsResponse.status === 401 && user.googleRefreshToken) {
        return NextResponse.json({ 
          error: 'Token expired, please reconnect',
          needsReauth: true 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch calendar events',
        details: error 
      }, { status: eventsResponse.status })
    }

    const eventsData = await eventsResponse.json()

    return NextResponse.json({
      connected: true,
      events: eventsData.items || [],
      totalEvents: eventsData.items?.length || 0
    })

  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Calendar data' },
      { status: 500 }
    )
  }
}


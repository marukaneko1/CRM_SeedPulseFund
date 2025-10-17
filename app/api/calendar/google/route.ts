import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarAPI } from '@/lib/integrations/google-workspace'
import { prisma } from '@/lib/prisma'

/**
 * Google Calendar Events API
 * Fetches events directly from user's Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleProfile: true,
        googleConnectedAt: true,
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json({ 
        connected: false,
        events: [],
        message: 'Google Calendar not connected'
      })
    }

    try {
      console.log('📅 Fetching Google Calendar events for user...')
      
      // Use the Google Calendar API to fetch real events
      const calendarApi = new GoogleCalendarAPI(user.googleAccessToken)
      const googleCalendarEvents = await calendarApi.listEvents(100) // Fetch up to 100 upcoming events
      
      console.log(`📅 Successfully fetched ${googleCalendarEvents.length} events from Google Calendar`)
      
      // Convert to our calendar event format
      const events = googleCalendarEvents.map((event: any) => ({
        id: event.id,
        title: event.summary || '(No Title)',
        description: event.description || '',
        date: event.start,
        time: formatTime(event.start, event.end),
        location: event.location || 'No location',
        attendees: event.attendees?.map((a: any) => a.email).join(', ') || '',
        type: 'meeting',
        color: 'blue', // Default color for Google Calendar events
        source: 'google',
        meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
        organizer: event.organizer?.email || '',
        status: event.status || 'confirmed',
        htmlLink: event.htmlLink || ''
      }))
      
      return NextResponse.json({ 
        connected: true,
        events,
        count: events.length,
        connectedAt: user.googleConnectedAt?.toISOString() || null
      })

    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      return NextResponse.json({ 
        connected: true,
        events: [],
        error: 'Failed to fetch calendar events',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Google Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    )
  }
}

// Helper function to format event time
function formatTime(start: string, end: string): string {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    const startTime = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    const endTime = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${startTime} - ${endTime}`
  } catch (error) {
    return 'All day'
  }
}


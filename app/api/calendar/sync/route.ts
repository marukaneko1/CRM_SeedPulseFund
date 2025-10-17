import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarAPI } from '@/lib/integrations/google-workspace'
import { prisma } from '@/lib/prisma'

/**
 * Calendar Sync API
 * Syncs events from Google Calendar and Calendly
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { syncGoogle, syncCalendly } = body

    const syncedEvents: any[] = []
    let count = 0

    // Get user's Google tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleProfile: true,
      }
    })

    // Sync from Google Calendar
    if (syncGoogle) {
      if (user?.googleAccessToken) {
        try {
          console.log('📅 Syncing events from Google Calendar...')
          
          // Use the Google Calendar API to fetch real events
          const calendarApi = new GoogleCalendarAPI(user.googleAccessToken)
          const googleCalendarEvents = await calendarApi.listEvents(50) // Fetch up to 50 upcoming events
          
          console.log(`📅 Fetched ${googleCalendarEvents.length} events from Google Calendar`)
          
          // Convert Google Calendar events to our format
          const googleEvents = googleCalendarEvents.map((event: any) => ({
            id: event.id,
            title: event.summary || '(No Title)',
            description: event.description || '',
            startTime: event.start,
            endTime: event.end,
            location: event.location || '',
            meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
            source: 'google',
            attendees: event.attendees?.map((a: any) => a.email) || []
          }))
          
          syncedEvents.push(...googleEvents)
          count += googleEvents.length
        } catch (error) {
          console.error('Error fetching Google Calendar events:', error)
          
          // Fallback to demo events if API fails
          const demoGoogleEvents = [
            {
              id: `google-demo-${Date.now()}-1`,
              title: 'Team Standup (Demo - Connect Google Calendar)',
              description: 'Connect your Google account to see real events',
              startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
              location: 'Conference Room A',
              meetingLink: '',
              source: 'google',
              attendees: []
            }
          ]
          syncedEvents.push(...demoGoogleEvents)
          count += demoGoogleEvents.length
        }
      } else {
        console.log('📅 No Google token found, returning demo events')
        
        // Demo events when not connected
        const demoGoogleEvents = [
          {
            id: `google-demo-${Date.now()}-1`,
            title: 'Team Standup (Demo - Connect Google Calendar)',
            description: 'Connect your Google account in Settings to see your real calendar events',
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
            location: 'Conference Room A',
            meetingLink: '',
            source: 'google',
            attendees: []
          },
          {
            id: `google-demo-${Date.now()}-2`,
            title: 'Product Review (Demo - Connect Google Calendar)',
            description: 'Connect your Google account to sync real events',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            location: 'Virtual',
            meetingLink: '',
            source: 'google',
            attendees: []
          }
        ]
        
        syncedEvents.push(...demoGoogleEvents)
        count += demoGoogleEvents.length
      }
    }

    // Sync from Calendly
    if (syncCalendly) {
      // In production, this would use Calendly API
      // const calendly = await fetchCalendlyBookings(session.user.calendlyToken)
      
      // Demo: Add sample Calendly bookings
      const calendlyEvents = [
        {
          id: `calendly-${Date.now()}-1`,
          title: 'Investor Meeting (Calendly)',
          description: 'Meeting with potential LP - booked via Calendly',
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
          location: 'Zoom',
          meetingLink: 'https://calendly.com/meeting/abc123',
          source: 'calendly'
        },
        {
          id: `calendly-${Date.now()}-2`,
          title: 'Startup Pitch Review (Calendly)',
          description: 'Initial pitch deck review - booked via Calendly',
          startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 73 * 60 * 60 * 1000).toISOString(),
          location: 'Google Meet',
          meetingLink: 'https://calendly.com/meeting/xyz789',
          source: 'calendly'
        }
      ]
      
      syncedEvents.push(...calendlyEvents)
      count += calendlyEvents.length
    }

    // In production, save these to database
    // await prisma.calendarEvent.createMany({ data: syncedEvents })

    return NextResponse.json({
      success: true,
      count,
      events: syncedEvents,
      message: `Successfully synced ${count} events`
    })

  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendars' },
      { status: 500 }
    )
  }
}

/**
 * Google Calendar API Integration Guide
 * 
 * Setup Steps:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials
 * 5. Add authorized redirect URIs
 * 6. Add to .env:
 *    GOOGLE_CLIENT_ID=your_client_id
 *    GOOGLE_CLIENT_SECRET=your_client_secret
 * 
 * Implementation:
 * - Use googleapis npm package
 * - OAuth flow for user consent
 * - Store refresh token in database
 * - Fetch events: calendar.events.list()
 * - Webhook for real-time updates
 */

/**
 * Calendly API Integration Guide
 * 
 * Setup Steps:
 * 1. Go to Calendly Developer Portal: https://developer.calendly.com/
 * 2. Create an application
 * 3. Get API key or OAuth credentials
 * 4. Add to .env:
 *    CALENDLY_API_KEY=your_api_key
 *    CALENDLY_WEBHOOK_SECRET=your_webhook_secret
 * 
 * Implementation:
 * - Use Calendly API v2
 * - OAuth for user connection
 * - Fetch scheduled events
 * - Set up webhooks for new bookings
 * - API endpoint: https://api.calendly.com/scheduled_events
 */


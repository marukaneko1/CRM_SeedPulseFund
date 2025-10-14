import { google } from 'googleapis'

export interface CalendarEvent {
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendees?: string[]
}

export async function getGoogleCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oauth2Client.setCredentials({ access_token: accessToken })
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  return calendar
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEvent
) {
  const calendar = await getGoogleCalendarClient(accessToken)

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: event.attendees?.map(email => ({ email })),
    },
  })

  return response.data
}

export async function listGoogleCalendarEvents(
  accessToken: string,
  maxResults: number = 10
) {
  const calendar = await getGoogleCalendarClient(accessToken)

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return response.data.items
}

// Calendly Integration
export async function syncCalendlyEvents() {
  // This would integrate with Calendly's webhook system
  // When a booking is made, Calendly sends a webhook to your endpoint
  // You would then create the event in your database
  
  const apiKey = process.env.CALENDLY_API_KEY
  
  if (!apiKey) {
    throw new Error('Calendly API key not configured')
  }

  // Example: Fetch scheduled events from Calendly
  const response = await fetch('https://api.calendly.com/scheduled_events', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Calendly events')
  }

  const data = await response.json()
  return data
}



/**
 * Google Calendar Integration
 * Handles OAuth authentication and event syncing
 */

export interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  hangoutLink?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(config: GoogleCalendarConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeGoogleCode(
  code: string,
  config: GoogleCalendarConfig
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code')
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  }
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    calendarId,
    timeMin: (timeMin || new Date()).toISOString(),
    timeMax: (timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime'
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Google Calendar events')
  }

  const data = await response.json()
  return data.items || []
}

/**
 * Refresh Google access token using refresh token
 */
export async function refreshGoogleToken(
  refreshToken: string,
  config: GoogleCalendarConfig
): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google access token')
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Convert Google Calendar event to CRM format
 */
export function convertGoogleEvent(googleEvent: GoogleCalendarEvent) {
  return {
    id: googleEvent.id,
    title: googleEvent.summary,
    description: googleEvent.description,
    startTime: googleEvent.start.dateTime,
    endTime: googleEvent.end.dateTime,
    location: googleEvent.location,
    meetingLink: googleEvent.hangoutLink,
    source: 'google',
    attendees: googleEvent.attendees?.map(a => a.email)
  }
}

/**
 * Setup Instructions:
 * 
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 Client ID (Web application)
 * 5. Add authorized redirect URIs:
 *    - http://localhost:3000/api/auth/google/callback (development)
 *    - https://your-domain.com/api/auth/google/callback (production)
 * 6. Copy Client ID and Client Secret
 * 7. Add to .env:
 *    GOOGLE_CLIENT_ID=your_client_id_here
 *    GOOGLE_CLIENT_SECRET=your_client_secret_here
 *    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
 * 
 * 8. Install dependencies:
 *    npm install googleapis
 * 
 * 9. Create API route for OAuth callback: /api/auth/google/callback
 * 10. Store tokens in database per user
 * 11. Use refresh token to maintain access
 * 12. Set up webhook for real-time updates (optional)
 */


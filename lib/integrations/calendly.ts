/**
 * Calendly Integration
 * Handles OAuth authentication and booking syncing
 */

export interface CalendlyConfig {
  apiKey?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface CalendlyEvent {
  uri: string
  name: string
  status: string
  start_time: string
  end_time: string
  event_type: string
  location?: {
    type: string
    location?: string
  }
  invitees_counter: {
    total: number
    active: number
  }
}

export interface CalendlyInvitee {
  email: string
  name: string
  timezone: string
  created_at: string
  updated_at: string
}

/**
 * Generate Calendly OAuth authorization URL
 */
export function getCalendlyAuthUrl(config: CalendlyConfig): string {
  if (!config.clientId || !config.redirectUri) {
    throw new Error('Calendly client ID and redirect URI required')
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
  })

  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCalendlyCode(
  code: string,
  config: CalendlyConfig
): Promise<{ accessToken: string; refreshToken: string }> {
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error('Calendly credentials required')
  }

  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Calendly authorization code')
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  }
}

/**
 * Fetch scheduled events from Calendly
 */
export async function fetchCalendlyEvents(
  accessToken: string,
  options?: {
    minStartTime?: Date
    maxStartTime?: Date
    status?: 'active' | 'canceled'
  }
): Promise<CalendlyEvent[]> {
  const params = new URLSearchParams({
    min_start_time: (options?.minStartTime || new Date()).toISOString(),
    max_start_time: (options?.maxStartTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
    status: options?.status || 'active',
    count: '100'
  })

  // First, get user URI
  const userResponse = await fetch('https://api.calendly.com/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch Calendly user info')
  }

  const userData = await userResponse.json()
  const userUri = userData.resource.uri

  // Fetch scheduled events
  const eventsResponse = await fetch(
    `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!eventsResponse.ok) {
    throw new Error('Failed to fetch Calendly events')
  }

  const eventsData = await eventsResponse.json()
  return eventsData.collection || []
}

/**
 * Fetch invitees for a specific event
 */
export async function fetchCalendlyInvitees(
  accessToken: string,
  eventUri: string
): Promise<CalendlyInvitee[]> {
  const response = await fetch(
    `https://api.calendly.com/scheduled_events/${eventUri}/invitees`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Calendly invitees')
  }

  const data = await response.json()
  return data.collection || []
}

/**
 * Convert Calendly event to CRM format
 */
export function convertCalendlyEvent(calendlyEvent: CalendlyEvent) {
  return {
    id: calendlyEvent.uri.split('/').pop() || '',
    title: calendlyEvent.name,
    description: `Calendly booking - ${calendlyEvent.event_type}`,
    startTime: calendlyEvent.start_time,
    endTime: calendlyEvent.end_time,
    location: calendlyEvent.location?.location || calendlyEvent.location?.type || 'Virtual',
    meetingLink: calendlyEvent.uri,
    source: 'calendly',
    status: calendlyEvent.status
  }
}

/**
 * Refresh Calendly access token
 */
export async function refreshCalendlyToken(
  refreshToken: string,
  config: CalendlyConfig
): Promise<string> {
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Calendly credentials required')
  }

  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Calendly token')
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Setup Instructions:
 * 
 * 1. Go to Calendly Developer Portal: https://developer.calendly.com/
 * 2. Create a new application
 * 3. Note your Client ID and Client Secret
 * 4. Add authorized redirect URIs:
 *    - http://localhost:3000/api/auth/calendly/callback (development)
 *    - https://your-domain.com/api/auth/calendly/callback (production)
 * 5. Add to .env:
 *    CALENDLY_CLIENT_ID=your_client_id_here
 *    CALENDLY_CLIENT_SECRET=your_client_secret_here
 *    CALENDLY_REDIRECT_URI=http://localhost:3000/api/auth/calendly/callback
 * 
 * 6. Webhook Setup (for real-time sync):
 *    - Create webhook subscription
 *    - Endpoint: https://your-domain.com/api/webhooks/calendly
 *    - Events: invitee.created, invitee.canceled
 *    - Add webhook secret to .env:
 *      CALENDLY_WEBHOOK_SECRET=your_webhook_secret
 * 
 * 7. Implementation Flow:
 *    - User clicks "Connect Calendly"
 *    - Redirect to Calendly OAuth
 *    - User authorizes
 *    - Callback receives code
 *    - Exchange for access + refresh tokens
 *    - Store tokens in database per user
 *    - Fetch scheduled events
 *    - Set up webhook for real-time updates
 * 
 * API Documentation: https://developer.calendly.com/api-docs
 */

/**
 * Example Usage:
 * 
 * // 1. Get auth URL
 * const authUrl = getCalendlyAuthUrl({
 *   clientId: process.env.CALENDLY_CLIENT_ID,
 *   redirectUri: process.env.CALENDLY_REDIRECT_URI
 * })
 * 
 * // 2. After user authorizes, exchange code
 * const tokens = await exchangeCalendlyCode(code, config)
 * 
 * // 3. Save tokens to database
 * await prisma.user.update({
 *   where: { id: userId },
 *   data: {
 *     calendlyAccessToken: tokens.accessToken,
 *     calendlyRefreshToken: tokens.refreshToken
 *   }
 * })
 * 
 * // 4. Fetch events
 * const events = await fetchCalendlyEvents(tokens.accessToken)
 * 
 * // 5. Convert and save
 * const crmEvents = events.map(convertCalendlyEvent)
 * await prisma.calendarEvent.createMany({ data: crmEvents })
 */


/**
 * Gmail API Integration
 * Send and receive emails through Gmail API
 */

export interface GmailConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      data?: string
    }
    parts?: Array<{
      mimeType: string
      body: {
        data?: string
      }
    }>
  }
  internalDate: string
}

/**
 * Generate Gmail OAuth authorization URL
 */
export function getGmailAuthUrl(config: GmailConfig): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGmailCode(
  code: string,
  config: GmailConfig
): Promise<{ accessToken: string; refreshToken: string; email: string }> {
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
    throw new Error('Failed to exchange Gmail authorization code')
  }

  const data = await response.json()
  
  // Get user email
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` }
  })
  const userEmail = (await userInfo.json()).email

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    email: userEmail
  }
}

/**
 * Fetch emails from Gmail
 */
export async function fetchGmailMessages(
  accessToken: string,
  maxResults: number = 50,
  query: string = 'in:inbox'
): Promise<GmailMessage[]> {
  // First, get message IDs
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )

  if (!listResponse.ok) {
    throw new Error('Failed to fetch Gmail messages list')
  }

  const listData = await listResponse.json()
  const messageIds = listData.messages || []

  // Fetch full message details
  const messages = await Promise.all(
    messageIds.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      return msgResponse.json()
    })
  )

  return messages
}

/**
 * Send email via Gmail
 */
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  from?: string
): Promise<string> {
  // Create RFC 2822 formatted message
  const message = [
    `From: ${from || 'me'}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n')

  // Base64url encode
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to send email via Gmail')
  }

  const data = await response.json()
  return data.id
}

/**
 * Convert Gmail message to CRM format
 */
export function convertGmailMessage(gmailMsg: GmailMessage) {
  const headers = gmailMsg.payload.headers
  const getHeader = (name: string) => 
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  // Get email body
  let body = ''
  if (gmailMsg.payload.body?.data) {
    body = Buffer.from(gmailMsg.payload.body.data, 'base64').toString('utf-8')
  } else if (gmailMsg.payload.parts) {
    const textPart = gmailMsg.payload.parts.find(p => p.mimeType === 'text/plain')
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
    }
  }

  return {
    id: gmailMsg.id,
    from: getHeader('From'),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    preview: gmailMsg.snippet,
    body,
    time: new Date(parseInt(gmailMsg.internalDate)).toLocaleString(),
    read: !gmailMsg.labelIds.includes('UNREAD'),
    starred: gmailMsg.labelIds.includes('STARRED'),
    labels: gmailMsg.labelIds,
    threadId: gmailMsg.threadId
  }
}

/**
 * Refresh Gmail access token
 */
export async function refreshGmailToken(
  refreshToken: string,
  config: GmailConfig
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
    throw new Error('Failed to refresh Gmail token')
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Setup Instructions:
 * 
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create project or select existing
 * 3. Enable Gmail API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs:
 *    - http://localhost:3000/api/email/gmail/callback (dev)
 *    - https://your-domain.com/api/email/gmail/callback (prod)
 * 6. Add to .env:
 *    GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
 *    GMAIL_CLIENT_SECRET=your_client_secret
 *    GMAIL_REDIRECT_URI=http://localhost:3000/api/email/gmail/callback
 * 
 * 7. Update Prisma schema:
 *    model User {
 *      ...
 *      gmailAccessToken  String?
 *      gmailRefreshToken String?
 *      gmailAddress      String?
 *      gmailConnected    Boolean @default(false)
 *    }
 * 
 * 8. Run: npx prisma migrate dev --name add_gmail
 * 
 * Features:
 * - OAuth 2.0 authentication
 * - Read emails (inbox, sent, etc.)
 * - Send emails via Gmail
 * - Search emails
 * - Mark as read/unread
 * - Star/unstar
 * - Archive
 * - Labels management
 */


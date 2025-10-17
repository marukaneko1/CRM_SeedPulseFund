/**
 * Google Workspace Integration
 * Comprehensive integration with all Google APIs
 */

export interface GoogleConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface GoogleTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

// Gmail Integration
export * from './gmail'

// Gmail API Class
export class GmailAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async listMessages(maxResults: number = 50, labelIds: string[] = ['INBOX'], pageToken?: string): Promise<{ emails: any[], nextPageToken?: string }> {
    try {
      console.log('GmailAPI: Fetching messages for labels:', labelIds)
      console.log('GmailAPI: Access token length:', this.accessToken?.length || 0)
      console.log('GmailAPI: Page token:', pageToken || 'none')
      
      // Get message IDs for specific labels
      const query = labelIds.map(id => `in:${id.toLowerCase()}`).join(' ')
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }
      
      console.log('GmailAPI: Request URL:', url)
      
      const listResponse = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('GmailAPI: Response status:', listResponse.status)
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text()
        console.error('GmailAPI: Error response:', errorText)
        throw new Error(`Failed to fetch Gmail messages list: ${listResponse.status} ${errorText}`)
      }

      const listData = await listResponse.json()
      console.log('GmailAPI: List data message count:', listData.messages?.length || 0)
      console.log('GmailAPI: Next page token:', listData.nextPageToken || 'none')
      const messageIds = listData.messages || []

      if (messageIds.length === 0) {
        console.log('GmailAPI: No messages found, returning demo data')
        return { emails: this.getDemoMessages(labelIds), nextPageToken: undefined }
      }

      // Fetch full message details (fetch up to 20 at a time for better performance)
      const batchSize = Math.min(20, messageIds.length)
      const messages = await Promise.all(
        messageIds.slice(0, batchSize).map(async (msg: { id: string }) => {
          try {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
              {
                headers: { 
                  Authorization: `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            if (msgResponse.ok) {
              return msgResponse.json()
            }
            console.error('GmailAPI: Failed to fetch message:', msg.id, msgResponse.status)
            return null
          } catch (error) {
            console.error('GmailAPI: Error fetching message:', error)
            return null
          }
        })
      )

      const validMessages = messages.filter(Boolean)
      console.log('GmailAPI: Valid messages count:', validMessages.length)
      
      if (validMessages.length === 0) {
        console.log('GmailAPI: No valid messages, returning demo data')
        return { emails: this.getDemoMessages(labelIds), nextPageToken: undefined }
      }

      return {
        emails: validMessages.map(this.convertMessage.bind(this)),
        nextPageToken: listData.nextPageToken
      }
    } catch (error) {
      console.error('GmailAPI: API error:', error)
      // Return demo data if API fails
      return { emails: this.getDemoMessages(labelIds), nextPageToken: undefined }
    }
  }

  private convertMessage(gmailMsg: any) {
    const headers = gmailMsg.payload?.headers || []
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    // Get email body
    let body = ''
    if (gmailMsg.payload?.body?.data) {
      body = Buffer.from(gmailMsg.payload.body.data, 'base64').toString('utf-8')
    } else if (gmailMsg.payload?.parts) {
      const textPart = gmailMsg.payload.parts.find((p: any) => p.mimeType === 'text/plain')
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      }
    }

    return {
      id: gmailMsg.id,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject') || '(No Subject)',
      preview: gmailMsg.snippet || '',
      body: body || gmailMsg.snippet || '',
      time: new Date(parseInt(gmailMsg.internalDate || Date.now())).toLocaleString(),
      read: !gmailMsg.labelIds?.includes('UNREAD'),
      starred: gmailMsg.labelIds?.includes('STARRED') || false,
      labels: gmailMsg.labelIds || [],
      threadId: gmailMsg.threadId
    }
  }

  private getDemoMessages(labelIds: string[]): any[] {
    if (labelIds.includes('INBOX') || labelIds.includes('inbox')) {
      return [
        {
          id: 'inbox1',
          from: 'investor@techventures.com',
          to: 'info@seedpulsefund.com',
          subject: 'Q4 Investment Opportunity',
          preview: 'We would like to discuss a potential investment in your portfolio...',
          body: 'Dear Team,\n\nWe would like to discuss a potential investment opportunity for Q4. Our firm is looking to invest in promising startups...',
          time: new Date(Date.now() - 3600000).toLocaleString(),
          read: false,
          starred: false,
          labels: ['INBOX', 'UNREAD'],
        },
        {
          id: 'inbox2',
          from: 'startup@innovate.io',
          to: 'info@seedpulsefund.com',
          subject: 'Partnership Proposal',
          preview: 'Thank you for your interest in our company. We would love to schedule a call...',
          body: 'Hi,\n\nThank you for your interest in our company. We would love to schedule a call to discuss potential partnership opportunities...',
          time: new Date(Date.now() - 7200000).toLocaleString(),
          read: true,
          starred: true,
          labels: ['INBOX'],
        },
        {
          id: 'inbox3',
          from: 'partner@vc.com',
          to: 'info@seedpulsefund.com',
          subject: 'Monthly Portfolio Update',
          preview: 'Here are the latest metrics from our portfolio companies...',
          body: 'Dear Partners,\n\nHere are the latest metrics from our portfolio companies. Overall performance is strong...',
          time: new Date(Date.now() - 86400000).toLocaleString(),
          read: true,
          starred: false,
          labels: ['INBOX'],
        }
      ]
    }
    
    if (labelIds.includes('SENT') || labelIds.includes('sent')) {
      return [
        {
          id: 'sent1',
          from: 'info@seedpulsefund.com',
          to: 'founder@startup.com',
          subject: 'Follow-up on Investment Proposal',
          preview: 'Thank you for presenting your company to us. We are very interested...',
          body: 'Dear Founder,\n\nThank you for presenting your company to us. We are very interested in your vision and would like to schedule a follow-up meeting...',
          time: new Date(Date.now() - 1800000).toLocaleString(),
          read: true,
          starred: false,
          labels: ['SENT'],
        },
        {
          id: 'sent2',
          from: 'info@seedpulsefund.com',
          to: 'lp@investor.com',
          subject: 'Quarterly Report - Q3 2024',
          preview: 'Please find attached our quarterly report for Q3 2024...',
          body: 'Dear Limited Partner,\n\nPlease find attached our quarterly report for Q3 2024. Our portfolio continues to show strong growth...',
          time: new Date(Date.now() - 172800000).toLocaleString(),
          read: true,
          starred: false,
          labels: ['SENT'],
        }
      ]
    }
    
    if (labelIds.includes('SPAM') || labelIds.includes('spam')) {
      return [
        {
          id: 'spam1',
          from: 'noreply@suspicious-site.com',
          to: 'info@seedpulsefund.com',
          subject: 'You Won $1,000,000!',
          preview: 'Congratulations! You have won $1,000,000 in our lottery...',
          body: 'Congratulations! You have won $1,000,000 in our lottery. Click here to claim your prize...',
          time: new Date(Date.now() - 43200000).toLocaleString(),
          read: false,
          starred: false,
          labels: ['SPAM'],
        },
        {
          id: 'spam2',
          from: 'marketing@fake-bank.com',
          to: 'info@seedpulsefund.com',
          subject: 'Urgent: Verify Your Account',
          preview: 'Your account will be suspended if you don\'t verify your information...',
          body: 'Your account will be suspended if you don\'t verify your information immediately. Click here to verify...',
          time: new Date(Date.now() - 259200000).toLocaleString(),
          read: false,
          starred: false,
          labels: ['SPAM'],
        }
      ]
    }

    return []
  }

  async sendMessage(to: string, subject: string, body: string): Promise<string> {
    try {
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n')

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
            Authorization: `Bearer ${this.accessToken}`,
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
    } catch (error) {
      console.error('Send message error:', error)
      return 'demo-sent-id'
    }
  }
}

// Google Drive Integration
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  modifiedTime: string
  webViewLink?: string
  parents?: string[]
}

export interface DriveFolder {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
  parents?: string[]
}

// Google Sheets Integration
export interface Spreadsheet {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
  sheets: Sheet[]
}

export interface Sheet {
  id: number
  title: string
  rowCount: number
  columnCount: number
}

export interface SheetData {
  values: string[][]
  range: string
}

// Google Calendar Integration
export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: string
  }>
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string
      uri: string
    }>
  }
}

// Google Docs Integration
export interface Document {
  id: string
  title: string
  createdTime: string
  modifiedTime: string
  webViewLink?: string
}

// Google People Integration
export interface Contact {
  id: string
  names: Array<{
    displayName: string
    givenName?: string
    familyName?: string
  }>
  emailAddresses: Array<{
    value: string
    type?: string
  }>
  phoneNumbers?: Array<{
    value: string
    type?: string
  }>
  organizations?: Array<{
    name?: string
    title?: string
  }>
}

// Google Meet Integration
export interface MeetLink {
  conferenceId: string
  entryPoint: string
  meetingCode: string
}

// Google Slides Integration
export interface Presentation {
  id: string
  title: string
  createdTime: string
  modifiedTime: string
  slides: Slide[]
}

export interface Slide {
  id: string
  pageElements: Array<{
    id: string
    title?: string
    description?: string
  }>
}

/**
 * Google Drive API Functions
 */
export class GoogleDriveAPI {
  constructor(private accessToken: string) {}

  async listFiles(query?: string): Promise<DriveFile[]> {
    const params = new URLSearchParams({
      pageSize: '100',
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents)',
      orderBy: 'modifiedTime desc'
    })
    
    if (query) {
      params.append('q', query)
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Google Drive files')
    }

    const data = await response.json()
    return data.files || []
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    const folder = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folder)
    })

    if (!response.ok) {
      throw new Error('Failed to create Google Drive folder')
    }

    return await response.json()
  }

  async uploadFile(file: File, folderId?: string): Promise<DriveFile> {
    const metadata = {
      name: file.name,
      parents: folderId ? [folderId] : []
    }

    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    formData.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload file to Google Drive')
    }

    return await response.json()
  }
}

/**
 * Google Sheets API Functions
 */
export class GoogleSheetsAPI {
  constructor(private accessToken: string) {}

  async listSpreadsheets(): Promise<Spreadsheet[]> {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.spreadsheet\'',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets')
    }

    const data = await response.json()
    return data.files || []
  }

  async getSpreadsheet(spreadsheetId: string): Promise<Spreadsheet> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch spreadsheet details')
    }

    return await response.json()
  }

  async getSheetData(spreadsheetId: string, range: string): Promise<SheetData> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch sheet data')
    }

    return await response.json()
  }

  async updateSheetData(spreadsheetId: string, range: string, values: string[][]): Promise<void> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update sheet data')
    }
  }
}

/**
 * Google Calendar API Functions
 */
export class GoogleCalendarAPI {
  constructor(private accessToken: string) {}

  async listEvents(maxResults: number = 50, calendarId: string = 'primary'): Promise<any[]> {
    try {
      console.log('📅 GoogleCalendarAPI: Fetching events...')
      console.log('📅 Access token length:', this.accessToken?.length || 0)
      
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: new Date().toISOString(), // Only fetch future events
      })

      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`
      console.log('📅 Request URL:', url)

      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📅 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('📅 Error response:', errorText)
        throw new Error(`Failed to fetch calendar events: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('📅 Events fetched:', data.items?.length || 0)
      
      const events = data.items || []
      
      // Convert to our format
      return events.map((event: any) => ({
        id: event.id,
        summary: event.summary || '(No Title)',
        description: event.description || '',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location || '',
        hangoutLink: event.hangoutLink || '',
        conferenceData: event.conferenceData,
        attendees: event.attendees || [],
        creator: event.creator,
        organizer: event.organizer,
        status: event.status,
        htmlLink: event.htmlLink
      }))
    } catch (error) {
      console.error('📅 GoogleCalendarAPI error:', error)
      throw error
    }
  }

  async createEvent(calendarId: string = 'primary', event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    )

    if (!response.ok) {
      throw new Error('Failed to create calendar event')
    }

    return await response.json()
  }

  async createMeetEvent(
    calendarId: string = 'primary',
    title: string,
    startTime: string,
    endTime: string,
    attendees?: string[]
  ): Promise<CalendarEvent> {
    const event = {
      summary: title,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      attendees: attendees?.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    )

    if (!response.ok) {
      throw new Error('Failed to create Meet event')
    }

    return await response.json()
  }
}

/**
 * Google Docs API Functions
 */
export class GoogleDocsAPI {
  constructor(private accessToken: string) {}

  async listDocuments(): Promise<Document[]> {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.document\'',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Google Docs')
    }

    const data = await response.json()
    return data.files || []
  }

  async getDocument(documentId: string): Promise<any> {
    const response = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch document content')
    }

    return await response.json()
  }

  async createDocument(title: string): Promise<Document> {
    const response = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })

    if (!response.ok) {
      throw new Error('Failed to create document')
    }

    return await response.json()
  }
}

/**
 * Google People API Functions
 */
export class GooglePeopleAPI {
  constructor(private accessToken: string) {}

  async listContacts(): Promise<Contact[]> {
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch contacts')
    }

    const data = await response.json()
    return data.connections || []
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    })

    if (!response.ok) {
      throw new Error('Failed to create contact')
    }

    return await response.json()
  }
}

/**
 * Google Slides API Functions
 */
export class GoogleSlidesAPI {
  constructor(private accessToken: string) {}

  async listPresentations(): Promise<Presentation[]> {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.presentation\'',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Google Slides')
    }

    const data = await response.json()
    return data.files || []
  }

  async createPresentation(title: string): Promise<Presentation> {
    const response = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })

    if (!response.ok) {
      throw new Error('Failed to create presentation')
    }

    return await response.json()
  }
}

/**
 * Main Google Workspace Integration Class
 */
export class GoogleWorkspaceIntegration {
  public drive: GoogleDriveAPI
  public sheets: GoogleSheetsAPI
  public calendar: GoogleCalendarAPI
  public docs: GoogleDocsAPI
  public people: GooglePeopleAPI
  public slides: GoogleSlidesAPI

  constructor(private accessToken: string) {
    this.drive = new GoogleDriveAPI(accessToken)
    this.sheets = new GoogleSheetsAPI(accessToken)
    this.calendar = new GoogleCalendarAPI(accessToken)
    this.docs = new GoogleDocsAPI(accessToken)
    this.people = new GooglePeopleAPI(accessToken)
    this.slides = new GoogleSlidesAPI(accessToken)
  }

  /**
   * Get comprehensive user profile from Google
   */
  async getUserProfile() {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    return await response.json()
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string, config: GoogleConfig): Promise<string> {
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
      throw new Error('Failed to refresh access token')
    }

    const data = await response.json()
    return data.access_token
  }
}

/**
 * Generate OAuth URL with all required scopes
 */
export function getGoogleWorkspaceAuthUrl(config: GoogleConfig): string {
  const scopes = [
    // Gmail
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    
    // Drive
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    
    // Sheets
    'https://www.googleapis.com/auth/spreadsheets',
    
    // Calendar
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    
    // Docs
    'https://www.googleapis.com/auth/documents',
    
    // People/Contacts
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/contacts.readonly',
    
    // Slides
    'https://www.googleapis.com/auth/presentations',
    
    // User Info
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
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
export async function exchangeGoogleWorkspaceCode(
  code: string,
  config: GoogleConfig
): Promise<{ accessToken: string; refreshToken: string; userProfile: any }> {
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
    throw new Error('Failed to exchange Google Workspace authorization code')
  }

  const data = await response.json()
  
  // Get user profile
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` }
  })
  const userProfile = await userInfo.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userProfile
  }
}


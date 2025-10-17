/**
 * AI Context Builder
 * Gathers all available data from various sources to provide comprehensive context to the AI
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  GmailAPI,
  GoogleCalendarAPI,
  GoogleDriveAPI,
  GoogleDocsAPI,
  GooglePeopleAPI,
  GoogleSheetsAPI
} from '@/lib/integrations/google-workspace'

export interface AIContext {
  user: {
    name: string
    email: string
    role: string
  }
  googleData?: {
    calendar: any[]
    emails: any[]
    drive: any[]
    docs: any[]
  }
  crmData: {
    deals: any[]
    contacts: any[]
    companies: any[]
    tasks: any[]
    ideas: any[]
  }
  recentActivity: {
    files: any[]
    messages: any[]
    reminders: any[]
    notifications: any[]
  }
  timestamp: string
}

/**
 * Fetch Google Workspace data if user is connected
 */
async function fetchGoogleData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      }
    })

    if (!user?.googleAccessToken) {
      console.log('AI Context: No Google token found')
      return null
    }

    console.log('AI Context: Fetching Google Workspace data...')

    const googleData = {
      calendar: [] as any[],
      emails: [] as any[],
      drive: [] as any[],
      docs: [] as any[]
    }

    // Fetch calendar events using GoogleCalendarAPI
    try {
      const calendarApi = new GoogleCalendarAPI(user.googleAccessToken)
      const calendarEvents = await calendarApi.listEvents(20) // Fetch 20 upcoming events
      googleData.calendar = calendarEvents
      console.log(`AI Context: Fetched ${calendarEvents.length} calendar events`)
    } catch (error) {
      console.error('AI Context: Error fetching calendar events:', error)
    }

    // Fetch Gmail emails using GmailAPI
    try {
      const gmailApi = new GmailAPI(user.googleAccessToken)
      const gmailResult = await gmailApi.listMessages(10, ['INBOX']) // Fetch 10 recent inbox emails
      googleData.emails = gmailResult.emails || []
      console.log(`AI Context: Fetched ${googleData.emails.length} Gmail messages`)
    } catch (error) {
      console.error('AI Context: Error fetching Gmail messages:', error)
    }

    // Fetch Drive files using GoogleDriveAPI
    try {
      const driveApi = new GoogleDriveAPI(user.googleAccessToken)
      const driveFiles = await driveApi.listFiles(10) // Fetch 10 recent files
      googleData.drive = driveFiles
      console.log(`AI Context: Fetched ${driveFiles.length} Drive files`)
    } catch (error) {
      console.error('AI Context: Error fetching Drive files:', error)
    }

    console.log('AI Context: Google Workspace data fetch complete')
    return googleData
  } catch (error) {
    console.error('AI Context: Error fetching Google data:', error)
    return null
  }
}

/**
 * Fetch CRM data (deals, contacts, companies, tasks, ideas)
 */
async function fetchCRMData(userId: string) {
  try {
    // Fetch deals
    const deals = await prisma.deal.findMany({
      take: 50,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: true,
        contact: true,
        tasks: true,
      }
    })

    // Fetch contacts
    const contacts = await prisma.contact.findMany({
      take: 100,
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch companies
    const companies = await prisma.company.findMany({
      take: 100,
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { assignedTo: userId }
        ]
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        deal: true,
      }
    })

    // Fetch ideas
    const ideas = await prisma.idea.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        comments: true,
        votes: true,
      }
    })

    return {
      deals,
      contacts,
      companies,
      tasks,
      ideas,
    }
  } catch (error) {
    console.error('Error fetching CRM data:', error)
    return {
      deals: [],
      contacts: [],
      companies: [],
      tasks: [],
      ideas: [],
    }
  }
}

/**
 * Fetch recent activity (files, messages, reminders, notifications)
 */
async function fetchRecentActivity(userId: string) {
  try {
    // Fetch recent files
    const files = await prisma.file.findMany({
      where: { userId: userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    // Fetch recent messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { channel: { members: { some: { id: userId } } } }
        ]
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        channel: true,
      }
    })

    // Fetch reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      take: 20,
      orderBy: { dueDate: 'asc' },
    })

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    return {
      files,
      messages,
      reminders,
      notifications,
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return {
      files: [],
      messages: [],
      reminders: [],
      notifications: [],
    }
  }
}

/**
 * Build comprehensive AI context with all available data
 */
export async function buildAIContext(): Promise<AIContext | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return null
    }

    // Fetch all data sources in parallel
    const [googleData, crmData, recentActivity] = await Promise.all([
      fetchGoogleData(user.id),
      fetchCRMData(user.id),
      fetchRecentActivity(user.id),
    ])

    const context: AIContext = {
      user: {
        name: user.name || 'User',
        email: user.email,
        role: user.role || 'Member',
      },
      googleData: googleData || undefined,
      crmData,
      recentActivity,
      timestamp: new Date().toISOString(),
    }

    return context
  } catch (error) {
    console.error('Error building AI context:', error)
    return null
  }
}

/**
 * Format AI context into a readable string for the AI
 */
export function formatAIContext(context: AIContext): string {
  let prompt = `# User Context\n`
  prompt += `Name: ${context.user.name}\n`
  prompt += `Email: ${context.user.email}\n`
  prompt += `Role: ${context.user.role}\n`
  prompt += `Current Time: ${new Date(context.timestamp).toLocaleString()}\n\n`

  // Google Data
  if (context.googleData) {
    prompt += `# Google Workspace Data\n\n`
    
    if (context.googleData.calendar.length > 0) {
      prompt += `## Calendar Events (Recent):\n`
      context.googleData.calendar.slice(0, 10).forEach(event => {
        prompt += `- ${event.summary || 'Untitled'} at ${event.start?.dateTime || event.start?.date || 'No time'}\n`
      })
      prompt += `\n`
    }

    if (context.googleData.emails.length > 0) {
      prompt += `## Recent Emails:\n`
      context.googleData.emails.slice(0, 10).forEach(email => {
        prompt += `- From: ${email.from || 'Unknown'} | Subject: ${email.subject || 'No subject'}\n`
      })
      prompt += `\n`
    }

    if (context.googleData.drive.length > 0) {
      prompt += `## Google Drive Files:\n`
      context.googleData.drive.slice(0, 10).forEach(file => {
        prompt += `- ${file.name || 'Untitled'} (${file.mimeType || 'Unknown type'})\n`
      })
      prompt += `\n`
    }
  }

  // CRM Data
  prompt += `# CRM Data\n\n`

  if (context.crmData.deals.length > 0) {
    prompt += `## Active Deals (${context.crmData.deals.length} total):\n`
    context.crmData.deals.slice(0, 10).forEach((deal: any) => {
      prompt += `- ${deal.company || 'Unknown Company'}: ${deal.stage || 'Unknown Stage'} - $${deal.amount?.toLocaleString() || '0'}\n`
    })
    prompt += `\n`
  }

  if (context.crmData.contacts.length > 0) {
    prompt += `## Contacts (${context.crmData.contacts.length} total):\n`
    context.crmData.contacts.slice(0, 10).forEach((contact: any) => {
      prompt += `- ${contact.name || 'Unknown'} at ${contact.company || 'No company'}\n`
    })
    prompt += `\n`
  }

  if (context.crmData.companies.length > 0) {
    prompt += `## Companies (${context.crmData.companies.length} total):\n`
    context.crmData.companies.slice(0, 10).forEach((company: any) => {
      prompt += `- ${company.name || 'Unknown'} - ${company.industry || 'Unknown industry'}\n`
    })
    prompt += `\n`
  }

  if (context.crmData.tasks.length > 0) {
    prompt += `## Tasks (${context.crmData.tasks.length} total):\n`
    context.crmData.tasks.slice(0, 10).forEach((task: any) => {
      prompt += `- [${task.status || 'PENDING'}] ${task.title || 'Untitled'} ${task.dueDate ? `(Due: ${new Date(task.dueDate).toLocaleDateString()})` : ''}\n`
    })
    prompt += `\n`
  }

  if (context.crmData.ideas.length > 0) {
    prompt += `## Recent Ideas (${context.crmData.ideas.length} total):\n`
    context.crmData.ideas.slice(0, 10).forEach((idea: any) => {
      prompt += `- ${idea.title || 'Untitled'} [${idea.status || 'NEW'}] - ${idea.votes?.length || 0} votes\n`
    })
    prompt += `\n`
  }

  // Recent Activity
  prompt += `# Recent Activity\n\n`

  if (context.recentActivity.files.length > 0) {
    prompt += `## Recent Files Uploaded:\n`
    context.recentActivity.files.slice(0, 5).forEach((file: any) => {
      prompt += `- ${file.name || 'Untitled'} (${file.type || 'Unknown type'}) - ${new Date(file.uploadedAt).toLocaleDateString()}\n`
    })
    prompt += `\n`
  }

  if (context.recentActivity.reminders.length > 0) {
    prompt += `## Upcoming Reminders:\n`
    context.recentActivity.reminders.slice(0, 5).forEach((reminder: any) => {
      prompt += `- ${reminder.title || 'Untitled'} - ${new Date(reminder.dueDate).toLocaleString()}\n`
    })
    prompt += `\n`
  }

  return prompt
}

/**
 * Get AI context as a formatted string ready for inclusion in AI prompts
 */
export async function getAIContextString(): Promise<string> {
  const context = await buildAIContext()
  
  if (!context) {
    return 'No user context available.'
  }

  return formatAIContext(context)
}


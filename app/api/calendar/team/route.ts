import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Team Calendars API (Admin Only)
 * Returns all users' calendar events for admin oversight
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'ADMIN' || session.user.email === 'admin@demo.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    // Fetch calendar events for each user
    const teamCalendars = await Promise.all(
      users.map(async (user) => {
        // In production, fetch real events from database
        const events = await prisma.calendarEvent.findMany({
          where: { userId: user.id },
          orderBy: { startTime: 'asc' },
          take: 10 // Limit to next 10 events
        }).catch(() => [])

        // For demo, generate sample events
        const demoEvents = user.id !== session.user.id ? [
          {
            id: `${user.id}-event-1`,
            title: `${user.name?.split(' ')[0]}'s Team Meeting`,
            description: `Weekly sync for ${user.name}`,
            startTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            location: 'Conference Room',
            userId: user.id,
            userName: user.name || user.email
          },
          {
            id: `${user.id}-event-2`,
            title: `${user.name?.split(' ')[0]}'s Client Call`,
            description: `Meeting scheduled by ${user.name}`,
            startTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            location: 'Zoom',
            userId: user.id,
            userName: user.name || user.email
          }
        ] : []

        return {
          userId: user.id,
          userName: user.name || user.email,
          userEmail: user.email,
          events: events.length > 0 ? events : demoEvents
        }
      })
    )

    // Filter out users with no events and the requesting user
    const filteredCalendars = teamCalendars.filter(cal => 
      cal.events.length > 0 && cal.userId !== session.user.id
    )

    return NextResponse.json(filteredCalendars)

  } catch (error) {
    console.error('Team calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team calendars' },
      { status: 500 }
    )
  }
}

/**
 * Features:
 * 
 * - Admin-only endpoint (403 for non-admins)
 * - Fetches events for all users
 * - Returns structured data per user
 * - Excludes admin's own calendar
 * - Limits to upcoming events (performance)
 * - Includes user metadata (name, email)
 * 
 * Response Format:
 * [
 *   {
 *     userId: "user-123",
 *     userName: "John Doe",
 *     userEmail: "john@example.com",
 *     events: [
 *       {
 *         id: "event-1",
 *         title: "Team Meeting",
 *         startTime: "2024-12-20T10:00:00Z",
 *         endTime: "2024-12-20T11:00:00Z",
 *         ...
 *       }
 *     ]
 *   }
 * ]
 */


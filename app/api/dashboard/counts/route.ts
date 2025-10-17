import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all counts in parallel
    const [
      notificationsCount,
      unreadNotificationsCount,
      remindersCount,
      upcomingRemindersCount,
      eventsCount,
      todayEventsCount,
      messagesCount,
      unreadMessagesCount,
      emailsCount,
      unreadEmailsCount,
      tasksCount,
      pendingTasksCount,
      watchingCount,
    ] = await Promise.all([
      // Total notifications
      prisma.notification.count({
        where: { userId }
      }),
      // Unread notifications
      prisma.notification.count({
        where: { userId, read: false }
      }),
      // Total reminders
      prisma.reminder.count({
        where: { userId }
      }),
      // Upcoming reminders (not completed, in the future)
      prisma.reminder.count({
        where: {
          userId,
          completed: false,
          reminderDate: {
            gte: new Date()
          }
        }
      }),
      // Total calendar events
      prisma.calendarEvent.count({
        where: { userId }
      }),
      // Today's events
      prisma.calendarEvent.count({
        where: {
          userId,
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      // Total messages sent by user
      prisma.message.count({
        where: { senderId: userId }
      }),
      // Unread messages in user's direct chats
      prisma.message.count({
        where: {
          isRead: false,
          directChat: {
            OR: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          },
          senderId: { not: userId } // Not sent by the user
        }
      }),
      // Total tasks
      prisma.task.count({
        where: { userId }
      }),
      // Pending tasks (not completed, not cancelled)
      prisma.task.count({
        where: {
          userId,
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      }),
      // Watching items count (deals being watched)
      prisma.deal.count({
        where: {
          userId,
          // You can add a "watching" field or filter by specific stages
        }
      }),
    ])

    // Check if Gmail is connected to determine email count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gmailAccessToken: true,
        gmailRefreshToken: true
      }
    })

    const gmailConnected = !!(user?.gmailAccessToken || user?.gmailRefreshToken)

    return NextResponse.json({
      notifications: {
        total: notificationsCount,
        unread: unreadNotificationsCount
      },
      reminders: {
        total: remindersCount,
        upcoming: upcomingRemindersCount
      },
      calendar: {
        total: eventsCount,
        today: todayEventsCount
      },
      messages: {
        total: messagesCount,
        unread: unreadMessagesCount
      },
      emails: {
        total: emailsCount,
        unread: unreadEmailsCount,
        gmailConnected
      },
      tasks: {
        total: tasksCount,
        pending: pendingTasksCount
      },
      watching: {
        total: watchingCount
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch counts', details: (error as Error).message },
      { status: 500 }
    )
  }
}


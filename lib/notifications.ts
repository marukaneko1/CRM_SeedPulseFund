import { prisma } from './prisma'

export type NotificationType = 'EMAIL' | 'MEETING' | 'DEAL' | 'MESSAGE' | 'TASK' | 'REMINDER'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  linkUrl?: string
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority || 'MEDIUM',
        linkUrl: params.linkUrl,
      }
    })
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Create notification when a new deal is created
 */
export async function notifyNewDeal(dealId: string, dealTitle: string, userId: string) {
  return createNotification({
    userId,
    type: 'DEAL',
    title: 'New Deal Created',
    message: `Deal "${dealTitle}" has been created`,
    priority: 'MEDIUM',
    linkUrl: `/dashboard/deals/${dealId}`
  })
}

/**
 * Create notification when a deal stage changes
 */
export async function notifyDealStageChange(dealId: string, dealTitle: string, newStage: string, userId: string) {
  return createNotification({
    userId,
    type: 'DEAL',
    title: 'Deal Stage Updated',
    message: `Deal "${dealTitle}" moved to ${newStage}`,
    priority: 'HIGH',
    linkUrl: `/dashboard/deals/${dealId}`
  })
}

/**
 * Create notification when a task is assigned
 */
export async function notifyTaskAssigned(taskId: string, taskTitle: string, userId: string) {
  return createNotification({
    userId,
    type: 'TASK',
    title: 'New Task Assigned',
    message: `You have been assigned: "${taskTitle}"`,
    priority: 'HIGH',
    linkUrl: `/dashboard/tasks`
  })
}

/**
 * Create notification when a task is due soon
 */
export async function notifyTaskDueSoon(taskId: string, taskTitle: string, userId: string, dueDate: Date) {
  const dueInHours = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60))
  
  return createNotification({
    userId,
    type: 'TASK',
    title: 'Task Due Soon',
    message: `Task "${taskTitle}" is due in ${dueInHours} hours`,
    priority: 'URGENT',
    linkUrl: `/dashboard/tasks`
  })
}

/**
 * Create notification when a new message is received
 */
export async function notifyNewMessage(messageId: string, senderName: string, userId: string, channelName?: string) {
  return createNotification({
    userId,
    type: 'MESSAGE',
    title: 'New Message',
    message: channelName 
      ? `${senderName} sent a message in #${channelName}` 
      : `New message from ${senderName}`,
    priority: 'MEDIUM',
    linkUrl: `/dashboard/messaging`
  })
}

/**
 * Create notification for upcoming meeting
 */
export async function notifyUpcomingMeeting(eventId: string, eventTitle: string, userId: string, startTime: Date) {
  const minutesUntil = Math.floor((startTime.getTime() - Date.now()) / (1000 * 60))
  
  return createNotification({
    userId,
    type: 'MEETING',
    title: 'Upcoming Meeting',
    message: `"${eventTitle}" starts in ${minutesUntil} minutes`,
    priority: 'URGENT',
    linkUrl: `/dashboard/calendar`
  })
}

/**
 * Create notification when a new email arrives
 */
export async function notifyNewEmail(emailId: string, subject: string, from: string, userId: string) {
  return createNotification({
    userId,
    type: 'EMAIL',
    title: 'New Email',
    message: `From ${from}: "${subject}"`,
    priority: 'MEDIUM',
    linkUrl: `/dashboard/email`
  })
}

/**
 * Create notification for a reminder
 */
export async function notifyReminder(reminderId: string, reminderTitle: string, userId: string) {
  return createNotification({
    userId,
    type: 'REMINDER',
    title: 'Reminder',
    message: reminderTitle,
    priority: 'HIGH',
    linkUrl: `/dashboard/reminders`
  })
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return null
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return null
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  try {
    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        read: true
      }
    })
  } catch (error) {
    console.error('Error cleaning up old notifications:', error)
    return null
  }
}


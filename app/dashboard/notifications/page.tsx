"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Trash2, Mail, Calendar, Users, Briefcase, MessageSquare } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  read: boolean
  linkUrl?: string
  createdAt: string
  readAt?: string
}

const typeIcons: Record<string, any> = {
  EMAIL: Mail,
  MEETING: Calendar,
  DEAL: Briefcase,
  MESSAGE: MessageSquare,
  TASK: CheckCheck,
  REMINDER: Bell
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotificationList(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notificationList.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, read: true })
      })

      if (response.ok) {
        setNotificationList(prev =>
          prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notificationList.filter(n => !n.read).map(n => n.id)
    
    for (const id of unreadIds) {
      await markAsRead(id)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotificationList(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const filteredNotifications = filter === "unread" 
    ? notificationList.filter(n => !n.read)
    : notificationList

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT": return "bg-red-100 text-red-800 border-red-300"
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-300"
      case "MEDIUM": return "bg-blue-100 text-blue-800 border-blue-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={markAllAsRead} variant="outline" disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All ({notificationList.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-4 transition-all hover:shadow-md ${
                    notification.read ? 'border-gray-200' : 'border-blue-400 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                      <Icon className={`w-6 h-6 ${notification.read ? 'text-gray-600' : 'text-blue-600'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">{getTimeAgo(notification.createdAt)}</p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}


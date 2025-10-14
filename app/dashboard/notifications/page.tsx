"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Trash2, Mail, Calendar, Users, Briefcase } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "email",
    icon: Mail,
    title: "New email from John Smith",
    message: "Regarding the Series A funding discussion",
    time: "5 minutes ago",
    read: false,
    priority: "high"
  },
  {
    id: 2,
    type: "meeting",
    icon: Calendar,
    title: "Meeting reminder",
    message: "Pitch meeting with Acme Corp in 30 minutes",
    time: "25 minutes ago",
    read: false,
    priority: "urgent"
  },
  {
    id: 3,
    type: "deal",
    icon: Briefcase,
    title: "Deal stage updated",
    message: "TechStart moved to 'Negotiation' stage",
    time: "1 hour ago",
    read: false,
    priority: "medium"
  },
  {
    id: 4,
    type: "contact",
    icon: Users,
    title: "New contact added",
    message: "Sarah Johnson from Venture Partners",
    time: "2 hours ago",
    read: true,
    priority: "low"
  },
  {
    id: 5,
    type: "email",
    icon: Mail,
    title: "Follow-up required",
    message: "No response from MetaProp in 7 days",
    time: "3 hours ago",
    read: true,
    priority: "medium"
  },
]

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notificationList.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotificationList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(n => n.id !== id))
  }

  const filteredNotifications = filter === "unread" 
    ? notificationList.filter(n => !n.read)
    : notificationList

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-300"
      case "high": return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium": return "bg-blue-100 text-blue-800 border-blue-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
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
              const Icon = notification.icon
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
                          <p className="text-xs text-gray-400">{notification.time}</p>
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


"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Plus, MapPin, Link as LinkIcon } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch calendar events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/calendar')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchEvents()
    }
  }, [session])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and meetings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>January 2024</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-1 h-full bg-blue-500 rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      {event.meetingLink && (
                        <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                          <LinkIcon className="w-4 h-4" />
                          <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                <p className="text-gray-600">Your calendar is empty</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Google Calendar</h4>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Connected
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Syncing events from your Google Calendar
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Calendly</h4>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Connected
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Automatically sync Calendly bookings
              </p>
            </div>

            <Button variant="outline" className="w-full">
              Manage Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



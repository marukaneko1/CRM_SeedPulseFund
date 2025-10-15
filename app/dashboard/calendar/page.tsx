"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Plus, MapPin, Link as LinkIcon, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { CalendarEventForm } from "@/components/forms/calendar-event-form"

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
  const [selectedDate, setSelectedDate] = useState("")
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  
  // Calendar navigation
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  
  // Integration states
  const [googleConnected, setGoogleConnected] = useState(false)
  const [calendlyConnected, setCalendlyConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Set date on client side only to avoid hydration mismatch
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    generateCalendarDays(new Date())
  }, [])
  
  // Generate calendar days for the mini calendar
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: Date[] = []
    
    // Add empty days for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1))
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add days to fill the grid (6 weeks)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    setCalendarDays(days)
  }
  
  const previousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    generateCalendarDays(newMonth)
  }
  
  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    generateCalendarDays(newMonth)
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isSelectedDate = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate
  }
  
  const hasEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.some(e => e.startTime.split('T')[0] === dateStr)
  }
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

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
  
  // Integration handlers
  const connectGoogleCalendar = async () => {
    setSyncing(true)
    try {
      // In production, this would redirect to Google OAuth
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=YOUR_CLIENT_ID&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&` +
        `access_type=offline`
      
      // For demo, just set as connected
      setTimeout(() => {
        setGoogleConnected(true)
        setSyncing(false)
        alert('Google Calendar connected! Events will sync automatically.')
      }, 1000)
    } catch (error) {
      console.error('Google Calendar connection error:', error)
      setSyncing(false)
    }
  }
  
  const disconnectGoogleCalendar = async () => {
    setGoogleConnected(false)
    alert('Google Calendar disconnected')
  }
  
  const connectCalendly = async () => {
    setSyncing(true)
    try {
      // In production, this would use Calendly OAuth
      const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?` +
        `client_id=YOUR_CALENDLY_CLIENT_ID&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/calendly/callback')}`
      
      // For demo, just set as connected
      setTimeout(() => {
        setCalendlyConnected(true)
        setSyncing(false)
        alert('Calendly connected! Bookings will sync automatically.')
      }, 1000)
    } catch (error) {
      console.error('Calendly connection error:', error)
      setSyncing(false)
    }
  }
  
  const disconnectCalendly = async () => {
    setCalendlyConnected(false)
    alert('Calendly disconnected')
  }
  
  const syncAllCalendars = async () => {
    setSyncing(true)
    try {
      // Simulate sync from Google Calendar and Calendly
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncGoogle: googleConnected,
          syncCalendly: calendlyConnected,
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || events)
        alert(`Synced successfully! ${data.count || 0} events imported.`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Sync failed. Check console for details.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and meetings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncAllCalendars} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Calendars'}
          </Button>
          <Button onClick={() => setShowEventForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR - Mini Calendar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mini Calendar Widget */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <CardTitle className="text-base">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded relative
                      ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-700'}
                      ${isToday(date) ? 'bg-blue-100 font-bold' : ''}
                      ${isSelectedDate(date) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                      ${hasEvents(date) ? 'font-semibold' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasEvents(date) && (
                      <div className="absolute bottom-0.5 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    const today = new Date()
                    setSelectedDate(today.toISOString().split('T')[0])
                    setCurrentMonth(today)
                    generateCalendarDays(today)
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Today
                </button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">{events.filter(e => {
                    const eventDate = new Date(e.startTime)
                    const today = new Date()
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return eventDate >= today && eventDate <= weekFromNow
                  }).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">{events.filter(e => 
                    e.startTime.split('T')[0] === new Date().toISOString().split('T')[0]
                  ).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CONTENT - Events List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDate 
                  ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : 'All Events'}
              </CardTitle>
              <span className="text-sm text-gray-600">
                {events.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).length} events
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : events.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).length > 0 ? (
              <div className="space-y-4">
                {events.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).map((event) => (
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
          
          {/* Integrations Section */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 px-6 pb-6">
            {/* Google Calendar Integration */}
            <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">Google Calendar</h4>
                    {googleConnected && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {googleConnected 
                      ? 'Syncing events from your Google Calendar'
                      : 'Connect to sync events from Google Calendar'}
                  </p>
                  {googleConnected ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={syncAllCalendars} disabled={syncing}>
                        <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline" onClick={disconnectGoogleCalendar}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={connectGoogleCalendar} disabled={syncing}>
                      Connect Google Calendar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendly Integration */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">Calendly</h4>
                    {calendlyConnected && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {calendlyConnected
                      ? 'Automatically importing Calendly bookings'
                      : 'Connect to sync Calendly bookings'}
                  </p>
                  {calendlyConnected ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={syncAllCalendars} disabled={syncing}>
                        <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline" onClick={disconnectCalendly}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={connectCalendly} disabled={syncing}>
                      Connect Calendly
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </Card>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <CalendarEventForm
          event={selectedEvent}
          onClose={() => {
            setShowEventForm(false)
            setSelectedEvent(null)
          }}
          onSuccess={() => {
            // Refresh events list
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}



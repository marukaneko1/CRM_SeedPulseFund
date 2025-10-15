"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Plus, MapPin, Link as LinkIcon, ChevronLeft, ChevronRight, RefreshCw, Maximize2, List, Grid } from "lucide-react"
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
  
  // Admin-only features
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.email === 'admin@demo.com'
  const [showAllUsersCalendars, setShowAllUsersCalendars] = useState(false)
  const [teamEvents, setTeamEvents] = useState<{userId: string, userName: string, events: CalendarEvent[]}[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Calendar view mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [expandedCalendar, setExpandedCalendar] = useState(false)
  const [quickAddTime, setQuickAddTime] = useState<{date: string, hour: number} | null>(null)

  // Set date on client side only to avoid hydration mismatch
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    generateCalendarDays(new Date())
  }, [])
  
  // Auto-refresh events every 30 seconds for admin
  useEffect(() => {
    if (!isAdmin || !autoRefresh) return
    
    const interval = setInterval(() => {
      fetchAllUsersEvents()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [isAdmin, autoRefresh, session])
  
  // Fetch all users' events (admin only)
  const fetchAllUsersEvents = async () => {
    if (!isAdmin) return
    
    try {
      const response = await fetch('/api/calendar/team')
      if (response.ok) {
        const data = await response.json()
        
        // Check for new events and show notification
        if (teamEvents.length > 0) {
          const oldEventIds = new Set(teamEvents.flatMap(u => u.events.map(e => e.id)))
          const newEvents = data.flatMap((u: any) => u.events).filter((e: any) => !oldEventIds.has(e.id))
          
          if (newEvents.length > 0) {
            // Show notification for new events
            showNewEventNotification(newEvents[0])
          }
        }
        
        setTeamEvents(data)
      }
    } catch (error) {
      console.error('Error fetching team events:', error)
    }
  }
  
  // Show browser notification for new calendar event
  const showNewEventNotification = (event: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Calendar Event', {
        body: `${event.userName} added: ${event.title}`,
        icon: '/favicon.ico',
        tag: event.id
      })
    }
    
    // Also show in-app notification
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {}) // Ignore if sound fails
  }
  
  // Request notification permission
  useEffect(() => {
    if (isAdmin && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isAdmin])
  
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
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }
  
  const hasEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    // Check both own events and team events
    const hasOwnEvents = events.some(e => e.startTime.split('T')[0] === dateStr)
    const hasTeamEvents = selectedUsers.length > 0 && teamEvents.some(userCal => 
      selectedUsers.includes(userCal.userId) && 
      userCal.events.some(e => e.startTime.split('T')[0] === dateStr)
    )
    return hasOwnEvents || hasTeamEvents
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
      
      // Also fetch team calendars if admin
      if (isAdmin) {
        fetchAllUsersEvents()
      }
    }
  }, [session, isAdmin])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }
  
  // Get combined events (own + selected team members)
  const getCombinedEvents = () => {
    let combined = [...events]
    
    // Add selected team members' events
    if (isAdmin && selectedUsers.length > 0) {
      teamEvents.forEach(userCal => {
        if (selectedUsers.includes(userCal.userId)) {
          const teamEventsWithUser = userCal.events.map(e => ({
            ...e,
            teamMemberName: userCal.userName,
            isTeamEvent: true
          }))
          combined = [...combined, ...teamEventsWithUser]
        }
      })
    }
    
    // Sort by start time
    combined.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    return combined
  }
  
  const displayEvents = getCombinedEvents()
  
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
  
  // Quick add event inline
  const handleQuickAddEvent = async (date: string, hour: number) => {
    const title = prompt('Event title:')
    if (!title) return
    
    const startTime = new Date(date)
    startTime.setHours(hour, 0, 0, 0)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour later
    
    const newEvent = {
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
    
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })
      
      if (response.ok) {
        // Refresh events
        const allEvents = await fetch('/api/calendar')
        if (allEvents.ok) {
          const data = await allEvents.json()
          setEvents(data)
        }
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }
  
  // Get events for a specific date and hour
  const getEventsForTimeSlot = (date: string, hour: number) => {
    return displayEvents.filter(e => {
      const eventDate = new Date(e.startTime)
      return e.startTime.split('T')[0] === date && eventDate.getHours() === hour
    })
  }

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and meetings</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 mr-2 border rounded-md p-1 bg-gray-50">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setExpandedCalendar(!expandedCalendar)}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            {expandedCalendar ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="outline" onClick={syncAllCalendars} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
          <Button onClick={() => setShowEventForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Expanded Full Calendar View */}
      {viewMode === 'grid' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {/* Time grid header */}
              <div className="grid grid-cols-8 gap-px bg-gray-200 border rounded-lg overflow-hidden">
                {/* Time column */}
                <div className="bg-white font-semibold text-center py-2 text-sm">Time</div>
                {/* Day columns */}
                {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                  const date = new Date(selectedDate || new Date().toISOString().split('T')[0])
                  date.setDate(date.getDate() - date.getDay() + dayOffset) // Start from Sunday
                  return (
                    <div key={dayOffset} className="bg-white text-center py-2">
                      <div className="font-semibold text-sm">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-xs ${isToday(date) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Time slots grid */}
              <div className="mt-px">
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                  <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200">
                    {/* Time label */}
                    <div className="bg-white px-2 py-3 text-xs text-gray-600 font-medium">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    
                    {/* Day cells */}
                    {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                      const date = new Date(selectedDate || new Date().toISOString().split('T')[0])
                      date.setDate(date.getDate() - date.getDay() + dayOffset)
                      const dateStr = date.toISOString().split('T')[0]
                      const eventsInSlot = getEventsForTimeSlot(dateStr, hour)
                      
                      return (
                        <button
                          key={`${dateStr}-${hour}`}
                          onClick={() => handleQuickAddEvent(dateStr, hour)}
                          className="bg-white hover:bg-blue-50 px-2 py-3 text-left min-h-[60px] relative group transition-colors"
                        >
                          {eventsInSlot.length > 0 ? (
                            <div className="space-y-1">
                              {eventsInSlot.map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded ${
                                    (event as any).isTeamEvent 
                                      ? 'bg-purple-100 text-purple-700 border-l-2 border-purple-500' 
                                      : 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
                                  }`}
                                >
                                  <div className="font-semibold truncate">{event.title}</div>
                                  {(event as any).teamMemberName && (
                                    <div className="text-[10px]">{(event as any).teamMemberName}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full">
                              <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-600 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500"></div>
                <span>Your events</span>
              </div>
              {isAdmin && selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-100 border-l-2 border-purple-500"></div>
                  <span>Team events</span>
                </div>
              )}
              <span className="ml-auto">Click any time slot to add event</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`grid lg:grid-cols-4 gap-6 ${expandedCalendar ? 'lg:grid-cols-1' : ''}`}>
        {/* LEFT SIDEBAR - Mini Calendar */}
        {!expandedCalendar && (
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
              <CardTitle className="text-sm">
                {selectedUsers.length > 0 ? 'Combined Stats' : 'My Calendar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-semibold">{displayEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">{displayEvents.filter(e => {
                    const eventDate = new Date(e.startTime)
                    const today = new Date()
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return eventDate >= today && eventDate <= weekFromNow
                  }).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">{displayEvents.filter(e => 
                    e.startTime.split('T')[0] === new Date().toISOString().split('T')[0]
                  ).length}</span>
                </div>
                {isAdmin && selectedUsers.length > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2"></div>
                    <div className="flex justify-between text-purple-600">
                      <span>Team Events</span>
                      <span className="font-semibold">
                        {displayEvents.filter((e: any) => e.isTeamEvent).length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* MAIN CONTENT - Events List */}
        <Card className={expandedCalendar ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDate 
                  ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : 'All Events'}
              </CardTitle>
              <span className="text-sm text-gray-600">
                {displayEvents.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).length} events
                {selectedUsers.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    (including {selectedUsers.length} team member{selectedUsers.length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : displayEvents.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).length > 0 ? (
              <div className="space-y-4">
                {displayEvents.filter(e => !selectedDate || e.startTime.split('T')[0] === selectedDate).map((event: any) => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                      event.isTeamEvent ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-blue-500'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        {event.isTeamEvent && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                            {event.teamMemberName}
                          </span>
                        )}
                      </div>
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

      {/* Admin Only - Team Calendars */}
      {isAdmin && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Calendars</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">View and monitor all team members' calendars</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    Auto-refresh (30s)
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAllUsersEvents}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Now
                  </Button>
                  <Button
                    variant={showAllUsersCalendars ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllUsersCalendars(!showAllUsersCalendars)}
                  >
                    {showAllUsersCalendars ? 'Hide' : 'Show'} Team Calendars
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showAllUsersCalendars && (
              <CardContent>
                {teamEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Click "Refresh Now" to load team calendars</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {teamEvents.map((userCalendar) => (
                      <div key={userCalendar.userId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {userCalendar.userName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{userCalendar.userName}</h3>
                              <p className="text-sm text-gray-600">
                                {userCalendar.events.length} events this month
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(userCalendar.userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, userCalendar.userId])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== userCalendar.userId))
                                }
                              }}
                              className="rounded"
                            />
                            Show in main calendar
                          </label>
                        </div>
                        
                        {/* User's upcoming events */}
                        <div className="space-y-2">
                          {userCalendar.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm"
                            >
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <div className="flex-1">
                                <span className="font-medium">{event.title}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3 h-3" />
                                {formatTime(event.startTime)}
                              </div>
                            </div>
                          ))}
                          {userCalendar.events.length > 3 && (
                            <p className="text-xs text-gray-500 pl-5">
                              +{userCalendar.events.length - 3} more events
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

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



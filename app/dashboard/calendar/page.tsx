"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Plus } from "lucide-react"

const events = [
  {
    id: "1",
    title: "Pitch Meeting - Startup X",
    date: "2024-01-15",
    time: "10:00 AM - 11:00 AM",
    type: "Meeting",
    color: "bg-blue-500"
  },
  {
    id: "2",
    title: "LP Quarterly Update",
    date: "2024-01-15",
    time: "2:00 PM - 3:00 PM",
    type: "Video Call",
    color: "bg-green-500"
  },
  {
    id: "3",
    title: "Portfolio Review",
    date: "2024-01-16",
    time: "9:00 AM - 10:30 AM",
    type: "Meeting",
    color: "bg-purple-500"
  },
  {
    id: "4",
    title: "Due Diligence Call",
    date: "2024-01-17",
    time: "3:00 PM - 4:00 PM",
    type: "Call",
    color: "bg-orange-500"
  },
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15")

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
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`w-1 h-16 ${event.color} rounded`} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
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



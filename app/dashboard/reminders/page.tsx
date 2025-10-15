"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Plus, Check, Trash2, AlertCircle } from "lucide-react"

import { useSession } from "next-auth/react"

// Demo reminders only for admin
const demoReminders = [
  {
    id: 1,
    title: "Follow up with Helix CEO",
    description: "Discuss Series A timeline",
    dueDate: "2025-10-15",
    dueTime: "10:00 AM",
    priority: "high",
    completed: false,
    category: "follow-up"
  },
  {
    id: 2,
    title: "Send investment memo",
    description: "Complete due diligence for OpenAI deal",
    dueDate: "2025-10-16",
    dueTime: "2:00 PM",
    priority: "urgent",
    completed: false,
    category: "task"
  },
]

export default function RemindersPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const [reminders, setReminders] = useState(isAdmin ? demoReminders : [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")

  const toggleComplete = (id: number) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
    )
  }

  const deleteReminder = (id: number) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const filteredReminders = reminders.filter(r => {
    if (filter === "active") return !r.completed
    if (filter === "completed") return r.completed
    return true
  })

  const activeCount = reminders.filter(r => !r.completed).length
  const completedCount = reminders.filter(r => r.completed).length

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              Reminders & Tasks
            </h1>
            <p className="text-gray-600 mt-1">
              {activeCount} active • {completedCount} completed
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">New Reminder</h2>
            <div className="space-y-4">
              <Input placeholder="Title" />
              <Input placeholder="Description" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" />
                <Input type="time" />
              </div>
              <div className="flex gap-2">
                <Button>Save</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All ({reminders.length})
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              onClick={() => setFilter("completed")}
            >
              Completed ({completedCount})
            </Button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                reminder.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(reminder.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    reminder.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {reminder.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(reminder.priority)}`}></div>
                        <h3 className={`font-semibold text-gray-900 ${reminder.completed ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {reminder.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {reminder.dueDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {reminder.dueTime}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


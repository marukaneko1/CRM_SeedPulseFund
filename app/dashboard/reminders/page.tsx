"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, Plus, Check, Trash2, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface Reminder {
  id: string
  title: string
  description?: string
  reminderDate: string
  completed: boolean
  createdAt: string
}

export default function RemindersPage() {
  const { data: session } = useSession()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderDate: '',
  })

  useEffect(() => {
    fetchReminders()
  }, [session])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !reminder.completed })
      })

      if (response.ok) {
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
        )
      }
    } catch (error) {
      console.error('Error toggling reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReminders(prev => prev.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const handleCreateReminder = async () => {
    if (!formData.title.trim() || !formData.reminderDate) {
      alert('Please enter a title and date')
      return
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newReminder = await response.json()
        setReminders(prev => [newReminder, ...prev])
        setFormData({ title: '', description: '', reminderDate: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
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
              <Input 
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input 
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input 
                type="datetime-local"
                value={formData.reminderDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateReminder}>Save</Button>
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
          {filteredReminders.length > 0 ? filteredReminders.map((reminder) => (
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


"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar,
  Flag,
  User,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  dueDate?: string
  assignedTo?: string
  completed: boolean
  category?: string
}

const priorityColors = {
  URGENT: "text-red-600 bg-red-50 border-red-200",
  HIGH: "text-orange-600 bg-orange-50 border-orange-200",
  MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
  LOW: "text-green-600 bg-green-50 border-green-200"
}

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    category: '',
    assignedTo: ''
  })

  // Fetch tasks
  useEffect(() => {
    fetchTasks()
  }, [session])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, completed: !task.completed })
      })

      if (response.ok) {
        setTasks(prev =>
          prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        )
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks(prev => [newTask, ...prev])
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          category: '',
          assignedTo: ''
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const activeCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-gray-600">
            {activeCount} active • {completedCount} completed
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({tasks.length})
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

      {/* Add Task Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                placeholder="Task title" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="w-full p-3 border rounded-md"
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <Input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Input 
                    placeholder="e.g. Due Diligence"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTask}>Create Task</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={cn(
              "hover:shadow-md transition-shadow",
              task.completed && "opacity-60"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={cn(
                        "font-semibold",
                        task.completed && "line-through text-gray-500"
                      )}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap",
                          priorityColors[task.priority as keyof typeof priorityColors]
                        )}>
                          {task.priority}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-6 w-6 p-0 text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "completed" ? "No completed tasks" : "No tasks yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "completed" 
                ? "Completed tasks will appear here"
                : "Create your first task to get started"}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


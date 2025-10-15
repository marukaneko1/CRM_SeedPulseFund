"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Eye, Star, Building, Users, Briefcase, TrendingUp } from "lucide-react"

// Demo watched items only for admin
const demoWatchedItems = [
  {
    id: 1,
    type: "company",
    icon: Building,
    name: "Anthropic",
    description: "AI safety and research company",
    status: "Series C",
    lastActivity: "New funding round announced",
    lastUpdate: "2 hours ago",
    importance: "high"
  },
  {
    id: 2,
    type: "deal",
    icon: Briefcase,
    name: "CloudTech Acquisition",
    description: "Enterprise SaaS platform",
    status: "Negotiation",
    lastActivity: "Term sheet sent",
    lastUpdate: "5 hours ago",
    importance: "urgent"
  },
  {
    id: 3,
    type: "contact",
    icon: Users,
    name: "Emily Chen",
    description: "CTO at DataFlow Inc",
    status: "Active",
    lastActivity: "Expressed interest in Series B",
    lastUpdate: "1 day ago",
    importance: "medium"
  },
  {
    id: 4,
    type: "company",
    icon: Building,
    name: "QuantumLeap",
    description: "Quantum computing startup",
    status: "Seed",
    lastActivity: "Product demo scheduled",
    lastUpdate: "2 days ago",
    importance: "high"
  },
  {
    id: 5,
    type: "deal",
    icon: Briefcase,
    name: "FinTech Partnership",
    description: "Strategic investment opportunity",
    status: "Due Diligence",
    lastActivity: "Documents reviewed",
    lastUpdate: "3 days ago",
    importance: "medium"
  },
]

export default function WatchingPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const [items, setItems] = useState(isAdmin ? demoWatchedItems : [])
  const [filter, setFilter] = useState<string>("all")

  const removeFromWatching = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "urgent": return "text-red-600 bg-red-50"
      case "high": return "text-orange-600 bg-orange-50"
      case "medium": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "company": return "bg-purple-100 text-purple-700"
      case "deal": return "bg-green-100 text-green-700"
      case "contact": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredItems = filter === "all" ? items : items.filter(item => item.type === filter)

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              Watching
            </h1>
            <p className="text-gray-600 mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} you&apos;re tracking
            </p>
          </div>
          <Button>
            <Star className="w-4 h-4 mr-2" />
            Add to Watch List
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All ({items.length})
            </Button>
            <Button
              variant={filter === "company" ? "default" : "outline"}
              onClick={() => setFilter("company")}
            >
              <Building className="w-4 h-4 mr-2" />
              Companies ({items.filter(i => i.type === "company").length})
            </Button>
            <Button
              variant={filter === "deal" ? "default" : "outline"}
              onClick={() => setFilter("deal")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Deals ({items.filter(i => i.type === "deal").length})
            </Button>
            <Button
              variant={filter === "contact" ? "default" : "outline"}
              onClick={() => setFilter("contact")}
            >
              <Users className="w-4 h-4 mr-2" />
              Contacts ({items.filter(i => i.type === "contact").length})
            </Button>
          </div>
        </div>

        {/* Watched Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium text-gray-900">{item.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Activity:</span>
                    <span className="font-medium text-gray-900">{item.lastActivity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Updated:</span>
                    <span className="text-gray-500">{item.lastUpdate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${getImportanceColor(item.importance)}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium capitalize">{item.importance}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatching(item.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


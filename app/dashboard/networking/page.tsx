"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Network, Plus, Search, Users, Mail, TrendingUp } from "lucide-react"

export default function NetworkingPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const groups = [
    { id: '1', name: 'Series A Investors', members: 45, category: 'Investors', activity: 'High' },
    { id: '2', name: 'AI/ML Founders', members: 78, category: 'Founders', activity: 'High' },
    { id: '3', name: 'Legal Advisors', members: 23, category: 'Service Providers', activity: 'Medium' },
    { id: '4', name: 'LP Network', members: 34, category: 'LPs', activity: 'Low' },
  ]

  const introductions = [
    { id: '1', from: 'John Smith', to: 'Sarah Johnson', company: 'TechCo', status: 'Pending', date: '2024-01-15' },
    { id: '2', from: 'Mike Brown', to: 'Lisa Chen', company: 'AI Startup', status: 'Accepted', date: '2024-01-14' },
    { id: '3', from: 'Tom Wilson', to: 'Anna Lee', company: 'GreenTech', status: 'Completed', date: '2024-01-10' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Accepted': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Network className="w-8 h-8 text-blue-600" />
              Networking
            </h1>
            <p className="text-gray-600 mt-1">Manage groups, introductions, and network activity</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />New Group</Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search groups and contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Groups */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Network Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.members} members</p>
                    </div>
                    <Badge className={getActivityColor(group.activity)}>
                      {group.activity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800">{group.category}</Badge>
                    <Button size="sm" variant="outline">
                      View Group
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Introductions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Recent Introductions
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Request Intro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {introductions.map((intro) => (
                <div key={intro.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">
                      {intro.from} → {intro.to}
                    </p>
                    <p className="text-sm text-gray-600">{intro.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(intro.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(intro.status)}>
                    {intro.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed (placeholder) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <p>Activity feed will display network interactions and updates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

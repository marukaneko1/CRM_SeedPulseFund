"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Plus, Search, BarChart3, Send, Eye } from "lucide-react"

export default function SurveysPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const surveys = [
    { 
      id: '1', 
      title: 'Q4 2024 LP Satisfaction Survey', 
      status: 'Active', 
      responses: 24,
      totalRecipients: 35,
      createdAt: '2024-01-10',
      type: 'LP Feedback'
    },
    { 
      id: '2', 
      title: 'Portfolio Company Needs Assessment', 
      status: 'Draft', 
      responses: 0,
      totalRecipients: 50,
      createdAt: '2024-01-15',
      type: 'Portfolio'
    },
    { 
      id: '3', 
      title: 'Fund Strategy Feedback 2025', 
      status: 'Closed', 
      responses: 42,
      totalRecipients: 42,
      createdAt: '2023-12-01',
      type: 'Strategic'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Closed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
              Surveys
            </h1>
            <p className="text-gray-600 mt-1">Create, distribute, and analyze surveys</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />Create Survey</Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveys.length}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Send className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {surveys.filter(s => s.status === 'Active').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {surveys.reduce((sum, s) => sum + s.responses, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all surveys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((surveys.reduce((sum, s) => sum + s.responses, 0) / 
                  surveys.reduce((sum, s) => sum + s.totalRecipients, 0)) * 100)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Surveys List */}
        <div className="space-y-4">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{survey.title}</h3>
                      <Badge className={getStatusColor(survey.status)}>
                        {survey.status}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {survey.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created: {new Date(survey.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        Responses: {survey.responses}/{survey.totalRecipients} 
                        ({Math.round((survey.responses / survey.totalRecipients) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Results
                    </Button>
                    {survey.status === 'Draft' && (
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${(survey.responses / survey.totalRecipients) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

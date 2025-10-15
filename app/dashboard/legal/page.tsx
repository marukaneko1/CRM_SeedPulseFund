"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Scale, Plus, Search, FileText, Download, Copy } from "lucide-react"

export default function LegalPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const templates = [
    { id: '1', name: 'NDA Template', category: 'Confidentiality', lastModified: '2024-01-15' },
    { id: '2', name: 'Term Sheet - Series A', category: 'Investment', lastModified: '2024-01-10' },
    { id: '3', name: 'SAFE Agreement', category: 'Investment', lastModified: '2024-01-05' },
    { id: '4', name: 'Employment Agreement', category: 'HR', lastModified: '2023-12-20' },
  ]

  const clauses = [
    { id: '1', name: 'Anti-Dilution Protection', category: 'Investment Rights', usage: 15 },
    { id: '2', name: 'Board Composition', category: 'Governance', usage: 12 },
    { id: '3', name: 'Drag-Along Rights', category: 'Exit Rights', usage: 10 },
    { id: '4', name: 'Information Rights', category: 'Investor Rights', usage: 18 },
  ]

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-600" />
              Legal
            </h1>
            <p className="text-gray-600 mt-1">Document templates, clauses, and legal workflows</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />New Template</Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates and clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Document Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-800">{template.category}</Badge>
                        <span className="text-xs text-gray-500">
                          Modified {new Date(template.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clause Library */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Clause Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clauses.map((clause) => (
                  <div key={clause.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{clause.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-100 text-purple-800">{clause.category}</Badge>
                        <span className="text-xs text-gray-500">Used {clause.usage} times</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

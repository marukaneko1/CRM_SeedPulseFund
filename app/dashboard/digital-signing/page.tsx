"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileSignature, 
  Plus, 
  Search, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download
} from "lucide-react"

interface Envelope {
  id: string
  title: string
  status: 'DRAFT' | 'SENT' | 'COMPLETED' | 'DECLINED' | 'EXPIRED'
  recipients: {
    name: string
    email: string
    status: 'PENDING' | 'SIGNED' | 'DECLINED'
  }[]
  createdAt: string
  updatedAt: string
  documentName: string
}

export default function DigitalSigningPage() {
  const { data: session } = useSession()
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Mock data - replace with API call
    setEnvelopes([
      {
        id: '1',
        title: 'Series A Term Sheet - NeuralTech AI',
        status: 'SENT',
        recipients: [
          { name: 'John Founder', email: 'john@neuraltech.ai', status: 'PENDING' },
          { name: 'Jane Co-Founder', email: 'jane@neuraltech.ai', status: 'SIGNED' }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        documentName: 'series-a-term-sheet.pdf'
      },
      {
        id: '2',
        title: 'NDA - Due Diligence Access',
        status: 'COMPLETED',
        recipients: [
          { name: 'Sarah Investor', email: 'sarah@vc.com', status: 'SIGNED' }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        documentName: 'nda-agreement.pdf'
      }
    ])
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'DECLINED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'SENT': return <Clock className="w-4 h-4" />
      case 'DECLINED': case 'EXPIRED': return <AlertCircle className="w-4 h-4" />
      default: return <FileSignature className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading envelopes...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileSignature className="w-8 h-8 text-blue-600" />
              Digital Signing
            </h1>
            <p className="text-gray-600 mt-1">
              Send and track documents for electronic signature
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Envelope
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search envelopes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Envelopes List */}
        <div className="space-y-4">
          {envelopes.map((envelope) => (
            <Card key={envelope.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{envelope.title}</h3>
                      <Badge className={getStatusColor(envelope.status)}>
                        {getStatusIcon(envelope.status)}
                        <span className="ml-1">{envelope.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{envelope.documentName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {envelope.status === 'COMPLETED' && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                {/* Recipients */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recipients</h4>
                  <div className="space-y-2">
                    {envelope.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{recipient.name}</span>
                          <span className="text-gray-500 ml-2">{recipient.email}</span>
                        </div>
                        <Badge className={
                          recipient.status === 'SIGNED' 
                            ? 'bg-green-100 text-green-800' 
                            : recipient.status === 'DECLINED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {recipient.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t mt-4 pt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(envelope.createdAt).toLocaleDateString()}</span>
                  <span>Last updated: {new Date(envelope.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {envelopes.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <FileSignature className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No envelopes yet</p>
            <p className="text-sm">Create your first envelope to send documents for signature</p>
          </div>
        )}
      </div>
    </div>
  )
}

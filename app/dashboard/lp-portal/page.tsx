"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye
} from "lucide-react"

interface LPPortfolio {
  totalCommitment: number
  currentValue: number
  totalReturn: number
  irr: number
  moMReturn: number
  investments: {
    id: string
    companyName: string
    investmentAmount: number
    currentValue: number
    returnMultiple: number
    irr: number
    vintage: string
    status: 'ACTIVE' | 'EXITED' | 'WRITTEN_OFF'
  }[]
  capitalCalls: {
    id: string
    amount: number
    dueDate: string
    status: 'PENDING' | 'PAID' | 'OVERDUE'
    description: string
  }[]
  distributions: {
    id: string
    amount: number
    date: string
    source: string
    description: string
  }[]
}

interface LPDocument {
  id: string
  name: string
  type: 'QUARTERLY_REPORT' | 'ANNUAL_REPORT' | 'CAPITAL_CALL' | 'DISTRIBUTION' | 'TAX_DOCUMENT' | 'OTHER'
  category: string
  description?: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  isNew: boolean
}

export default function LPPortalPage() {
  const { data: session } = useSession()
  const [portfolio, setPortfolio] = useState<LPPortfolio | null>(null)
  const [documents, setDocuments] = useState<LPDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLPData()
  }, [session])

  const fetchLPData = async () => {
    try {
      const [portfolioRes, documentsRes] = await Promise.all([
        fetch('/api/lp/portfolio'),
        fetch('/api/lp/documents')
      ])

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json()
        setPortfolio(portfolioData)
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setDocuments(documentsData)
      }
    } catch (error) {
      console.error('Error fetching LP data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeCapitalCall = async (capitalCallId: string) => {
    try {
      const response = await fetch(`/api/lp/capital-calls/${capitalCallId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true })
      })

      if (response.ok) {
        // Update local state
        setPortfolio(prev => prev ? {
          ...prev,
          capitalCalls: prev.capitalCalls.map(cc => 
            cc.id === capitalCallId ? { ...cc, status: 'PAID' as const } : cc
          )
        } : null)
      }
    } catch (error) {
      console.error('Error acknowledging capital call:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'EXITED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'QUARTERLY_REPORT': return 'bg-blue-100 text-blue-800'
      case 'ANNUAL_REPORT': return 'bg-purple-100 text-purple-800'
      case 'CAPITAL_CALL': return 'bg-orange-100 text-orange-800'
      case 'DISTRIBUTION': return 'bg-green-100 text-green-800'
      case 'TAX_DOCUMENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading LP portal...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Limited Partner Portal
          </h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        {portfolio && (
          <>
            {/* Portfolio Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commitment</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(portfolio.totalCommitment)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(portfolio.currentValue)}</div>
                  <p className="text-xs text-green-600">
                    +{formatCurrency(portfolio.currentValue - portfolio.totalCommitment)} profit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.totalReturn}%</div>
                  <p className="text-xs text-green-600">
                    +{portfolio.moMReturn}% MoM
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IRR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.irr}%</div>
                  <p className="text-xs text-gray-500">Annualized</p>
                </CardContent>
              </Card>
            </div>

            {/* Capital Calls */}
            {portfolio.capitalCalls.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Capital Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.capitalCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{formatCurrency(call.amount)}</h3>
                            <Badge className={getStatusBadgeColor(call.status)}>
                              {call.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{call.description}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(call.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        {call.status === 'PENDING' && (
                          <Button 
                            size="sm"
                            onClick={() => handleAcknowledgeCapitalCall(call.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        {call.status === 'PAID' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Paid</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Distributions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Distributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio.distributions.map((distribution) => (
                    <div key={distribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{formatCurrency(distribution.amount)}</h3>
                        <p className="text-sm text-gray-600">{distribution.description}</p>
                        <p className="text-xs text-gray-500">
                          Source: {distribution.source} • {new Date(distribution.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Companies */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Portfolio Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{investment.companyName}</h3>
                          <Badge className={getStatusBadgeColor(investment.status)}>
                            {investment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Investment</p>
                            <p className="font-medium">{formatCurrency(investment.investmentAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current Value</p>
                            <p className="font-medium">{formatCurrency(investment.currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Multiple</p>
                            <p className="font-medium">{investment.returnMultiple}x</p>
                          </div>
                          <div>
                            <p className="text-gray-500">IRR</p>
                            <p className="font-medium">{investment.irr}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{doc.name}</h3>
                      {doc.isNew && (
                        <Badge className="bg-blue-100 text-blue-800">New</Badge>
                      )}
                      <Badge className={getDocumentTypeColor(doc.type)}>
                        {doc.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-1">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

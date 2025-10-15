"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2,
  Download,
  Filter,
  Calendar
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KPIData {
  fundMetrics: {
    totalFundSize: number
    totalInvested: number
    totalCommitted: number
    numberOfDeals: number
    averageDealSize: number
  }
  portfolioMetrics: {
    activeInvestments: number
    exitedInvestments: number
    writtenOffInvestments: number
    totalReturn: number
    irr: number
    tvpi: number
    dpi: number
  }
  performanceMetrics: {
    arr: number
    moMGrowth: number
    retentionRate: number
    churnRate: number
    ltv: number
    cac: number
  }
  timeSeriesData: {
    date: string
    portfolioValue: number
    cashInvested: number
    distributions: number
    nav: number
  }[]
}

export default function ReportingPage() {
  const { data: session } = useSession()
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("12m")
  const [reportType, setReportType] = useState("portfolio")

  useEffect(() => {
    fetchKPIData()
  }, [session, dateRange])

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/reporting/kpis')
      if (response.ok) {
        const data = await response.json()
        setKpiData(data)
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error)
    } finally {
      setLoading(false)
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/reporting/export?format=${format}&type=${reportType}&range=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${reportType}-${dateRange}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading reports...</p>
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
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Reporting & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Date Range:</span>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Report Type:</span>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {kpiData && (
          <>
            {/* Fund Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fund Size</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpiData.fundMetrics.totalFundSize)}</div>
                  <p className="text-xs text-gray-500">Total committed capital</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invested</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpiData.fundMetrics.totalInvested)}</div>
                  <p className="text-xs text-gray-500">
                    {((kpiData.fundMetrics.totalInvested / kpiData.fundMetrics.totalFundSize) * 100).toFixed(1)}% deployed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Number of Deals</CardTitle>
                  <Building2 className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.fundMetrics.numberOfDeals}</div>
                  <p className="text-xs text-gray-500">Total investments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpiData.fundMetrics.averageDealSize)}</div>
                  <p className="text-xs text-gray-500">Per investment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">TVPI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.portfolioMetrics.tvpi}x</div>
                  <p className="text-xs text-gray-500">Total value multiple</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Performance */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{kpiData.portfolioMetrics.totalReturn}%</div>
                  <p className="text-xs text-gray-500">Cumulative return</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IRR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{kpiData.portfolioMetrics.irr}%</div>
                  <p className="text-xs text-gray-500">Internal rate of return</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">DPI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{kpiData.portfolioMetrics.dpi}x</div>
                  <p className="text-xs text-gray-500">Distributions to paid-in</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MoM Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{kpiData.performanceMetrics.moMGrowth}%</div>
                  <p className="text-xs text-gray-500">Month-over-month</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Portfolio Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{kpiData.portfolioMetrics.activeInvestments}</div>
                    <p className="text-sm text-gray-600">Active Investments</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{kpiData.portfolioMetrics.exitedInvestments}</div>
                    <p className="text-sm text-gray-600">Exited Investments</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{kpiData.portfolioMetrics.writtenOffInvestments}</div>
                    <p className="text-sm text-gray-600">Written Off</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Revenue Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ARR:</span>
                        <span className="font-medium">{formatCurrency(kpiData.performanceMetrics.arr)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">MoM Growth:</span>
                        <span className="font-medium">{kpiData.performanceMetrics.moMGrowth}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Customer Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Retention Rate:</span>
                        <span className="font-medium">{kpiData.performanceMetrics.retentionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Churn Rate:</span>
                        <span className="font-medium">{kpiData.performanceMetrics.churnRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Unit Economics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">LTV:</span>
                        <span className="font-medium">{formatCurrency(kpiData.performanceMetrics.ltv)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CAC:</span>
                        <span className="font-medium">{formatCurrency(kpiData.performanceMetrics.cac)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

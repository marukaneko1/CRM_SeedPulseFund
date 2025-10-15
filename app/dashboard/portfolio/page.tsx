"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Users, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Demo portfolio companies only for admin
const demoPortfolioCompanies = [
  {
    id: "1",
    name: "Startup X",
    investment: 500000,
    equity: 15,
    currentValue: 850000,
    mrr: 45000,
    growth: 35,
    status: "Active",
  },
  {
    id: "2",
    name: "TechVenture",
    investment: 250000,
    equity: 10,
    currentValue: 400000,
    mrr: 25000,
    growth: 28,
    status: "Active",
  },
  {
    id: "3",
    name: "InnovateLab",
    investment: 1000000,
    equity: 20,
    currentValue: 2500000,
    mrr: 120000,
    growth: 42,
    status: "Active",
  },
  {
    id: "4",
    name: "GrowthCo",
    investment: 750000,
    equity: 12,
    currentValue: 950000,
    mrr: 65000,
    growth: 18,
    status: "Active",
  },
]

export default function PortfolioPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const portfolioCompanies = isAdmin ? demoPortfolioCompanies : []
  
  const totalInvestment = portfolioCompanies.reduce((sum, company) => sum + company.investment, 0)
  const totalCurrentValue = portfolioCompanies.reduce((sum, company) => sum + company.currentValue, 0)
  const totalReturn = portfolioCompanies.length > 0 ? ((totalCurrentValue - totalInvestment) / totalInvestment) * 100 : 0

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-gray-600">Track your portfolio company performance</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">
                {totalReturn.toFixed(1)}%
              </p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{portfolioCompanies.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioCompanies.map((company) => {
              const roi = ((company.currentValue - company.investment) / company.investment) * 100
              
              return (
                <div
                  key={company.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Investment: {formatCurrency(company.investment)}</span>
                        <span>Equity: {company.equity}%</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {company.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Value</p>
                      <p className="font-semibold">{formatCurrency(company.currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ROI</p>
                      <div className="flex items-center gap-1">
                        <p className={`font-semibold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                        </p>
                        {roi > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">MRR</p>
                      <p className="font-semibold">{formatCurrency(company.mrr)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
                      <p className="font-semibold text-blue-600">+{company.growth}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



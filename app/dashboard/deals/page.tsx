"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

const stages = [
  { id: "lead", name: "Lead", color: "bg-gray-200" },
  { id: "qualified", name: "Qualified", color: "bg-blue-200" },
  { id: "meeting", name: "Meeting", color: "bg-purple-200" },
  { id: "proposal", name: "Proposal", color: "bg-yellow-200" },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-200" },
  { id: "closed", name: "Closed Won", color: "bg-green-200" },
]

const deals = [
  { id: "1", title: "Startup X - Series A", amount: 2000000, stage: "negotiation", company: "Startup X" },
  { id: "2", title: "TechVenture - Seed", amount: 500000, stage: "proposal", company: "TechVenture" },
  { id: "3", title: "InnovateLab - Series B", amount: 5000000, stage: "meeting", company: "InnovateLab" },
  { id: "4", title: "GrowthCo - Seed", amount: 750000, stage: "qualified", company: "GrowthCo" },
  { id: "5", title: "AI Startup - Pre-seed", amount: 250000, stage: "lead", company: "AI Startup" },
]

export default function DealsPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deal Pipeline</h1>
          <p className="text-gray-600">Track your deals through each stage</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id)
            const totalValue = stageDeals.reduce((sum, deal) => sum + deal.amount, 0)
            
            return (
              <div key={stage.id} className="w-80 flex-shrink-0">
                <div className={cn("rounded-t-lg p-4", stage.color)}>
                  <h3 className="font-semibold mb-1">{stage.name}</h3>
                  <p className="text-sm opacity-75">
                    {stageDeals.length} deals · {formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-b-lg min-h-[500px] space-y-3">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{deal.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{deal.company}</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(deal.amount)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{deals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.amount, 0) / deals.length)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">68%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



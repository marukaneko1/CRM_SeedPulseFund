"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { DealForm } from "@/components/forms/deal-form"

const stages = [
  { id: "LEAD", name: "Lead", color: "bg-gray-200" },
  { id: "QUALIFIED", name: "Qualified", color: "bg-blue-200" },
  { id: "MEETING", name: "Meeting", color: "bg-purple-200" },
  { id: "PROPOSAL", name: "Proposal", color: "bg-yellow-200" },
  { id: "NEGOTIATION", name: "Negotiation", color: "bg-orange-200" },
  { id: "CLOSED", name: "Closed Won", color: "bg-green-200" },
]

interface Deal {
  id: string
  title: string
  amount?: number
  stage: string
  probability: number
  company?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function DealsPage() {
  const { data: session } = useSession()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()

  // Fetch deals from API
  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals')
      if (response.ok) {
        const data = await response.json()
        setDeals(data)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchDeals()
    }
  }, [session])

  const handleAddDeal = () => {
    setSelectedDeal(undefined)
    setShowForm(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowForm(true)
  }

  const handleDeleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return
    
    try {
      const response = await fetch(`/api/deals/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deal Pipeline</h1>
          <p className="text-gray-600">Track your deals through each stage</p>
        </div>
        <Button onClick={handleAddDeal}>
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id)
            const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
            
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
                    <Card key={deal.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{deal.title}</CardTitle>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditDeal(deal); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteDeal(deal.id); }}>
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{deal.company?.name || 'No company'}</p>
                        {deal.amount && (
                          <p className="text-lg font-semibold text-blue-600 mb-1">
                            {formatCurrency(deal.amount)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{deal.probability}% win probability</p>
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
              {formatCurrency(deals.reduce((sum, deal) => sum + (deal.amount || 0), 0))}
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
              {deals.length > 0 ? formatCurrency(deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length) : '$0'}
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

      {/* Deal Form Modal */}
      {showForm && (
        <DealForm
          deal={selectedDeal}
          onClose={() => setShowForm(false)}
          onSuccess={() => fetchDeals()}
        />
      )}
    </div>
  )
}



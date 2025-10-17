"use client"

import { Button } from "@/components/ui/button"
import { Briefcase, Plus, Filter, Download } from "lucide-react"

const deals = [
  { id: 1, name: "Acme Corp", stage: "Target Lead", amount: "$500K", probability: 30, team: "Parks King" },
  { id: 2, name: "BetaTech", stage: "Initial Meeting", amount: "$1.2M", probability: 50, team: "Sarah Ingersoll" },
  { id: 3, name: "GammaVentures", stage: "Deep Diligence", amount: "$2.5M", probability: 75, team: "Michael Lavendier" },
]

export default function FundPipelinePage() {
  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto max-h-screen">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Fund Pipeline
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Deal</Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal Team</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(deal => (
              <tr key={deal.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">{deal.name}</td>
                <td className="px-4 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{deal.stage}</span></td>
                <td className="px-4 py-4">{deal.amount}</td>
                <td className="px-4 py-4">{deal.probability}%</td>
                <td className="px-4 py-4">{deal.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


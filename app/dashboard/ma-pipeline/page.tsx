"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Filter } from "lucide-react"

export default function MAPipelinePage() {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          M&A Pipeline
        </h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No M&A deals in pipeline</p>
          <Button><Plus className="w-4 h-4 mr-2" />Add M&A Opportunity</Button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

export default function AcceleratorPage() {
  return (
    <div className="flex-1 bg-white p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Target className="w-8 h-8 text-blue-600" />
        Accelerator & Incubator Programs
      </h1>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500">Content coming soon</p>
      </div>
    </div>
  )
}


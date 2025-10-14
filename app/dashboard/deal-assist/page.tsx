"use client"

import { Button } from "@/components/ui/button"
import { Star, Sparkles } from "lucide-react"

export default function DealAssistPage() {
  return (
    <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Deal Assist AI
          </h1>
          <p className="text-gray-600 text-lg">
            Your AI-powered assistant for deal analysis and insights
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">How can I help you today?</h3>
              <p className="text-gray-600">
                I can help you analyze deals, research companies, generate investment memos, and more.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <span className="font-semibold mb-1">📊 Analyze Deal</span>
              <span className="text-sm text-gray-500">Get insights on deal metrics</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <span className="font-semibold mb-1">🔍 Research Company</span>
              <span className="text-sm text-gray-500">Deep dive into company data</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <span className="font-semibold mb-1">📝 Generate Memo</span>
              <span className="text-sm text-gray-500">Create investment memo</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <span className="font-semibold mb-1">💡 Get Recommendations</span>
              <span className="text-sm text-gray-500">AI-powered deal suggestions</span>
            </Button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ask anything about your deals..."
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-lg"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600">
              Send
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>💡 Tip: Try asking "What are my top 3 deals by probability?"</p>
        </div>
      </div>
    </div>
  )
}


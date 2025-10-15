"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Brain,
  Loader2
} from 'lucide-react'
import { useChat } from 'ai/react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

export function DealAssistChat() {
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/deal-assist',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your AI Deal Assistant, specialized in venture capital, investment analysis, and financial due diligence.

I can help you with:
• **Deal Analysis** - Evaluate investment opportunities
• **Market Research** - Industry trends and competitive landscape
• **Financial Modeling** - Projections and valuation analysis
• **Due Diligence** - Key questions and red flags to watch for
• **Term Sheet Review** - Understanding deal terms and structures
• **Portfolio Strategy** - Investment thesis and portfolio construction

What would you like assistance with today?`
      }
    ]
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestedPrompts = [
    {
      icon: TrendingUp,
      text: "Analyze this deal opportunity",
      prompt: "I have a Series A opportunity in the AI/ML space. The company has $2M ARR with 15% MoM growth. Can you help me analyze this deal?"
    },
    {
      icon: DollarSign,
      text: "Help with valuation",
      prompt: "What valuation methods should I use for a SaaS company with $5M ARR and 200% YoY growth?"
    },
    {
      icon: FileText,
      text: "Due diligence checklist",
      prompt: "What are the key due diligence items I should review for a B2B SaaS investment?"
    },
    {
      icon: Brain,
      text: "Market analysis",
      prompt: "What are the current trends in fintech investments? What sectors are attracting the most VC funding?"
    }
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Deal Assistant</h2>
            <p className="text-sm text-gray-600">Powered by advanced AI • Specialized in VC & Finance</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              {message.role === 'assistant' && (
                <div className="text-xs text-gray-400 mt-2">
                  {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              Error: {error.message}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Try asking about:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, index) => {
              const Icon = prompt.icon
              return (
                <button
                  key={index}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt.prompt } } as any)
                  }}
                  className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {prompt.text}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about deals, valuations, market trends..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses are AI-generated and should be verified. For investment decisions, consult with professionals.
        </p>
      </div>
    </div>
  )
}


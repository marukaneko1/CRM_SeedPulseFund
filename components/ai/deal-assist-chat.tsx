"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AIActionsMenu } from '@/components/ai/ai-actions-menu'
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Brain,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function DealAssistChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
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
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/deal-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      // Read the stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantMessage += chunk

          // Update the assistant message in real-time
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: assistantMessage }
                : msg
            )
          )
        }
      }
    } catch (error: any) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}\n\nPlease make sure your OpenAI API key is configured in Vercel environment variables.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

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

  const hasUserMessage = messages.some(m => m.role === 'user')

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {!hasUserMessage && !isLoading ? (
        // Landing screen (Old UI style)
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl mx-auto">
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Deal Assist AI</h1>
                <p className="text-gray-600 mt-2">Your AI-powered assistant for deal analysis and insights</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setInput("Analyze this deal opportunity: revenue growth, unit economics, risks, and upside.")}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Analyze Deal</p>
                    <p className="text-sm text-gray-600">Get insights on deal metrics</p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Research this company: market, competition, business model, and risks.")}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Research Company</p>
                    <p className="text-sm text-gray-600">Deep dive into company data</p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Generate an investment memo: thesis, market, product, traction, team, risks, valuation.")}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generate Memo</p>
                    <p className="text-sm text-gray-600">Create investment memo</p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Based on my current pipeline, what are the top 3 deals by probability and expected value?")}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get Recommendations</p>
                    <p className="text-sm text-gray-600">AI-powered deal suggestions</p>
                  </div>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your deals..."
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

              <p className="text-xs text-gray-500 mt-4 text-center">
                Tip: Try asking &quot;What are my top 3 deals by probability?&quot;
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Conversation screen (preserves ChatGPT integration)
        <>
          <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Deal Assistant</h2>
                  <p className="text-sm text-gray-600">Powered by GPT-4o • Specialized in VC & Finance</p>
                </div>
              </div>
              <AIActionsMenu 
                context={{
                  companyName: 'Sample Company',
                  industry: 'Technology'
                }}
                onActionComplete={(result) => {
                  console.log('AI Action completed:', result)
                }}
              />
            </div>
          </div>

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
                  {message.role === 'assistant' && message.content && (
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

            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
              AI responses are generated and should be verified. For investment decisions, consult with professionals.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * AI Usage Logger
 * Tracks AI API calls, costs, and usage patterns
 */

export interface AIUsageLog {
  id: string
  userId: string
  provider: 'openai' | 'anthropic'
  model: string
  endpoint: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
  duration: number
  timestamp: string
  success: boolean
  error?: string
}

export interface AIChat {
  id: string
  userId: string
  dealId?: string
  companyId?: string
  title: string
  createdAt: string
  updatedAt: string
  messages: AIMessage[]
}

export interface AIMessage {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens: number
  cost: number
  model: string
  timestamp: string
}

/**
 * Pricing per 1M tokens (as of Oct 2024)
 */
const PRICING = {
  openai: {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.150, output: 0.600 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-5-haiku-20241022': { input: 1.00, output: 5.00 },
  }
}

/**
 * Calculate cost for API call
 */
export function calculateCost(
  provider: 'openai' | 'anthropic',
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[provider]?.[model as keyof typeof PRICING[typeof provider]]
  
  if (!pricing) {
    console.warn(`No pricing found for ${provider}/${model}`)
    return 0
  }

  const inputCost = (inputTokens / 1000000) * pricing.input
  const outputCost = (outputTokens / 1000000) * pricing.output
  
  return inputCost + outputCost
}

/**
 * Log AI usage (stub - in production, save to database)
 */
export async function logAIUsage(log: Omit<AIUsageLog, 'id' | 'timestamp'>): Promise<string> {
  const usageLog: AIUsageLog = {
    ...log,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  }

  console.log('AI Usage Log:', usageLog)
  
  // In production: Save to database
  // await prisma.aiUsageLog.create({ data: usageLog })

  return usageLog.id
}

/**
 * Get usage statistics for a user or time period
 */
export async function getUsageStats(params: {
  userId?: string
  startDate?: Date
  endDate?: Date
  provider?: 'openai' | 'anthropic'
}): Promise<{
  totalCalls: number
  totalCost: number
  totalTokens: number
  averageCost: number
  byModel: Record<string, { calls: number; cost: number; tokens: number }>
}> {
  // Mock data - in production, query from database
  return {
    totalCalls: 150,
    totalCost: 12.50,
    totalTokens: 250000,
    averageCost: 0.083,
    byModel: {
      'gpt-4o-mini': { calls: 100, cost: 3.50, tokens: 150000 },
      'gpt-4o': { calls: 50, cost: 9.00, tokens: 100000 },
    }
  }
}

/**
 * Create or update AI chat session
 */
export async function saveAIChat(chat: Omit<AIChat, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const aiChat: AIChat = {
    ...chat,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  console.log('AI Chat saved:', aiChat.id)
  
  // In production: Save to database
  // await prisma.aiChat.create({ data: aiChat })

  return aiChat.id
}

/**
 * Add message to AI chat
 */
export async function addAIMessage(message: Omit<AIMessage, 'id' | 'timestamp'>): Promise<string> {
  const aiMessage: AIMessage = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  }

  console.log('AI Message added:', aiMessage.id, `Cost: $${aiMessage.cost.toFixed(4)}`)
  
  // In production: Save to database
  // await prisma.aiMessage.create({ data: aiMessage })

  return aiMessage.id
}

/**
 * Estimate tokens for text (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Get total AI spending for user/organization
 */
export async function getTotalSpending(params: {
  userId?: string
  organizationId?: string
  period?: 'day' | 'week' | 'month' | 'year'
}): Promise<number> {
  // Mock data - in production, aggregate from database
  return 45.75
}

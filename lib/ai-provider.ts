import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

/**
 * AI Provider Configuration
 * Supports OpenAI and Anthropic with automatic fallback
 */

export type AIProvider = 'openai' | 'anthropic'

export interface AIConfig {
  provider: AIProvider
  model: string
  fallbackProvider?: AIProvider
  fallbackModel?: string
}

/**
 * Get the configured AI provider from environment
 */
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase()
  return provider === 'anthropic' ? 'anthropic' : 'openai'
}

/**
 * Get AI model based on provider and task type
 */
export function getAIModel(taskType: 'chat' | 'analysis' | 'generation' = 'chat') {
  const provider = getAIProvider()
  
  const models = {
    openai: {
      chat: 'gpt-4o-mini', // Faster, cheaper for chat
      analysis: 'gpt-4o', // Better for complex analysis
      generation: 'gpt-4o-mini', // Good for content generation
    },
    anthropic: {
      chat: 'claude-3-5-sonnet-20241022',
      analysis: 'claude-3-5-sonnet-20241022',
      generation: 'claude-3-5-sonnet-20241022',
    }
  }

  const modelName = models[provider][taskType]
  
  if (provider === 'openai') {
    return openai(modelName)
  } else {
    return anthropic(modelName)
  }
}

/**
 * Get model with fallback support
 */
export function getModelWithFallback(config: AIConfig) {
  try {
    if (config.provider === 'openai') {
      return openai(config.model)
    } else {
      return anthropic(config.model)
    }
  } catch (error) {
    console.warn(`Primary provider ${config.provider} failed, using fallback`)
    
    if (config.fallbackProvider && config.fallbackModel) {
      if (config.fallbackProvider === 'openai') {
        return openai(config.fallbackModel)
      } else {
        return anthropic(config.fallbackModel)
      }
    }
    
    throw error
  }
}

/**
 * Handle AI API errors with user-friendly messages
 */
export function handleAIError(error: any): { error: string; code: string; retryable: boolean } {
  console.error('AI Error:', error)
  
  // API Key errors
  if (error?.message?.includes('API key') || error?.message?.includes('Unauthorized')) {
    return {
      error: 'AI service not configured. Please add your API key in Settings.',
      code: 'API_KEY_MISSING',
      retryable: false
    }
  }
  
  // Quota errors
  if (error?.message?.includes('quota') || error?.statusCode === 429) {
    return {
      error: 'AI quota exceeded. Please check your billing or try again later.',
      code: 'QUOTA_EXCEEDED',
      retryable: true
    }
  }
  
  // Rate limit errors
  if (error?.message?.includes('rate limit')) {
    return {
      error: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
      retryable: true
    }
  }
  
  // Model not found
  if (error?.message?.includes('model') && error?.message?.includes('not exist')) {
    return {
      error: 'AI model not available. Using fallback model.',
      code: 'MODEL_NOT_FOUND',
      retryable: true
    }
  }
  
  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('ECONNREFUSED')) {
    return {
      error: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      retryable: true
    }
  }
  
  // Default error
  return {
    error: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    retryable: true
  }
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  const provider = getAIProvider()
  
  if (provider === 'openai') {
    return !!process.env.OPENAI_API_KEY
  } else if (provider === 'anthropic') {
    return !!process.env.ANTHROPIC_API_KEY
  }
  
  return false
}

/**
 * Get AI provider display name
 */
export function getAIProviderName(): string {
  const provider = getAIProvider()
  return provider === 'openai' ? 'OpenAI' : 'Anthropic'
}

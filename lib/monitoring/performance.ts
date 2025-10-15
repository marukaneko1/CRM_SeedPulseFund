/**
 * Performance Monitoring Utilities
 */

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: string
  metadata?: Record<string, any>
}

/**
 * Simple performance timer
 */
export class PerformanceTimer {
  private startTime: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.startTime = Date.now()
  }

  end(metadata?: Record<string, any>): PerformanceMetric {
    const duration = Date.now() - this.startTime
    const metric: PerformanceMetric = {
      name: this.name,
      duration,
      timestamp: new Date().toISOString(),
      metadata
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${this.name} took ${duration}ms`, metadata)
    }

    // In production: Send to monitoring service (Vercel Analytics, Datadog, etc.)
    return metric
  }
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const timer = new PerformanceTimer(name)
  try {
    const result = await fn()
    timer.end({ ...metadata, status: 'success' })
    return result
  } catch (error: any) {
    timer.end({ ...metadata, status: 'error', error: error.message })
    throw error
  }
}

/**
 * Log API call performance
 */
export function logAPICall(endpoint: string, method: string, duration: number, statusCode: number) {
  const metric = {
    type: 'api_call',
    endpoint,
    method,
    duration,
    statusCode,
    timestamp: new Date().toISOString()
  }

  if (duration > 2000) {
    console.warn('Slow API call:', metric)
  }

  // In production: Send to monitoring service
  return metric
}

/**
 * Monitor memory usage (Node.js only)
 */
export function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      timestamp: new Date().toISOString()
    }
  }
  return null
}

/**
 * Check if performance is degraded
 */
export function checkPerformanceHealth(): {
  healthy: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check memory if available
  const memory = getMemoryUsage()
  if (memory && memory.heapUsed > 500) {
    issues.push(`High memory usage: ${memory.heapUsed}MB`)
  }

  return {
    healthy: issues.length === 0,
    issues
  }
}

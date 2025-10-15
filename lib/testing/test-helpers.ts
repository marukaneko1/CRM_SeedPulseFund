/**
 * Testing Utilities and Helpers
 */

/**
 * Mock session for testing
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Mock admin session
 */
export const mockAdminSession = {
  user: {
    id: 'admin-user-id',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'ADMIN'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Generate test data
 */
export const testData = {
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0100',
    company: 'Test Company',
    role: 'CEO'
  },
  
  company: {
    name: 'Test Company Inc.',
    website: 'https://testcompany.com',
    industry: 'Technology',
    stage: 'Series A',
    description: 'A test company for QA purposes'
  },
  
  deal: {
    title: 'Test Deal',
    amount: 5000000,
    stage: 'PITCH',
    companyId: 'test-company-id',
    probability: 50
  },
  
  task: {
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}

/**
 * Wait for async operations
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await wait(delay)
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}

/**
 * Test API endpoint
 */
export async function testAPIEndpoint(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(endpoint, options)
    const data = await response.json()
    
    return {
      success: response.ok,
      data: response.ok ? data : undefined,
      error: !response.ok ? data.error || 'Request failed' : undefined
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

/**
 * Validate API response structure
 */
export function validateAPIResponse(
  response: any,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in response)) {
      missing.push(field)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  }
}

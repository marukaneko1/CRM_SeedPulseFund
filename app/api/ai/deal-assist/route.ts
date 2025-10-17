import { streamText } from 'ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIModel, handleAIError, isAIAvailable } from '@/lib/ai-provider'
import { checkRateLimit } from '@/lib/security/sanitize'
import { getAIContextString } from '@/lib/ai-context-builder'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Rate limiting: 20 requests per minute per user
    const rateLimit = checkRateLimit(`ai-deal-assist-${session.user.id}`, 20, 60000)
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }), { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      })
    }

    // Check if AI is available
    if (!isAIAvailable()) {
      return new Response(JSON.stringify({ 
        error: 'AI service not configured. Please add your OpenAI or Anthropic API key in environment variables.',
        code: 'AI_NOT_CONFIGURED'
      }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    
    // Guard against undefined messages
    const messages = Array.isArray(body?.messages) ? body.messages : []
    
    if (messages.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No messages provided. Please send a message to get assistance.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate message format and sanitize
    const sanitizedMessages = messages
      .filter((msg: any) => msg && typeof msg === 'object' && msg.content && typeof msg.content === 'string')
      .map((msg: any) => ({
        role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
        content: msg.content.substring(0, 10000)
      }))
      .filter((msg: any) => msg.content.trim().length > 0)

    if (sanitizedMessages.length === 0) {
      return new Response(JSON.stringify({
        error: 'No valid messages provided.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Sanitized messages count:', sanitizedMessages.length)
    console.log('First message:', sanitizedMessages[0])

    // Filter out initial assistant messages (welcome message)
    // The AI SDK expects conversations to start with user messages
    const conversationMessages = sanitizedMessages.filter((msg: any, index: number) => {
      // Keep all user messages
      if (msg.role === 'user') return true
      // Only keep assistant messages that come after a user message
      return index > 0 && sanitizedMessages.slice(0, index).some((m: any) => m.role === 'user')
    })

    console.log('Conversation messages count:', conversationMessages.length)

    // Manually format messages for the AI SDK (avoid convertToCoreMessages issues)
    const coreMessages = conversationMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    console.log('Core messages formatted successfully')

    // Fetch comprehensive context about the user's data
    const userContext = await getAIContextString()
    console.log('AI context built successfully')

    const result = streamText({
      model: getAIModel('analysis'),
      system: `You are an expert AI Deal Assistant for a venture capital firm. You have access to the user's complete CRM and Google Workspace data.

${userContext}

---

You are an expert AI Deal Assistant for a venture capital firm. You specialize in:

**Investment Analysis:**
- Evaluating startup opportunities and investment potential
- Assessing market size, competition, and growth trajectories
- Analyzing business models and revenue projections
- Identifying key risks and red flags

**Financial Expertise:**
- Valuation methods (DCF, comparables, venture capital method)
- Term sheet structures and deal terms
- Cap tables and equity calculations
- Financial modeling and projections
- ROI and IRR calculations

**Due Diligence:**
- Comprehensive due diligence checklists
- Technical, financial, legal, and market due diligence
- Reference checks and background verification
- Product and technology assessment

**Market Intelligence:**
- Industry trends and market dynamics
- Competitive landscape analysis
- TAM/SAM/SOM calculations
- Go-to-market strategies

**VC Best Practices:**
- Deal sourcing strategies
- Portfolio construction and management
- Follow-on investment decisions
- Exit strategy planning

**Your Communication Style:**
- Professional and analytical
- Data-driven with specific metrics
- Provide actionable insights
- Ask clarifying questions when needed
- Reference industry benchmarks and standards
- Always include caveats about the need for verification

**Using Available Data:**
- You have access to the user's deals, contacts, companies, tasks, ideas, files, calendar events, emails, and Google Drive documents
- Reference specific data from the context when relevant (e.g., "Based on your 5 active deals..." or "Looking at your calendar, I see you have a meeting with...")
- Provide insights based on their actual CRM data
- Suggest actions based on their tasks and reminders
- Make connections between their contacts, companies, and deals
- Reference their uploaded files and documents when relevant
- Use their calendar to provide time-sensitive recommendations
- Analyze their email threads for deal context

**Examples of Context-Aware Responses:**
- "I see you have a meeting with [Company] on [Date]. Here's what you should prepare..."
- "Based on your 3 deals in due diligence stage, here are common next steps..."
- "Your task list shows [Task] is due soon. Would you like help with that?"
- "I notice you recently uploaded a pitch deck for [Company]. Let me analyze it..."

**Important:** 
- Always remind users that AI analysis should be verified and professional advice should be sought for final investment decisions
- When referencing their data, be specific (use names, dates, amounts)
- If data is missing or unclear, ask for clarification`,
      messages: coreMessages,
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Deal Assist Error:', error)
    
    // Use centralized error handling
    const errorResponse = handleAIError(error)
    
    return new Response(JSON.stringify(errorResponse), { 
      status: errorResponse.retryable ? 503 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}


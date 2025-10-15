import { streamText, convertToCoreMessages } from 'ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIModel, handleAIError, isAIAvailable } from '@/lib/ai-provider'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
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

    const result = streamText({
      model: getAIModel('analysis'),
      system: `You are an expert AI Deal Assistant for a venture capital firm. You specialize in:

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

**Important:** Always remind users that AI analysis should be verified and professional advice should be sought for final investment decisions.`,
      messages: convertToCoreMessages(messages),
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


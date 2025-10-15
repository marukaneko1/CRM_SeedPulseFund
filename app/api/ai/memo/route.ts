import { streamText } from 'ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIModel, handleAIError, isAIAvailable } from '@/lib/ai-provider'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!isAIAvailable()) {
      return new Response(JSON.stringify({ 
        error: 'AI service not configured.',
        code: 'AI_NOT_CONFIGURED'
      }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const { companyName, industry, dealInfo, notes, memoType } = body

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Company name is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `You are an expert venture capital analyst specializing in creating comprehensive investment memos. Your memos are clear, data-driven, and decision-oriented.

**Investment Memo Structure:**

1. **Executive Summary**
   - Investment thesis in 2-3 sentences
   - Key highlights
   - Recommendation (with clear rationale)

2. **Company Overview**
   - What the company does
   - Problem being solved
   - Solution/Product
   - Business model
   - Stage and traction

3. **Market Opportunity**
   - Market size (TAM/SAM/SOM)
   - Market dynamics and trends
   - Growth drivers
   - Competitive landscape

4. **Team Assessment**
   - Founders and key team members
   - Relevant experience
   - Domain expertise
   - Track record

5. **Product & Technology**
   - Product differentiation
   - Technology moat
   - IP and defensibility
   - Product roadmap

6. **Traction & Metrics**
   - Revenue and growth
   - Key performance indicators
   - Customer acquisition
   - Unit economics

7. **Deal Terms**
   - Valuation
   - Investment amount
   - Ownership percentage
   - Key terms and conditions

8. **Risks & Mitigations**
   - Key risks identified
   - Mitigation strategies
   - Red flags or concerns

9. **Investment Rationale**
   - Why now?
   - Strategic fit
   - Exit potential
   - Expected returns (IRR/multiple)

10. **Recommendation**
    - Clear decision: Invest/Pass/More DD
    - Next steps
    - Timeline

**Style:** Professional, concise, data-driven. Use bullet points for clarity. Include specific metrics and benchmarks.`

    const userPrompt = `Create an investment memo for:

**Company:** ${companyName}
**Industry:** ${industry || 'Not specified'}
**Memo Type:** ${memoType || 'Full Investment Memo'}

${dealInfo ? `**Deal Information:**\n${JSON.stringify(dealInfo, null, 2)}` : ''}

${notes ? `**Additional Notes:**\n${notes}` : ''}

Please create a comprehensive, professional investment memo that our IC can review.`

    const result = streamText({
      model: getAIModel('generation'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.6,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Memo Generation Error:', error)
    const errorResponse = handleAIError(error)
    
    return new Response(JSON.stringify(errorResponse), { 
      status: errorResponse.retryable ? 503 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

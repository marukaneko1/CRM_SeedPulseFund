import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { companyName, industry, stage, investmentAmount } = body

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Company name is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `You are an expert venture capital due diligence analyst. Create comprehensive, industry-specific due diligence checklists.

**Your Checklist Should Include:**

1. **Company & Team**
   - Leadership background checks
   - Cap table review
   - Employment agreements
   - Advisory board composition

2. **Financial Due Diligence**
   - Revenue verification
   - Cash burn analysis
   - Financial projections review
   - Unit economics validation
   - Accounting practices

3. **Legal Due Diligence**
   - Corporate structure
   - IP ownership and protection
   - Material contracts
   - Litigation history
   - Regulatory compliance

4. **Product & Technology**
   - Technical architecture review
   - Product roadmap assessment
   - IP portfolio evaluation
   - Security and data privacy
   - Technical debt assessment

5. **Market & Competition**
   - Market size validation (TAM/SAM/SOM)
   - Competitive landscape analysis
   - Customer concentration risk
   - Go-to-market strategy review

6. **Customer & Sales**
   - Customer reference calls
   - Sales pipeline validation
   - Customer acquisition cost
   - Churn analysis
   - Contract review

7. **Operations**
   - Operational scalability
   - Key vendor dependencies
   - Infrastructure review
   - Data room organization

**Format:** Use clear categories, checkboxes, and specific action items. Tailor to the company's stage and industry.`

    const userPrompt = `Create a comprehensive due diligence checklist for:

**Company:** ${companyName}
**Industry:** ${industry || 'Technology/Software'}
**Stage:** ${stage || 'Series A'}
**Investment Amount:** ${investmentAmount || 'Not specified'}

Please provide a detailed, actionable checklist that our team can use to conduct thorough due diligence.`

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.5, // Lower temperature for more consistent, structured output
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI DD Checklist Error:', error)
    
    if (error?.message?.includes('API key')) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred while generating the checklist. Please try again.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

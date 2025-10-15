import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
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
    const { objection, context, dealInfo } = body

    if (!objection || typeof objection !== 'string' || objection.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Objection text is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `You are an expert sales coach specializing in venture capital and startup investments. Your role is to help investors craft effective responses to objections.

**Your Approach:**
- Acknowledge the concern professionally
- Provide data-driven counterpoints
- Use industry benchmarks and examples
- Maintain a collaborative, not confrontational, tone
- Focus on building trust and addressing underlying concerns

**Response Structure:**
1. Acknowledge the objection
2. Provide context and data
3. Share relevant examples or case studies
4. Suggest next steps or compromises

**Important:** Keep responses concise (2-3 paragraphs), professional, and action-oriented.`

    const userPrompt = `
**Objection:** ${objection}

${context ? `**Context:** ${context}` : ''}

${dealInfo ? `**Deal Information:** ${JSON.stringify(dealInfo, null, 2)}` : ''}

Please provide a professional response to this objection that I can use in my investor communication.`

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Objection Reply Error:', error)
    
    if (error?.message?.includes('API key')) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred while generating the response. Please try again.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

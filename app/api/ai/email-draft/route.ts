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
    const { emailType, recipient, context, tone, keyPoints } = body

    if (!emailType || typeof emailType !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Email type is required (e.g., introduction, follow-up, investment_update)' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `You are an expert business communication specialist for venture capital firms. You craft professional, compelling emails that get responses.

**Email Best Practices:**

1. **Subject Lines:**
   - Clear and specific
   - Create curiosity or urgency when appropriate
   - Keep under 50 characters
   - Personalized when possible

2. **Email Structure:**
   - Opening: Personalized greeting
   - Hook: Why this matters to them
   - Body: Key information (3-4 paragraphs max)
   - Call to Action: Clear next step
   - Closing: Professional signature

3. **Tone Variations:**
   - **Professional:** Formal, respectful, detail-oriented
   - **Friendly:** Warm, approachable, conversational
   - **Direct:** Brief, action-oriented, time-efficient
   - **Persuasive:** Compelling, benefit-focused, strategic

4. **Email Types You Can Draft:**
   - Introduction emails (founder intros, LP intros)
   - Follow-up emails (post-meeting, post-pitch)
   - Investment updates (quarterly reports, portfolio news)
   - Partnership proposals
   - Event invitations
   - Thank you notes
   - Rejection emails (respectful, leave door open)

**Guidelines:**
- Keep emails concise (150-300 words)
- Use bullet points for key information
- Include specific details and data points
- Always end with a clear call to action
- Maintain professionalism while being personable`

    const userPrompt = `Draft a professional email with the following details:

**Email Type:** ${emailType}
**Recipient:** ${recipient || 'Not specified'}
**Tone:** ${tone || 'Professional'}

${context ? `**Context/Background:**\n${context}` : ''}

${keyPoints && Array.isArray(keyPoints) && keyPoints.length > 0 ? `**Key Points to Include:**\n${keyPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}` : ''}

Please draft a complete email including:
1. Subject line
2. Email body
3. Call to action

Format the email ready to send.`

    const result = streamText({
      model: getAIModel('generation'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Email Draft Error:', error)
    const errorResponse = handleAIError(error)
    
    return new Response(JSON.stringify(errorResponse), { 
      status: errorResponse.retryable ? 503 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

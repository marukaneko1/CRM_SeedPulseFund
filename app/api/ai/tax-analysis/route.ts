import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIModel, handleAIError, isAIAvailable } from '@/lib/ai-provider'
import { checkRateLimit } from '@/lib/security/sanitize'

/**
 * AI Tax Analysis API
 * Analyzes company documents and provides tax guidance
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(session.user.email || 'anonymous')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if AI is available
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please check your API keys.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      companyName, 
      companyType, 
      businessStage, 
      revenue, 
      employees, 
      documents, 
      questions,
      jurisdiction 
    } = body

    // Input validation
    if (!companyName || !companyType) {
      return NextResponse.json(
        { error: 'Company name and type are required' },
        { status: 400 }
      )
    }

    // Build comprehensive tax analysis prompt
    const systemPrompt = `You are a specialized tax advisor and CPA with expertise in startup taxation, venture capital, and corporate tax compliance. Your role is to analyze company information and provide comprehensive tax guidance.

Your analysis should include:
1. **Company Assessment**: Analyze the company's business model, stage, and operations
2. **Tax Entity Recommendations**: Suggest optimal tax entity structure
3. **Required Tax Forms**: Identify all necessary federal, state, and local tax forms
4. **Filing Deadlines**: Provide specific filing deadlines and requirements
5. **Tax Optimization**: Suggest legitimate tax-saving strategies
6. **Compliance Requirements**: Identify ongoing compliance obligations
7. **Risk Assessment**: Highlight potential tax risks and red flags

Always provide specific, actionable advice with form numbers, deadlines, and regulatory references. Be conservative and recommend consulting with a qualified tax professional for complex situations.`

    const userPrompt = `Please analyze this company for tax compliance and provide comprehensive tax guidance:

**Company Information:**
- Company Name: ${companyName}
- Business Type: ${companyType}
- Business Stage: ${businessStage || 'Not specified'}
- Annual Revenue: ${revenue || 'Not disclosed'}
- Number of Employees: ${employees || 'Not disclosed'}
- Jurisdiction: ${jurisdiction || 'United States'}

**Available Documents:**
${documents ? documents.map((doc: any) => `- ${doc.name} (${doc.type})`).join('\n') : 'No documents provided'}

**Specific Questions:**
${questions ? questions.map((q: string) => `- ${q}`).join('\n') : 'No specific questions provided'}

Please provide a comprehensive tax analysis including:
1. Recommended tax entity structure
2. Required tax forms and filings
3. Filing deadlines and requirements
4. Tax optimization strategies
5. Compliance obligations
6. Risk factors and recommendations

Format your response as a structured analysis with clear sections and actionable recommendations.`

    const model = getAIModel('analysis')
    
    const { generateText } = await import('ai')
    const response = await generateText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    })

    return new Response(response.text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-AI-Provider': process.env.AI_PROVIDER || 'openai'
      }
    })

  } catch (error) {
    console.error('Tax analysis error:', error)
    const errorResponse = handleAIError(error)
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.retryable ? 503 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

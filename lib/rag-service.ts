/**
 * RAG (Retrieval-Augmented Generation) Service
 * Stub implementation for grounding AI responses on company/deal documents
 */

export interface Document {
  id: string
  type: 'DEAL' | 'COMPANY' | 'CONTRACT' | 'REPORT'
  title: string
  content: string
  metadata: {
    dealId?: string
    companyId?: string
    uploadedAt: string
    fileType?: string
  }
}

export interface RAGContext {
  query: string
  dealId?: string
  companyId?: string
  limit?: number
}

/**
 * Mock document store - In production, replace with vector database (Pinecone, Weaviate, etc.)
 */
const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'COMPANY',
    title: 'NeuralTech AI - Company Overview',
    content: `NeuralTech AI is a B2B SaaS company building AI-powered customer service automation. 
    Founded in 2022 by Sarah Chen (ex-Google) and Michael Rodriguez (ex-Stripe).
    Current metrics: $2M ARR, 15% MoM growth, 85% retention, $1.2M burn rate.
    Market: Enterprise customer service automation, $15B TAM.
    Competitors: Intercom, Zendesk, Freshdesk.`,
    metadata: {
      companyId: '1',
      uploadedAt: '2024-01-01T00:00:00Z',
      fileType: 'text'
    }
  },
  {
    id: '2',
    type: 'DEAL',
    title: 'Series A Term Sheet - NeuralTech AI',
    content: `Series A Investment Terms:
    Amount: $5M
    Valuation: $20M post-money
    Ownership: 25%
    Board: 2 founders, 2 investors, 1 independent
    Liquidation Preference: 1x non-participating
    Anti-dilution: Broad-based weighted average
    Pro-rata rights: Yes`,
    metadata: {
      dealId: '1',
      companyId: '1',
      uploadedAt: '2024-01-15T00:00:00Z',
      fileType: 'pdf'
    }
  }
]

/**
 * Retrieve relevant documents for a query (Simple keyword matching - Replace with embeddings in production)
 */
export async function retrieveDocuments(context: RAGContext): Promise<Document[]> {
  try {
    const { query, dealId, companyId, limit = 3 } = context

    if (!query || query.trim().length === 0) {
      return []
    }

    let filteredDocs = [...mockDocuments]

    // Filter by dealId or companyId if provided
    if (dealId) {
      filteredDocs = filteredDocs.filter(doc => doc.metadata.dealId === dealId)
    }
    if (companyId) {
      filteredDocs = filteredDocs.filter(doc => doc.metadata.companyId === companyId)
    }

    // Simple keyword matching (in production, use semantic search with embeddings)
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
    
    if (keywords.length === 0) {
      // If no meaningful keywords, return most recent documents
      return filteredDocs
        .sort((a, b) => new Date(b.metadata.uploadedAt).getTime() - new Date(a.metadata.uploadedAt).getTime())
        .slice(0, limit)
    }
    
    const rankedDocs = filteredDocs.map(doc => {
      const contentLower = (doc.title + ' ' + doc.content).toLowerCase()
      const score = keywords.reduce((score, keyword) => {
        const occurrences = (contentLower.match(new RegExp(keyword, 'g')) || []).length
        return score + occurrences
      }, 0)
      return { doc, score }
    })

    // Sort by relevance and return top results
    return rankedDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.doc)
  } catch (error) {
    console.error('Error retrieving documents:', error)
    return []
  }
}

/**
 * Build context string from retrieved documents
 */
export function buildRAGContext(documents: Document[]): string {
  if (documents.length === 0) {
    return ''
  }

  const contextParts = documents.map(doc => 
    `[${doc.type}: ${doc.title}]\n${doc.content}`
  )

  return `\n\n**Relevant Documents:**\n\n${contextParts.join('\n\n---\n\n')}\n\n`
}

/**
 * Enhance user query with RAG context
 */
export async function enhanceWithRAG(
  userQuery: string, 
  context: { dealId?: string; companyId?: string }
): Promise<string> {
  const documents = await retrieveDocuments({
    query: userQuery,
    ...context
  })

  if (documents.length === 0) {
    return userQuery
  }

  const ragContext = buildRAGContext(documents)
  return `${ragContext}\n\n**User Question:** ${userQuery}`
}

/**
 * Add document to RAG system (stub for future implementation)
 */
export async function indexDocument(document: Omit<Document, 'id'>): Promise<string> {
  // In production:
  // 1. Generate embeddings for document content
  // 2. Store embeddings in vector database
  // 3. Return document ID
  
  const newId = Date.now().toString()
  mockDocuments.push({ ...document, id: newId })
  
  console.log('Document indexed (stub):', newId)
  return newId
}

/**
 * Check if RAG is available
 */
export function isRAGAvailable(): boolean {
  // In production, check if vector database is configured
  return true // Stub always returns true
}

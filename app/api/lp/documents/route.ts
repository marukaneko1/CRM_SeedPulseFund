import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface LPDocument {
  id: string
  name: string
  type: 'QUARTERLY_REPORT' | 'ANNUAL_REPORT' | 'CAPITAL_CALL' | 'DISTRIBUTION' | 'TAX_DOCUMENT' | 'OTHER'
  category: string
  description?: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  isNew: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock LP documents data
    const documents: LPDocument[] = [
      {
        id: '1',
        name: 'Q3 2024 Quarterly Report',
        type: 'QUARTERLY_REPORT',
        category: 'Reports',
        description: 'Quarterly performance update and portfolio overview',
        fileUrl: '/documents/q3-2024-quarterly-report.pdf',
        fileSize: 2048576,
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isNew: true
      },
      {
        id: '2',
        name: 'Capital Call Notice - Q1 2024',
        type: 'CAPITAL_CALL',
        category: 'Capital Calls',
        description: 'Capital call for follow-on investments',
        fileUrl: '/documents/capital-call-q1-2024.pdf',
        fileSize: 1024768,
        uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        isNew: false
      },
      {
        id: '3',
        name: '2023 Annual Report',
        type: 'ANNUAL_REPORT',
        category: 'Reports',
        description: 'Annual performance report and fund overview',
        fileUrl: '/documents/2023-annual-report.pdf',
        fileSize: 5242880,
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isNew: false
      },
      {
        id: '4',
        name: 'Distribution Notice - December 2023',
        type: 'DISTRIBUTION',
        category: 'Distributions',
        description: 'Distribution proceeds from portfolio exits',
        fileUrl: '/documents/distribution-dec-2023.pdf',
        fileSize: 512000,
        uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        isNew: false
      },
      {
        id: '5',
        name: 'K-1 Tax Document 2023',
        type: 'TAX_DOCUMENT',
        category: 'Tax Documents',
        description: 'Schedule K-1 for 2023 tax year',
        fileUrl: '/documents/k1-2023.pdf',
        fileSize: 256000,
        uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        isNew: false
      }
    ]

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching LP documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface LPPortfolio {
  totalCommitment: number
  currentValue: number
  totalReturn: number
  irr: number
  moMReturn: number
  investments: {
    id: string
    companyName: string
    investmentAmount: number
    currentValue: number
    returnMultiple: number
    irr: number
    vintage: string
    status: 'ACTIVE' | 'EXITED' | 'WRITTEN_OFF'
  }[]
  capitalCalls: {
    id: string
    amount: number
    dueDate: string
    status: 'PENDING' | 'PAID' | 'OVERDUE'
    description: string
  }[]
  distributions: {
    id: string
    amount: number
    date: string
    source: string
    description: string
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock LP portfolio data
    const portfolio: LPPortfolio = {
      totalCommitment: 5000000,
      currentValue: 6750000,
      totalReturn: 35,
      irr: 18.5,
      moMReturn: 2.3,
      investments: [
        {
          id: '1',
          companyName: 'NeuralTech AI',
          investmentAmount: 2000000,
          currentValue: 3000000,
          returnMultiple: 1.5,
          irr: 22.1,
          vintage: '2023',
          status: 'ACTIVE'
        },
        {
          id: '2',
          companyName: 'GreenEnergy Solutions',
          investmentAmount: 1500000,
          currentValue: 1800000,
          returnMultiple: 1.2,
          irr: 12.5,
          vintage: '2023',
          status: 'ACTIVE'
        },
        {
          id: '3',
          companyName: 'HealthBridge Platform',
          investmentAmount: 1000000,
          currentValue: 1200000,
          returnMultiple: 1.2,
          irr: 8.9,
          vintage: '2024',
          status: 'ACTIVE'
        },
        {
          id: '4',
          companyName: 'QuantumSecure',
          investmentAmount: 500000,
          currentValue: 750000,
          returnMultiple: 1.5,
          irr: 25.3,
          vintage: '2024',
          status: 'ACTIVE'
        }
      ],
      capitalCalls: [
        {
          id: '1',
          amount: 250000,
          dueDate: '2024-02-15',
          status: 'PENDING',
          description: 'Q1 2024 Capital Call - Follow-on investments'
        },
        {
          id: '2',
          amount: 150000,
          dueDate: '2024-01-10',
          status: 'PAID',
          description: 'Q4 2023 Capital Call - New investments'
        }
      ],
      distributions: [
        {
          id: '1',
          amount: 500000,
          date: '2023-12-01',
          source: 'NeuralTech AI',
          description: 'Partial exit proceeds'
        },
        {
          id: '2',
          amount: 200000,
          date: '2023-08-15',
          source: 'GreenEnergy Solutions',
          description: 'Dividend distribution'
        }
      ]
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error fetching LP portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

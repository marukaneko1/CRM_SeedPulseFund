import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface KPIData {
  fundMetrics: {
    totalFundSize: number
    totalInvested: number
    totalCommitted: number
    numberOfDeals: number
    averageDealSize: number
  }
  portfolioMetrics: {
    activeInvestments: number
    exitedInvestments: number
    writtenOffInvestments: number
    totalReturn: number
    irr: number
    tvpi: number
    dpi: number
  }
  performanceMetrics: {
    arr: number
    moMGrowth: number
    retentionRate: number
    churnRate: number
    ltv: number
    cac: number
  }
  timeSeriesData: {
    date: string
    portfolioValue: number
    cashInvested: number
    distributions: number
    nav: number
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock KPI data
    const kpiData: KPIData = {
      fundMetrics: {
        totalFundSize: 50000000,
        totalInvested: 35000000,
        totalCommitted: 45000000,
        numberOfDeals: 25,
        averageDealSize: 1400000
      },
      portfolioMetrics: {
        activeInvestments: 20,
        exitedInvestments: 3,
        writtenOffInvestments: 2,
        totalReturn: 35.5,
        irr: 18.7,
        tvpi: 1.67,
        dpi: 0.45
      },
      performanceMetrics: {
        arr: 12500000,
        moMGrowth: 12.5,
        retentionRate: 94.2,
        churnRate: 5.8,
        ltv: 2500000,
        cac: 125000
      },
      timeSeriesData: [
        { date: '2023-01-01', portfolioValue: 30000000, cashInvested: 20000000, distributions: 0, nav: 30000000 },
        { date: '2023-04-01', portfolioValue: 32500000, cashInvested: 25000000, distributions: 2000000, nav: 30500000 },
        { date: '2023-07-01', portfolioValue: 35000000, cashInvested: 30000000, distributions: 4500000, nav: 30500000 },
        { date: '2023-10-01', portfolioValue: 38000000, cashInvested: 32000000, distributions: 7000000, nav: 31000000 },
        { date: '2024-01-01', portfolioValue: 42000000, cashInvested: 35000000, distributions: 10000000, nav: 32000000 }
      ]
    }

    return NextResponse.json(kpiData)
  } catch (error) {
    console.error('Error fetching KPI data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

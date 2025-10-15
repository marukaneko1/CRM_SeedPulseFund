import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get portfolios for companies owned by this user
    const portfolios = await prisma.portfolio.findMany({
      where: {
        company: {
          userId: session.user.id
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
          }
        },
        metrics: {
          orderBy: { metricDate: 'desc' },
          take: 1,  // Get most recent metrics
        }
      },
      orderBy: { investmentDate: 'desc' }
    })

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, investmentAmount, investmentDate, equityPercentage, currentValuation, status, notes } = body

    // Validation
    if (!companyId || !investmentAmount || !investmentDate) {
      return NextResponse.json(
        { error: 'Company, investment amount, and date are required' },
        { status: 400 }
      )
    }

    // Verify company belongs to user
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company || company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Create portfolio entry
    const portfolio = await prisma.portfolio.create({
      data: {
        companyId,
        investmentAmount,
        investmentDate: new Date(investmentDate),
        equityPercentage,
        currentValuation,
        status,
        notes,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}


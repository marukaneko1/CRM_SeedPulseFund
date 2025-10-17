import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { metricDate, revenue, users, mrr, arr, burnRate, runway, notes } = body

    if (!metricDate) {
      return NextResponse.json({ error: 'Metric date is required' }, { status: 400 })
    }

    // Verify ownership of portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create metric
    const metric = await prisma.portfolioMetric.create({
      data: {
        portfolioId: params.id,
        metricDate: new Date(metricDate),
        revenue,
        users,
        mrr,
        arr,
        burnRate,
        runway,
        notes,
      }
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio metric:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio metric' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all metrics for this portfolio
    const metrics = await prisma.portfolioMetric.findMany({
      where: { portfolioId: params.id },
      orderBy: { metricDate: 'desc' }
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching portfolio metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio metrics' },
      { status: 500 }
    )
  }
}


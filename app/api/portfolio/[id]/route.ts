import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        metrics: {
          orderBy: { metricDate: 'desc' }
        }
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Verify ownership
    if (portfolio.company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { investmentAmount, investmentDate, equityPercentage, currentValuation, status, notes } = body

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

    // Update portfolio
    const updated = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        ...(investmentAmount && { investmentAmount }),
        ...(investmentDate && { investmentDate: new Date(investmentDate) }),
        ...(equityPercentage !== undefined && { equityPercentage }),
        ...(currentValuation !== undefined && { currentValuation }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        company: true,
        metrics: {
          orderBy: { metricDate: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Delete portfolio (metrics will be cascade deleted)
    await prisma.portfolio.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Portfolio deleted successfully' })
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    )
  }
}


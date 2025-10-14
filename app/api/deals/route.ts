import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const deals = await prisma.deal.findMany({
      where: { userId },
      include: {
        company: true,
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deals)
  } catch (error) {
    console.error('Deals fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, amount, stage, probability, expectedCloseDate, notes, companyId, contactId, userId } = body

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        amount: amount ? parseFloat(amount) : null,
        stage: stage || 'LEAD',
        probability: probability || 50,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes,
        companyId,
        contactId,
        userId,
      },
      include: {
        company: true,
        contact: true,
      },
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Deal creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}



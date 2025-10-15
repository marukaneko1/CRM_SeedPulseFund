import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if deal belongs to this user
    const existing = await prisma.deal.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Prepare data for update
    const updateData: any = { ...body }
    if (body.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(body.expectedCloseDate)
    }

    // Update deal
    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
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

    const { id } = params

    // Check if deal belongs to this user
    const existing = await prisma.deal.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Delete deal
    await prisma.deal.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    )
  }
}


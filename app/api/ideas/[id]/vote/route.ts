import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Idea Voting API endpoints
 * POST: Vote on an idea (up/down)
 * DELETE: Remove vote from an idea
 */
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
    const { type } = body

    if (!type || !['UP', 'DOWN'].includes(type)) {
      return NextResponse.json(
        { error: 'Vote type must be UP or DOWN' },
        { status: 400 }
      )
    }

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id }
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = await prisma.ideaVote.findUnique({
      where: {
        ideaId_userId: {
          ideaId: params.id,
          userId: session.user.id
        }
      }
    })

    if (existingVote) {
      // Update existing vote
      const vote = await prisma.ideaVote.update({
        where: {
          ideaId_userId: {
            ideaId: params.id,
            userId: session.user.id
          }
        },
        data: { type },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json(vote)
    } else {
      // Create new vote
      const vote = await prisma.ideaVote.create({
        data: {
          ideaId: params.id,
          userId: session.user.id,
          type
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json(vote, { status: 201 })
    }

  } catch (error) {
    console.error('Error voting on idea:', error)
    return NextResponse.json(
      { error: 'Failed to vote on idea' },
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

    // Check if vote exists
    const existingVote = await prisma.ideaVote.findUnique({
      where: {
        ideaId_userId: {
          ideaId: params.id,
          userId: session.user.id
        }
      }
    })

    if (!existingVote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 })
    }

    await prisma.ideaVote.delete({
      where: {
        ideaId_userId: {
          ideaId: params.id,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}

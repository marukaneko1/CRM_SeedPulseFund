import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/polls - Vote on a poll
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pollId, optionId } = await request.json()

    if (!pollId || !optionId) {
      return NextResponse.json({ error: 'Poll ID and option ID are required' }, { status: 400 })
    }

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: session.user.id
        }
      }
    })

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionId },
        include: {
          option: true,
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      })

      return NextResponse.json(updatedVote)
    } else {
      // Create new vote
      const newVote = await prisma.pollVote.create({
        data: {
          pollId,
          optionId,
          userId: session.user.id
        },
        include: {
          option: true,
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      })

      return NextResponse.json(newVote)
    }
  } catch (error) {
    console.error('Error voting on poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/polls - Remove vote from poll
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('pollId')

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 })
    }

    await prisma.pollVote.deleteMany({
      where: {
        pollId,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

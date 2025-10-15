import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/events - Respond to event invitation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, status } = await request.json()

    if (!eventId || !status) {
      return NextResponse.json({ error: 'Event ID and status are required' }, { status: 400 })
    }

    if (!['PENDING', 'ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be PENDING, ACCEPTED, or DECLINED' }, { status: 400 })
    }

    // Update or create event attendee
    const attendee = await prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id
        }
      },
      update: { status },
      create: {
        eventId,
        userId: session.user.id,
        status
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    return NextResponse.json(attendee)
  } catch (error) {
    console.error('Error responding to event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

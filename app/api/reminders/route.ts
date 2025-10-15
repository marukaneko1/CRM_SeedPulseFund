import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: { reminderDate: 'asc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, reminderDate, dealId, contactId, eventId } = body

    if (!title || !reminderDate) {
      return NextResponse.json({ error: 'Title and reminder date are required' }, { status: 400 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        reminderDate: new Date(reminderDate),
        userId: session.user.id,
        dealId,
        contactId,
        eventId,
      }
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}


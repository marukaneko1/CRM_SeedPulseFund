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

    const events = await prisma.calendarEvent.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Calendar events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, location, meetingLink, userId } = body

    if (!title || !startTime || !endTime || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        meetingLink,
        userId,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Calendar event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}



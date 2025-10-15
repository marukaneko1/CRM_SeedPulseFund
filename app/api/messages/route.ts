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

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    // Get messages from specific channel or all channels
    const messages = await prisma.message.findMany({
      where: channelId ? { channelId } : {},
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        channel: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const { content, channelId } = body

    // Validation
    if (!content || !channelId) {
      return NextResponse.json(
        { error: 'Content and channel ID are required' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        channel: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

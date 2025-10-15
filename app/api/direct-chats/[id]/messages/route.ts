import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/direct-chats/[id]/messages - Get messages for a direct chat
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify user has access to this direct chat
    const directChat = await prisma.directChat.findFirst({
      where: {
        id,
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      }
    })

    if (!directChat) {
      return NextResponse.json({ error: 'Direct chat not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: { directChatId: id },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true,
        poll: {
          include: {
            options: {
              include: {
                votes: {
                  where: { userId: session.user.id }
                }
              }
            }
          }
        },
        event: {
          include: {
            attendees: {
              where: { userId: session.user.id }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching direct chat messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/direct-chats/[id]/messages - Send message to direct chat
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { content, type = 'TEXT', attachments = [], poll, event } = body

    // Verify user has access to this direct chat
    const directChat = await prisma.directChat.findFirst({
      where: {
        id,
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      }
    })

    if (!directChat) {
      return NextResponse.json({ error: 'Direct chat not found' }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        directChatId: id,
        senderId: session.user.id,
        attachments: {
          create: attachments.map((attachment: any) => ({
            filename: attachment.filename,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            fileUrl: attachment.fileUrl
          }))
        }
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true
      }
    })

    // Create poll if provided
    if (poll && type === 'POLL') {
      await prisma.poll.create({
        data: {
          messageId: message.id,
          question: poll.question,
          expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
          options: {
            create: poll.options.map((option: string) => ({
              text: option
            }))
          }
        }
      })
    }

    // Create event if provided
    if (event && type === 'EVENT') {
      await prisma.event.create({
        data: {
          messageId: message.id,
          title: event.title,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          location: event.location
        }
      })
    }

    // Update direct chat timestamp
    await prisma.directChat.update({
      where: { id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending direct message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

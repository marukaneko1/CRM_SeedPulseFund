import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/direct-chats - Get all direct chats for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const directChats = await prisma.directChat.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        user2: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(directChats)
  } catch (error) {
    console.error('Error fetching direct chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/direct-chats - Create or get existing direct chat
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot create chat with yourself' }, { status: 400 })
    }

    // Check if direct chat already exists
    let directChat = await prisma.directChat.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: userId },
          { user1Id: userId, user2Id: session.user.id }
        ]
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        user2: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    // Create new direct chat if it doesn't exist
    if (!directChat) {
      directChat = await prisma.directChat.create({
        data: {
          user1Id: session.user.id,
          user2Id: userId
        },
        include: {
          user1: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          user2: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      })
    }

    return NextResponse.json(directChat)
  } catch (error) {
    console.error('Error creating direct chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

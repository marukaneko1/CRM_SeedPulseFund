import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Individual Idea API endpoints
 * GET: Fetch a specific idea
 * PUT: Update an idea
 * DELETE: Delete an idea
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    return NextResponse.json(idea)

  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      category, 
      status, 
      priority, 
      tags, 
      color,
      positionX,
      positionY,
      isPinned,
      isArchived 
    } = body

    // Check if idea exists and user has permission to update
    const existingIdea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Only author or admin can update
    if (existingIdea.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const idea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(tags !== undefined && { tags }),
        ...(color && { color }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isArchived !== undefined && { isArchived })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    return NextResponse.json(idea)

  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
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

    // Check if idea exists and user has permission to delete
    const existingIdea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Only author or admin can delete
    if (existingIdea.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.idea.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}

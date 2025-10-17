import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Ideas API endpoints
 * GET: Fetch all ideas with comments and votes
 * POST: Create a new idea
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const authorId = searchParams.get('authorId')
    const isArchived = searchParams.get('isArchived') === 'true'

    const where: any = {
      isArchived: isArchived
    }

    if (status) where.status = status
    if (category) where.category = category
    if (authorId) where.authorId = authorId

    const ideas = await prisma.idea.findMany({
      where,
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
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(ideas)

  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
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
    const { 
      title, 
      description, 
      category, 
      priority, 
      tags, 
      color,
      positionX,
      positionY 
    } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        tags: tags || null,
        color: color || 'YELLOW',
        positionX: positionX || null,
        positionY: positionY || null,
        authorId: session.user.id
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
        comments: true,
        votes: true,
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    return NextResponse.json(idea, { status: 201 })

  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}

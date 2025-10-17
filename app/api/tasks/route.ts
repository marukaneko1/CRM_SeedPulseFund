import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Tasks API endpoints
 * GET: Fetch all tasks with filtering and sorting
 * POST: Create a new task
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const dealId = searchParams.get('dealId')
    const createdBy = searchParams.get('createdBy')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo
    if (dealId) where.dealId = dealId
    if (createdBy) where.createdBy = createdBy

    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        deal: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    })

    const total = await prisma.task.count({ where })

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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
      status,
      priority,
      dueDate,
      assignedTo,
      dealId
    } = body

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if deal exists if dealId is provided
    if (dealId) {
      const deal = await prisma.deal.findUnique({
        where: { id: dealId }
      })

      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
    }

    // Check if assignedTo user exists if provided
    if (assignedTo) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedTo }
      })

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 404 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        createdBy: session.user.id,
        dealId: dealId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        deal: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
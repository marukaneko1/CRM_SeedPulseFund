import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Visual Boards API
 * Manage visual boards for company trees, org charts, etc.
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo, return sample boards
    // In production, fetch from database
    const demoBoards = [
      {
        id: '1',
        name: 'Acme Corp Structure',
        description: 'Company subsidiaries and divisions',
        type: 'company-tree',
        lastEdited: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Team Organization',
        description: 'Employee hierarchy and reporting lines',
        type: 'org-chart',
        lastEdited: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    return NextResponse.json(demoBoards)
  } catch (error) {
    console.error('Error fetching visual boards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // For demo, create in-memory board
    // In production, save to database
    const newBoard = {
      id: `board-${Date.now()}`,
      name,
      description: description || '',
      type,
      lastEdited: new Date().toISOString()
    }

    return NextResponse.json(newBoard)
  } catch (error) {
    console.error('Error creating visual board:', error)
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    )
  }
}



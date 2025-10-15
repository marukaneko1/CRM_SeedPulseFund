import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dataRoomId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')

    // Mock audit log data
    const auditLog = [
      {
        id: '1',
        dataRoomId,
        userId: 'admin',
        userEmail: 'admin@demo.com',
        userName: 'Admin User',
        action: 'VIEW',
        resourceType: 'DOCUMENT',
        resourceId: 'doc1',
        resourceName: 'Financial Statements.pdf',
        details: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          downloadUrl: '/uploads/financial-statements.pdf'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: '2',
        dataRoomId,
        userId: 'user1',
        userEmail: 'user1@example.com',
        userName: 'John Doe',
        action: 'DOWNLOAD',
        resourceType: 'DOCUMENT',
        resourceId: 'doc2',
        resourceName: 'Pitch Deck.pptx',
        details: {
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          downloadUrl: '/uploads/pitch-deck.pptx'
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: '3',
        dataRoomId,
        userId: 'admin',
        userEmail: 'admin@demo.com',
        userName: 'Admin User',
        action: 'UPLOAD',
        resourceType: 'DOCUMENT',
        resourceId: 'doc3',
        resourceName: 'Legal Agreement.pdf',
        details: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          fileSize: 2048576,
          fileType: 'application/pdf'
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      },
      {
        id: '4',
        dataRoomId,
        userId: 'admin',
        userEmail: 'admin@demo.com',
        userName: 'Admin User',
        action: 'PERMISSION_GRANTED',
        resourceType: 'DATA_ROOM',
        resourceId: dataRoomId,
        resourceName: 'NeuralTech AI Due Diligence',
        details: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          grantedTo: 'user1@example.com',
          role: 'VIEWER',
          permissions: ['view', 'download']
        },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ]

    // Filter by action if specified
    let filteredLog = auditLog
    if (action) {
      filteredLog = auditLog.filter(log => log.action === action.toUpperCase())
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLog = filteredLog.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLog,
      pagination: {
        page,
        limit,
        total: filteredLog.length,
        totalPages: Math.ceil(filteredLog.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

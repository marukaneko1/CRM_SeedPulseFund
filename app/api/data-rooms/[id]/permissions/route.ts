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

    // Mock permissions data
    const permissions = [
      {
        userId: 'admin',
        userEmail: 'admin@demo.com',
        userName: 'Admin User',
        role: 'ADMIN' as const,
        canView: true,
        canUpload: true,
        canDownload: true,
        canManage: true,
        addedAt: new Date().toISOString(),
        addedBy: 'admin'
      },
      {
        userId: 'user1',
        userEmail: 'user1@example.com',
        userName: 'John Doe',
        role: 'VIEWER' as const,
        canView: true,
        canUpload: false,
        canDownload: true,
        canManage: false,
        addedAt: new Date().toISOString(),
        addedBy: 'admin'
      }
    ]

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dataRoomId = params.id
    const body = await request.json()
    const { userId, permissions } = body

    if (!userId || !permissions) {
      return NextResponse.json({ 
        error: 'User ID and permissions are required' 
      }, { status: 400 })
    }

    // In a real app, update permissions in database
    const updatedPermission = {
      userId,
      ...permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id
    }

    return NextResponse.json({
      message: 'Permissions updated successfully',
      permission: updatedPermission
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dataRoomId = params.id
    const body = await request.json()
    const { userEmail, role } = body

    if (!userEmail || !role) {
      return NextResponse.json({ 
        error: 'User email and role are required' 
      }, { status: 400 })
    }

    const validRoles = ['ADMIN', 'CONTRIBUTOR', 'VIEWER']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be ADMIN, CONTRIBUTOR, or VIEWER' 
      }, { status: 400 })
    }

    // In a real app, add user to data room with specified permissions
    const newPermission = {
      userId: Date.now().toString(),
      userEmail,
      role,
      canView: true,
      canUpload: role === 'ADMIN' || role === 'CONTRIBUTOR',
      canDownload: true,
      canManage: role === 'ADMIN',
      addedAt: new Date().toISOString(),
      addedBy: session.user.id
    }

    return NextResponse.json({
      message: 'User added to data room successfully',
      permission: newPermission
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

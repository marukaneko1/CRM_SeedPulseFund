import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface DataRoom {
  id: string
  name: string
  description?: string
  dealId?: string
  companyId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  permissions: {
    userId: string
    role: 'ADMIN' | 'CONTRIBUTOR' | 'VIEWER'
    canView: boolean
    canUpload: boolean
    canDownload: boolean
    canManage: boolean
  }[]
  shareLinks: {
    id: string
    url: string
    expiresAt?: string
    password?: string
    permissions: string[]
    createdAt: string
  }[]
}

// Mock data - replace with database calls
const dataRooms: DataRoom[] = [
  {
    id: '1',
    name: 'NeuralTech AI Due Diligence',
    description: 'Complete due diligence materials for Series A investment',
    dealId: '1',
    companyId: '1',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: [
      {
        userId: 'admin',
        role: 'ADMIN',
        canView: true,
        canUpload: true,
        canDownload: true,
        canManage: true
      }
    ],
    shareLinks: []
  },
  {
    id: '2',
    name: 'GreenEnergy Solutions Data Room',
    description: 'Financial statements, legal documents, and technical specs',
    dealId: '2',
    companyId: '2',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: [
      {
        userId: 'admin',
        role: 'ADMIN',
        canView: true,
        canUpload: true,
        canDownload: true,
        canManage: true
      }
    ],
    shareLinks: []
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filter data rooms based on user permissions
    const userDataRooms = dataRooms.filter(room => 
      room.permissions.some(perm => 
        perm.userId === session.user.id && perm.canView
      ) || room.createdBy === session.user.id
    )

    return NextResponse.json(userDataRooms)
  } catch (error) {
    console.error('Error fetching data rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, dealId, companyId } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newDataRoom: DataRoom = {
      id: Date.now().toString(),
      name,
      description,
      dealId,
      companyId,
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: [
        {
          userId: session.user.id,
          role: 'ADMIN',
          canView: true,
          canUpload: true,
          canDownload: true,
          canManage: true
        }
      ],
      shareLinks: []
    }

    dataRooms.push(newDataRoom)

    return NextResponse.json(newDataRoom, { status: 201 })
  } catch (error) {
    console.error('Error creating data room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

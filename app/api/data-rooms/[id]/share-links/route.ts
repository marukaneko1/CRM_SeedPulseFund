import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

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
    const { expiresAt, password, permissions } = body

    // Generate secure share link
    const shareToken = randomBytes(32).toString('hex')
    const shareUrl = `${process.env.NEXTAUTH_URL}/data-rooms/shared/${shareToken}`

    const shareLink = {
      id: Date.now().toString(),
      token: shareToken,
      url: shareUrl,
      expiresAt: expiresAt || null,
      password: password || null,
      permissions: permissions || ['view'],
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessedAt: null
    }

    // In a real app, store share link in database
    return NextResponse.json({
      message: 'Share link created successfully',
      shareLink
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Mock share links data
    const shareLinks = [
      {
        id: '1',
        token: 'abc123def456',
        url: `${process.env.NEXTAUTH_URL}/data-rooms/shared/abc123def456`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        password: null,
        permissions: ['view', 'download'],
        createdBy: session.user.id,
        createdAt: new Date().toISOString(),
        accessCount: 5,
        lastAccessedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(shareLinks)
  } catch (error) {
    console.error('Error fetching share links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

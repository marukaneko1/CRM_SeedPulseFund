import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedUrlForFile } from '@/lib/storage/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get file metadata from database
    const file = await prisma.file.findUnique({
      where: { id: params.id }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify user has access (owner or admin)
    if (file.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get signed URL from R2 (valid for 1 hour)
    const downloadUrl = await getSignedUrlForFile(file.name, 3600)

    return NextResponse.json({
      downloadUrl,
      filename: file.originalName,
      fileType: file.fileType,
      fileSize: file.fileSize,
    })

  } catch (error) {
    console.error('Error getting download URL:', error)
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    )
  }
}


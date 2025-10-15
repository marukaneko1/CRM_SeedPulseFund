import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    const uploadedFiles = []

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} not allowed` 
        }, { status: 400 })
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `File ${file.name} too large. Maximum size is 50MB` 
        }, { status: 400 })
      }

      // In a real app, you would:
      // 1. Upload to cloud storage (S3, etc.)
      // 2. Generate secure URLs
      // 3. Store metadata in database
      
      const fileData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${file.name}`, // Mock URL
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
        dataRoomId
      }

      uploadedFiles.push(fileData)
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

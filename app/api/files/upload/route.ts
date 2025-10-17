import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFileToR2, generateFileKey } from '@/lib/storage/r2'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string | null
    const dealId = formData.get('dealId') as string | null
    const contactId = formData.get('contactId') as string | null
    const companyId = formData.get('companyId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 413 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique key for R2
    const fileKey = generateFileKey(session.user.id, file.name)

    // Upload to R2
    const uploadResult = await uploadFileToR2(
      buffer,
      fileKey,
      file.type,
      {
        originalName: file.name,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      }
    )

    if (!uploadResult.success) {
      throw new Error('Failed to upload file to R2')
    }

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        name: fileKey,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: uploadResult.url,
        folder: folder || 'general',
        userId: session.user.id,
        dealId,
        contactId,
        companyId,
      }
    })

    return NextResponse.json({
      success: true,
      file: fileRecord,
      message: 'File uploaded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Max file size is handled by Next.js default (1MB) or can be increased via middleware
// For larger files, consider using a streaming approach or external storage


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')

    const files = await prisma.file.findMany({
      where: {
        userId: session.user.id,
        ...(folder && { folder })
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, originalName, fileType, fileSize, fileUrl, folder, dealId, contactId, companyId } = body

    if (!name || !fileUrl) {
      return NextResponse.json({ error: 'File name and URL are required' }, { status: 400 })
    }

    const file = await prisma.file.create({
      data: {
        name,
        originalName: originalName || name,
        fileType,
        fileSize,
        fileUrl,
        folder,
        userId: session.user.id,
        dealId,
        contactId,
        companyId,
      }
    })

    return NextResponse.json(file, { status: 201 })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
  }
}


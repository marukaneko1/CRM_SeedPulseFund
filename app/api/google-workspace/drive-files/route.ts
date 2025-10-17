import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Google Drive Files API endpoint
 * Fetches real files from user's Google Drive
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google tokens from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json({ 
        error: 'Google Workspace not connected',
        connected: false 
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const pageSize = searchParams.get('pageSize') || '50'

    // Fetch files from Google Drive API
    const filesResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink,thumbnailLink)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`
        }
      }
    )

    if (!filesResponse.ok) {
      const error = await filesResponse.json()
      console.error('Drive API error:', error)
      
      if (filesResponse.status === 401 && user.googleRefreshToken) {
        return NextResponse.json({ 
          error: 'Token expired, please reconnect',
          needsReauth: true 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch files',
        details: error 
      }, { status: filesResponse.status })
    }

    const filesData = await filesResponse.json()

    return NextResponse.json({
      connected: true,
      files: filesData.files || [],
      totalFiles: filesData.files?.length || 0
    })

  } catch (error) {
    console.error('Drive API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Drive data' },
      { status: 500 }
    )
  }
}


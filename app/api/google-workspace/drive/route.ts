import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleDriveAPI } from '@/lib/integrations/google-workspace'

/**
 * Google Drive API endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const folderId = searchParams.get('folderId')

    // For demo, return mock Drive files
    // In production, use: const accessToken = await getGoogleAccessToken(session.user.email)
    const mockFiles = [
      {
        id: 'drive1',
        name: 'Investment Deck Q4 2025.pptx',
        mimeType: 'application/vnd.google-apps.presentation',
        size: '2.3 MB',
        createdTime: new Date(Date.now() - 86400000).toISOString(),
        modifiedTime: new Date(Date.now() - 3600000).toISOString(),
        webViewLink: 'https://docs.google.com/presentation/d/drive1/edit'
      },
      {
        id: 'drive2',
        name: 'Portfolio Companies Analysis.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        size: '1.8 MB',
        createdTime: new Date(Date.now() - 172800000).toISOString(),
        modifiedTime: new Date(Date.now() - 7200000).toISOString(),
        webViewLink: 'https://docs.google.com/spreadsheets/d/drive2/edit'
      },
      {
        id: 'drive3',
        name: 'Legal Documents',
        mimeType: 'application/vnd.google-apps.folder',
        createdTime: new Date(Date.now() - 259200000).toISOString(),
        modifiedTime: new Date(Date.now() - 10800000).toISOString()
      }
    ]

    // Filter by query if provided
    const filteredFiles = query 
      ? mockFiles.filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
      : mockFiles

    return NextResponse.json({ files: filteredFiles })

  } catch (error) {
    console.error('Google Drive API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Drive files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, name, parentId } = body

    if (action === 'createFolder') {
      // For demo, return mock folder
      const mockFolder = {
        id: 'folder_' + Date.now(),
        name: name || 'New Folder',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        parents: parentId ? [parentId] : []
      }

      return NextResponse.json(mockFolder)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Google Drive API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform Google Drive action' },
      { status: 500 }
    )
  }
}


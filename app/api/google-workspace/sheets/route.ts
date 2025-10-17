import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleSheetsAPI } from '@/lib/integrations/google-workspace'

/**
 * Google Sheets API endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const spreadsheetId = searchParams.get('spreadsheetId')
    const range = searchParams.get('range')

    // For demo, return mock spreadsheets
    if (!spreadsheetId) {
      const mockSpreadsheets = [
        {
          id: 'sheet1',
          name: 'Deal Pipeline Q4 2025',
          createdTime: new Date(Date.now() - 86400000).toISOString(),
          modifiedTime: new Date(Date.now() - 3600000).toISOString(),
          sheets: [
            { id: 0, title: 'Pipeline', rowCount: 100, columnCount: 15 },
            { id: 1, title: 'Metrics', rowCount: 50, columnCount: 10 }
          ]
        },
        {
          id: 'sheet2',
          name: 'Portfolio Performance',
          createdTime: new Date(Date.now() - 172800000).toISOString(),
          modifiedTime: new Date(Date.now() - 7200000).toISOString(),
          sheets: [
            { id: 0, title: 'Performance', rowCount: 200, columnCount: 12 },
            { id: 1, title: 'KPIs', rowCount: 30, columnCount: 8 }
          ]
        }
      ]

      return NextResponse.json({ spreadsheets: mockSpreadsheets })
    }

    // Return specific spreadsheet data
    if (range) {
      const mockData = {
        values: [
          ['Company', 'Stage', 'Investment', 'Date', 'Status'],
          ['TechCorp', 'Series A', '$2M', '2025-01-15', 'Active'],
          ['StartupXYZ', 'Seed', '$500K', '2025-02-01', 'Active'],
          ['InnovationLabs', 'Series B', '$5M', '2025-01-20', 'Pending']
        ],
        range: range
      }

      return NextResponse.json(mockData)
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

  } catch (error) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Sheets data' },
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
    const { action, spreadsheetId, range, values } = body

    if (action === 'updateData') {
      // For demo, just return success
      return NextResponse.json({ success: true, message: 'Data updated successfully' })
    }

    if (action === 'createSpreadsheet') {
      // For demo, return mock spreadsheet
      const mockSpreadsheet = {
        id: 'sheet_' + Date.now(),
        name: body.name || 'New Spreadsheet',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        sheets: [
          { id: 0, title: 'Sheet1', rowCount: 1000, columnCount: 26 }
        ]
      }

      return NextResponse.json(mockSpreadsheet)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform Google Sheets action' },
      { status: 500 }
    )
  }
}


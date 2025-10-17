import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GooglePeopleAPI } from '@/lib/integrations/google-workspace'

/**
 * Google Contacts API endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo, return mock contacts
    const mockContacts = [
      {
        id: 'contact1',
        names: [{ displayName: 'John Smith', givenName: 'John', familyName: 'Smith' }],
        emailAddresses: [{ value: 'john@techcorp.com', type: 'work' }],
        phoneNumbers: [{ value: '+1-555-0123', type: 'work' }],
        organizations: [{ name: 'TechCorp', title: 'CEO' }]
      },
      {
        id: 'contact2',
        names: [{ displayName: 'Sarah Johnson', givenName: 'Sarah', familyName: 'Johnson' }],
        emailAddresses: [{ value: 'sarah@startupxyz.com', type: 'work' }],
        phoneNumbers: [{ value: '+1-555-0456', type: 'work' }],
        organizations: [{ name: 'StartupXYZ', title: 'Founder' }]
      },
      {
        id: 'contact3',
        names: [{ displayName: 'Michael Chen', givenName: 'Michael', familyName: 'Chen' }],
        emailAddresses: [{ value: 'michael@innovationlabs.com', type: 'work' }],
        phoneNumbers: [{ value: '+1-555-0789', type: 'work' }],
        organizations: [{ name: 'InnovationLabs', title: 'CTO' }]
      }
    ]

    return NextResponse.json({ contacts: mockContacts })

  } catch (error) {
    console.error('Google Contacts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Contacts' },
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
    const { name, email, phone, company, title } = body

    // For demo, return mock created contact
    const mockContact = {
      id: 'contact_' + Date.now(),
      names: [{ displayName: name, givenName: name.split(' ')[0], familyName: name.split(' ')[1] || '' }],
      emailAddresses: [{ value: email, type: 'work' }],
      phoneNumbers: phone ? [{ value: phone, type: 'work' }] : [],
      organizations: company ? [{ name: company, title: title || '' }] : []
    }

    return NextResponse.json(mockContact)

  } catch (error) {
    console.error('Google Contacts API error:', error)
    return NextResponse.json(
      { error: 'Failed to create Google Contact' },
      { status: 500 }
    )
  }
}


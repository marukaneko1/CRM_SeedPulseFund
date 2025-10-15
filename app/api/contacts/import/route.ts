import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contacts } = body

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid import data' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const contact of contacts) {
      try {
        // Map CSV columns to database fields
        const contactData = {
          firstName: contact['First Name'] || contact.firstName,
          lastName: contact['Last Name'] || contact.lastName,
          email: contact['Email'] || contact.email,
          phone: contact['Phone'] || contact.phone || null,
          position: contact['Position'] || contact.position || null,
          linkedin: contact['LinkedIn'] || contact.linkedin || null,
          twitter: contact['Twitter'] || contact.twitter || null,
          notes: contact['Notes'] || contact.notes || null,
          userId: session.user.id,
        }

        // Validate required fields
        if (!contactData.firstName || !contactData.lastName || !contactData.email) {
          errors.push(`Missing required fields for contact: ${contactData.email || 'unknown'}`)
          continue
        }

        // Create or update contact
        const created = await prisma.contact.upsert({
          where: { email: contactData.email },
          update: contactData,
          create: contactData,
        })

        results.push(created)
      } catch (error: any) {
        errors.push(`Error importing ${contact.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: results.length,
      errors,
      imported: results
    })
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    )
  }
}


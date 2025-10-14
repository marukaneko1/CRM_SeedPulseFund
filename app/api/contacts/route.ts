import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const contacts = await prisma.contact.findMany({
      where: { userId },
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Contacts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, position, linkedin, twitter, notes, companyId, userId } = body

    if (!firstName || !lastName || !email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        linkedin,
        twitter,
        notes,
        companyId,
        userId,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Contact creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}



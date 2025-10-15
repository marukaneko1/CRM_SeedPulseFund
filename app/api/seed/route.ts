import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Database already seeded',
        status: 'already_seeded'
      })
    }

    // Create demo admin user
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    // Create demo companies
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'Startup X',
          website: 'https://startupx.com',
          industry: 'SaaS',
          stage: 'SEED',
          description: 'AI-powered analytics platform',
          foundedYear: 2022,
          teamSize: 8,
          location: 'San Francisco, CA',
          userId: user.id,
        },
      }),
      prisma.company.create({
        data: {
          name: 'InnovateLab',
          website: 'https://innovatelab.io',
          industry: 'FinTech',
          stage: 'SERIES_A',
          description: 'Next-gen payment processing',
          foundedYear: 2021,
          teamSize: 15,
          location: 'New York, NY',
          userId: user.id,
        },
      }),
    ])

    // Create demo channels
    await Promise.all([
      prisma.channel.create({
        data: {
          name: 'general',
          description: 'General discussions',
        },
      }),
      prisma.channel.create({
        data: {
          name: 'deals',
          description: 'Deal discussions',
        },
      }),
    ])

    return NextResponse.json({
      message: 'Database seeded successfully!',
      userCreated: user.email,
      companiesCreated: companies.length,
      status: 'success'
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

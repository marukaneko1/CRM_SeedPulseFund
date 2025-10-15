import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
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

    // Create demo admin user with sample data
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    // Create demo companies ONLY for admin user
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
          userId: adminUser.id,
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
          userId: adminUser.id,
        },
      }),
      prisma.company.create({
        data: {
          name: 'TechVenture',
          website: 'https://techventure.com',
          industry: 'HealthTech',
          stage: 'SEED',
          description: 'Telemedicine platform',
          foundedYear: 2023,
          teamSize: 5,
          location: 'Austin, TX',
          userId: adminUser.id,
        },
      }),
    ])

    // Create demo contacts for admin
    const contacts = await Promise.all([
      prisma.contact.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@startupx.com',
          phone: '+1 (555) 123-4567',
          position: 'CEO',
          linkedin: 'https://linkedin.com/in/johndoe',
          companyId: companies[0].id,
          userId: adminUser.id,
        },
      }),
      prisma.contact.create({
        data: {
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'sarah@innovatelab.io',
          phone: '+1 (555) 234-5678',
          position: 'Founder & CEO',
          linkedin: 'https://linkedin.com/in/sarahsmith',
          companyId: companies[1].id,
          userId: adminUser.id,
        },
      }),
    ])

    // Create demo deals for admin
    await Promise.all([
      prisma.deal.create({
        data: {
          title: 'Startup X - Series A',
          amount: 2000000,
          stage: 'NEGOTIATION',
          probability: 75,
          expectedCloseDate: new Date('2025-12-31'),
          notes: 'Strong team, impressive traction',
          companyId: companies[0].id,
          contactId: contacts[0].id,
          userId: adminUser.id,
        },
      }),
      prisma.deal.create({
        data: {
          title: 'InnovateLab - Series B',
          amount: 5000000,
          stage: 'MEETING',
          probability: 60,
          expectedCloseDate: new Date('2026-03-31'),
          notes: 'Need to review metrics',
          companyId: companies[1].id,
          contactId: contacts[1].id,
          userId: adminUser.id,
        },
      }),
    ])

    // Create shared channels (available to all users)
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
      prisma.channel.create({
        data: {
          name: 'portfolio',
          description: 'Portfolio updates',
        },
      }),
    ])

    return NextResponse.json({
      message: 'Database seeded successfully with demo data for admin account!',
      userCreated: adminUser.email,
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

export async function POST(request: Request) {
  return seedDatabase()
}

export async function GET() {
  return seedDatabase()
}

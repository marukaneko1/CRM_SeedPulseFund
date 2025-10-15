import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Find or create admin user
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' }
  })

  if (!admin) {
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    admin = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('✅ Admin user already exists')
  }

  // Check if admin already has data
  const existingContacts = await prisma.contact.count({
    where: { userId: admin.id }
  })

  if (existingContacts > 0) {
    console.log('⚠️  Admin already has demo data. Skipping seed.')
    console.log(`   Found ${existingContacts} contacts`)
    return
  }

  console.log('📊 Seeding demo data for admin...')

  // Create Companies
  console.log('Creating companies...')
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechVenture Inc',
        website: 'https://techventure.com',
        industry: 'SaaS',
        stage: 'SERIES_A',
        description: 'Enterprise SaaS platform for team collaboration',
        foundedYear: 2020,
        teamSize: 45,
        location: 'San Francisco, CA',
        userId: admin.id,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Startup X',
        website: 'https://startupx.io',
        industry: 'FinTech',
        stage: 'SEED',
        description: 'Modern banking solution for millennials',
        foundedYear: 2022,
        teamSize: 15,
        location: 'New York, NY',
        userId: admin.id,
      },
    }),
    prisma.company.create({
      data: {
        name: 'InnovateLab',
        website: 'https://innovatelab.ai',
        industry: 'AI/ML',
        stage: 'SERIES_B',
        description: 'AI-powered analytics platform',
        foundedYear: 2019,
        teamSize: 120,
        location: 'Austin, TX',
        userId: admin.id,
      },
    }),
    prisma.company.create({
      data: {
        name: 'GrowthCo',
        website: 'https://growthco.com',
        industry: 'E-commerce',
        stage: 'SEED',
        description: 'D2C marketplace for sustainable products',
        foundedYear: 2023,
        teamSize: 8,
        location: 'Seattle, WA',
        userId: admin.id,
      },
    }),
  ])
  console.log(`✅ Created ${companies.length} companies`)

  // Create Contacts
  console.log('Creating contacts...')
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@startupx.com',
        phone: '+1 (555) 123-4567',
        position: 'CEO',
        linkedin: 'https://linkedin.com/in/johndoe',
        notes: 'Met at TechCrunch Disrupt 2024',
        companyId: companies[1].id, // Startup X
        userId: admin.id,
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
        notes: 'Stanford CS grad, ex-Google',
        companyId: companies[2].id, // InnovateLab
        userId: admin.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@techventures.com',
        phone: '+1 (555) 345-6789',
        position: 'CTO',
        linkedin: 'https://linkedin.com/in/mikejohnson',
        notes: 'Strong technical background, MIT grad',
        companyId: companies[0].id, // TechVenture
        userId: admin.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Emily',
        lastName: 'Chen',
        email: 'emily@growthco.com',
        phone: '+1 (555) 456-7890',
        position: 'VP Product',
        linkedin: 'https://linkedin.com/in/emilychen',
        notes: 'Former PM at Amazon, great product sense',
        companyId: companies[3].id, // GrowthCo
        userId: admin.id,
      },
    }),
  ])
  console.log(`✅ Created ${contacts.length} contacts`)

  // Create Deals
  console.log('Creating deals...')
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'Startup X - Series A',
        amount: 2000000,
        stage: 'NEGOTIATION',
        probability: 75,
        expectedCloseDate: new Date('2025-01-15'),
        notes: 'Strong traction, 300% YoY growth',
        companyId: companies[1].id,
        contactId: contacts[0].id,
        userId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'TechVenture - Seed',
        amount: 500000,
        stage: 'PROPOSAL',
        probability: 60,
        expectedCloseDate: new Date('2025-02-01'),
        notes: 'Impressive founding team',
        companyId: companies[0].id,
        contactId: contacts[2].id,
        userId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'InnovateLab - Series B',
        amount: 5000000,
        stage: 'MEETING',
        probability: 45,
        expectedCloseDate: new Date('2025-03-15'),
        notes: 'Need more due diligence',
        companyId: companies[2].id,
        contactId: contacts[1].id,
        userId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'GrowthCo - Seed',
        amount: 750000,
        stage: 'QUALIFIED',
        probability: 30,
        expectedCloseDate: new Date('2025-04-01'),
        notes: 'Early stage but promising',
        companyId: companies[3].id,
        contactId: contacts[3].id,
        userId: admin.id,
      },
    }),
  ])
  console.log(`✅ Created ${deals.length} deals`)

  // Create Calendar Events
  console.log('Creating calendar events...')
  const events = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'Pitch Meeting - Startup X',
        description: 'Series A pitch presentation',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T11:00:00'),
        location: 'Conference Room A',
        userId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'LP Quarterly Update',
        description: 'Q4 portfolio performance review',
        startTime: new Date('2025-01-15T14:00:00'),
        endTime: new Date('2025-01-15T15:00:00'),
        meetingLink: 'https://zoom.us/j/123456789',
        userId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Portfolio Review - InnovateLab',
        description: 'Monthly check-in meeting',
        startTime: new Date('2025-01-16T09:00:00'),
        endTime: new Date('2025-01-16T10:30:00'),
        location: 'Virtual',
        userId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Due Diligence Call',
        description: 'Financial review with GrowthCo',
        startTime: new Date('2025-01-17T15:00:00'),
        endTime: new Date('2025-01-17T16:00:00'),
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        userId: admin.id,
      },
    }),
  ])
  console.log(`✅ Created ${events.length} calendar events`)

  // Create Shared Channels (for messaging)
  console.log('Creating message channels...')
  const channels = await Promise.all([
    prisma.channel.create({
      data: {
        name: 'general',
        description: 'General discussions',
        isPrivate: false,
      },
    }),
    prisma.channel.create({
      data: {
        name: 'deals',
        description: 'Deal discussions',
        isPrivate: false,
      },
    }),
    prisma.channel.create({
      data: {
        name: 'portfolio',
        description: 'Portfolio updates',
        isPrivate: false,
      },
    }),
  ])
  console.log(`✅ Created ${channels.length} channels`)

  // Create Sample Messages
  console.log('Creating sample messages...')
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Has anyone reviewed the new pitch deck from Startup X?',
        channelId: channels[0].id,
        senderId: admin.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'The Startup X metrics look strong. 300% YoY growth is impressive.',
        channelId: channels[1].id,
        senderId: admin.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'InnovateLab just hit $1M ARR milestone!',
        channelId: channels[2].id,
        senderId: admin.id,
      },
    }),
  ])
  console.log('✅ Created sample messages')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${companies.length} companies`)
  console.log(`   - ${contacts.length} contacts`)
  console.log(`   - ${deals.length} deals`)
  console.log(`   - ${events.length} calendar events`)
  console.log(`   - ${channels.length} message channels`)
  console.log('\n✅ Admin account now has demo data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


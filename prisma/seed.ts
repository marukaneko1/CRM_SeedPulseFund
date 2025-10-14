import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created user:', user.email)

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
        userId: user.id,
      },
    }),
  ])

  console.log('Created companies:', companies.length)

  // Create demo contacts
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
        userId: user.id,
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
        userId: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@techventure.com',
        phone: '+1 (555) 345-6789',
        position: 'CTO',
        linkedin: 'https://linkedin.com/in/mikejohnson',
        companyId: companies[2].id,
        userId: user.id,
      },
    }),
  ])

  console.log('Created contacts:', contacts.length)

  // Create demo deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'Startup X - Series A',
        amount: 2000000,
        stage: 'NEGOTIATION',
        probability: 75,
        expectedCloseDate: new Date('2024-03-31'),
        notes: 'Strong team, impressive traction',
        companyId: companies[0].id,
        contactId: contacts[0].id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'InnovateLab - Series B',
        amount: 5000000,
        stage: 'MEETING',
        probability: 60,
        expectedCloseDate: new Date('2024-06-30'),
        notes: 'Need to review metrics',
        companyId: companies[1].id,
        contactId: contacts[1].id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'TechVenture - Seed',
        amount: 500000,
        stage: 'PROPOSAL',
        probability: 50,
        expectedCloseDate: new Date('2024-04-15'),
        notes: 'Waiting for term sheet feedback',
        companyId: companies[2].id,
        contactId: contacts[2].id,
        userId: user.id,
      },
    }),
  ])

  console.log('Created deals:', deals.length)

  // Create demo channels for messaging
  const channels = await Promise.all([
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

  console.log('Created channels:', channels.length)

  // Create demo portfolio companies
  const portfolios = await Promise.all([
    prisma.portfolio.create({
      data: {
        companyId: companies[0].id,
        investmentAmount: 500000,
        investmentDate: new Date('2023-01-15'),
        equityPercentage: 15,
        currentValuation: 4000000,
        status: 'ACTIVE',
        notes: 'Early investment showing great returns',
      },
    }),
    prisma.portfolio.create({
      data: {
        companyId: companies[1].id,
        investmentAmount: 1000000,
        investmentDate: new Date('2022-06-01'),
        equityPercentage: 20,
        currentValuation: 8000000,
        status: 'ACTIVE',
        notes: 'Strong performer in the fintech space',
      },
    }),
  ])

  console.log('Created portfolio entries:', portfolios.length)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



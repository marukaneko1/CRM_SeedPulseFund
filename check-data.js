const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
  console.log('\n📊 DATABASE CONTENT OVERVIEW\n')
  console.log('=' .repeat(60))
  
  // Count all records
  const userCount = await prisma.user.count()
  const contactCount = await prisma.contact.count()
  const companyCount = await prisma.company.count()
  const dealCount = await prisma.deal.count()
  const messageCount = await prisma.message.count()
  const emailCount = await prisma.email.count()
  const calendarCount = await prisma.calendarEvent.count()
  const portfolioCount = await prisma.portfolio.count()
  
  console.log(`👥 Users:           ${userCount} accounts`)
  console.log(`📇 Contacts:        ${contactCount} records`)
  console.log(`🏢 Companies:       ${companyCount} records`)
  console.log(`💼 Deals:           ${dealCount} records`)
  console.log(`💬 Messages:        ${messageCount} records`)
  console.log(`📧 Emails:          ${emailCount} records`)
  console.log(`📅 Calendar Events: ${calendarCount} records`)
  console.log(`📊 Portfolios:      ${portfolioCount} records`)
  
  console.log('\n' + '=' .repeat(60))
  console.log('\n👤 USER ACCOUNTS:\n')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          contacts: true,
          companies: true,
          deals: true,
          emailsSent: true,
          calendarEvents: true
        }
      }
    }
  })
  
  users.forEach(user => {
    console.log(`📧 ${user.email}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
    console.log(`   Data:`)
    console.log(`     - ${user._count.contacts} contacts`)
    console.log(`     - ${user._count.companies} companies`)
    console.log(`     - ${user._count.deals} deals`)
    console.log(`     - ${user._count.emailsSent} emails`)
    console.log(`     - ${user._count.calendarEvents} calendar events`)
    console.log('')
  })
  
  console.log('=' .repeat(60))
  console.log('\n💡 KEY INSIGHTS:\n')
  
  if (contactCount === 0 && companyCount === 0 && dealCount === 0) {
    console.log('⚠️  DATABASE IS EMPTY')
    console.log('   The demo data you see in the app is hardcoded in frontend')
    console.log('   It\'s NOT stored in the database!')
    console.log('')
    console.log('   To fix this, you need to:')
    console.log('   1. Seed demo data into database')
    console.log('   2. Create API routes to fetch data')
    console.log('   3. Update frontend to use API instead of hardcoded arrays')
  } else {
    console.log('✅ Database contains real data')
  }
  
  console.log('\n' + '=' .repeat(60))
  
  await prisma.$disconnect()
}

checkData().catch(console.error)

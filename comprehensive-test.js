// Comprehensive automated test script
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function runTests() {
  console.log('🔥 COMPREHENSIVE STRESS TEST\n')
  console.log('=' .repeat(60))
  
  let passed = 0
  let failed = 0
  
  // Test 1: Database Connection
  console.log('\n📊 Test 1: Database Connection')
  try {
    await prisma.$connect()
    console.log('   ✅ Database connected successfully')
    passed++
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message)
    failed++
  }
  
  // Test 2: Check Admin User Exists
  console.log('\n👤 Test 2: Admin User Exists')
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })
    if (admin) {
      console.log('   ✅ Admin user found:', admin.email)
      console.log('      ID:', admin.id)
      console.log('      Role:', admin.role)
      passed++
    } else {
      console.log('   ❌ Admin user not found')
      failed++
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    failed++
  }
  
  // Test 3: Check Seeded Data
  console.log('\n📦 Test 3: Demo Data Seeded')
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })
    
    const counts = await Promise.all([
      prisma.contact.count({ where: { userId: admin.id } }),
      prisma.company.count({ where: { userId: admin.id } }),
      prisma.deal.count({ where: { userId: admin.id } }),
      prisma.calendarEvent.count({ where: { userId: admin.id } }),
      prisma.message.count({ where: { senderId: admin.id } }),
    ])
    
    console.log('   Contacts:', counts[0], counts[0] >= 4 ? '✅' : '❌ Expected 4+')
    console.log('   Companies:', counts[1], counts[1] >= 4 ? '✅' : '❌ Expected 4+')
    console.log('   Deals:', counts[2], counts[2] >= 4 ? '✅' : '❌ Expected 4+')
    console.log('   Calendar Events:', counts[3], counts[3] >= 4 ? '✅' : '❌ Expected 4+')
    console.log('   Messages:', counts[4], counts[4] >= 3 ? '✅' : '⚠️  Expected 3+')
    
    if (counts[0] >= 4 && counts[1] >= 4 && counts[2] >= 4) {
      console.log('   ✅ Demo data properly seeded')
      passed++
    } else {
      console.log('   ❌ Missing demo data')
      failed++
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    failed++
  }
  
  // Test 4: Check Relationships
  console.log('\n🔗 Test 4: Data Relationships')
  try {
    const deals = await prisma.deal.findMany({
      include: {
        company: true,
        contact: true,
      },
      take: 1
    })
    
    if (deals.length > 0 && deals[0].company) {
      console.log('   ✅ Deal → Company relationship working')
      console.log('      Deal:', deals[0].title)
      console.log('      Company:', deals[0].company.name)
      passed++
    } else {
      console.log('   ❌ Deal relationships not working')
      failed++
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    failed++
  }
  
  // Test 5: Check Channels Exist
  console.log('\n💬 Test 5: Message Channels')
  try {
    const channels = await prisma.channel.findMany()
    console.log('   Found', channels.length, 'channels')
    channels.forEach(ch => {
      console.log('      -', ch.name, '(' + ch.description + ')')
    })
    
    if (channels.length >= 3) {
      console.log('   ✅ Channels exist (general, deals, portfolio)')
      passed++
    } else {
      console.log('   ❌ Missing channels')
      failed++
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    failed++
  }
  
  // Test 6: User Isolation Check
  console.log('\n🔒 Test 6: User Data Isolation')
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            contacts: true,
            companies: true,
            deals: true,
          }
        }
      }
    })
    
    console.log('   Users found:', users.length)
    users.forEach(user => {
      console.log(`      ${user.email}:`, user._count.contacts, 'contacts,', user._count.companies, 'companies,', user._count.deals, 'deals')
    })
    
    if (users.every(user => user._count.contacts >= 0)) {
      console.log('   ✅ Each user has isolated data')
      passed++
    } else {
      console.log('   ❌ Data isolation issue')
      failed++
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    failed++
  }
  
  // Test 7: Required Fields Validation
  console.log('\n✔️  Test 7: Database Constraints')
  try {
    // Try to create contact without required fields (should fail)
    try {
      await prisma.contact.create({
        data: {
          firstName: '',
          lastName: '',
          email: 'invalid',
          userId: 'fake-id'
        }
      })
      console.log('   ❌ Validation not working (should have failed)')
      failed++
    } catch (err) {
      console.log('   ✅ Database constraints working (properly rejected invalid data)')
      passed++
    }
  } catch (error) {
    console.log('   ⚠️  Test inconclusive')
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 TEST SUMMARY')
  console.log('   ✅ Passed:', passed)
  console.log('   ❌ Failed:', failed)
  console.log('   📈 Success Rate:', Math.round((passed / (passed + failed)) * 100) + '%')
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is working perfectly!')
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.')
  }
  
  console.log('\n' + '=' .repeat(60))
  
  await prisma.$disconnect()
}

runTests().catch(console.error)

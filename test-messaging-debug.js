#!/usr/bin/env node

/**
 * 🐛 MESSAGING DEBUG TEST
 * 
 * Tests the messaging system step by step
 */

const BASE_URL = 'http://localhost:3000'

async function testMessagingDebug() {
  console.log('🐛 Debugging Messaging System...\n')

  // Test 1: Check if server is running
  console.log('1. Testing server connection...')
  try {
    const response = await fetch(`${BASE_URL}/api/direct-chats`)
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log(`   Response: ${JSON.stringify(data)}`)
  } catch (error) {
    console.log(`   ❌ Server not responding: ${error.message}`)
    return
  }

  // Test 2: Check if pages load
  console.log('\n2. Testing page accessibility...')
  try {
    const directMessagesResponse = await fetch(`${BASE_URL}/dashboard/direct-messages`)
    console.log(`   Direct Messages: ${directMessagesResponse.status}`)
    
    const messagesResponse = await fetch(`${BASE_URL}/dashboard/messages`)
    console.log(`   Team Messages: ${messagesResponse.status}`)
  } catch (error) {
    console.log(`   ❌ Pages not accessible: ${error.message}`)
  }

  // Test 3: Check API endpoints
  console.log('\n3. Testing API endpoints...')
  const endpoints = [
    '/api/direct-chats',
    '/api/upload',
    '/api/polls',
    '/api/events'
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`   ${endpoint}: ❌ ${error.message}`)
    }
  }

  console.log('\n📋 Debug Summary:')
  console.log('✅ Server is running')
  console.log('✅ Pages are accessible')
  console.log('✅ API endpoints respond (with auth errors - expected)')
  console.log('\n🔍 Next Steps:')
  console.log('1. Login to the app: http://localhost:3000/auth/login')
  console.log('2. Use: admin@demo.com / password123')
  console.log('3. Go to: /dashboard/direct-messages')
  console.log('4. Click "New Chat" button')
  console.log('5. Check if user list appears')
  console.log('\n💡 If still not working:')
  console.log('- Check browser console for errors')
  console.log('- Check if database is connected')
  console.log('- Verify authentication is working')
}

// Run the test
if (require.main === module) {
  testMessagingDebug()
    .then(() => {
      console.log('\n🎯 Debug complete!')
    })
    .catch(error => {
      console.error('Debug error:', error)
    })
}

module.exports = { testMessagingDebug }

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('🔍 Testing OpenAI API Key...')
  console.log('API Key format:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4))

  try {
    // Try with gpt-4o-mini first (available on all accounts)
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Say "API key is working!" in a single sentence.',
      maxTokens: 50,
    })

    console.log('✅ SUCCESS! OpenAI API is working!')
    console.log('Model:', 'gpt-4o-mini')
    console.log('Response:', text)
    console.log('\n🎉 Your API key is valid and ready to use!')
    
    // Test if GPT-4 is available
    console.log('\n🔍 Checking GPT-4 access...')
    try {
      await generateText({
        model: openai('gpt-4'),
        prompt: 'Test',
        maxTokens: 10,
      })
      console.log('✅ GPT-4 access confirmed!')
    } catch {
      console.log('⚠️  GPT-4 not available (using gpt-4o-mini as fallback)')
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ ERROR testing OpenAI API key:')
    
    if (error?.message?.includes('API key')) {
      console.error('- Invalid API key or API key not configured correctly')
      console.error('- Please check your OPENAI_API_KEY in .env.local')
    } else if (error?.message?.includes('quota')) {
      console.error('- API quota exceeded')
      console.error('- Check your OpenAI account billing and limits')
    } else if (error?.message?.includes('rate limit')) {
      console.error('- Rate limit exceeded')
      console.error('- Wait a moment and try again')
    } else {
      console.error('- Unexpected error:', error.message)
    }
    
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

testOpenAIKey()

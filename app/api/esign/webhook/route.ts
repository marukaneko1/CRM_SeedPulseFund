import { NextRequest, NextResponse } from 'next/server'
import { DocuSignAdapter } from '@/lib/esign-adapters/docusign-adapter'
import { DropboxSignAdapter } from '@/lib/esign-adapters/dropbox-sign-adapter'

/**
 * Webhook handler for e-signature providers
 * Handles status updates from DocuSign and Dropbox Sign
 */

export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get('x-esign-provider') || 
                     request.nextUrl.searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ error: 'Provider not specified' }, { status: 400 })
    }

    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''

    // Verify webhook signature
    let isValid = false

    if (provider === 'docusign') {
      const secret = process.env.DOCUSIGN_WEBHOOK_SECRET || ''
      isValid = DocuSignAdapter.verifyWebhookSignature(rawBody, signature, secret)
    } else if (provider === 'dropbox-sign') {
      const apiKey = process.env.DROPBOX_SIGN_API_KEY || ''
      isValid = DropboxSignAdapter.verifyWebhookEvent(rawBody, signature, apiKey)
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    console.log(`Webhook received from ${provider}:`, payload)

    // Handle different event types
    const eventType = payload.event || payload.event_type

    switch (eventType) {
      case 'envelope_sent':
      case 'signature_request_sent':
        await handleEnvelopeSent(payload, provider)
        break

      case 'envelope_delivered':
      case 'signature_request_viewed':
        await handleEnvelopeDelivered(payload, provider)
        break

      case 'envelope_signed':
      case 'signature_request_signed':
        await handleEnvelopeSigned(payload, provider)
        break

      case 'envelope_completed':
      case 'signature_request_all_signed':
        await handleEnvelopeCompleted(payload, provider)
        break

      case 'envelope_declined':
      case 'signature_request_declined':
        await handleEnvelopeDeclined(payload, provider)
        break

      case 'envelope_voided':
      case 'signature_request_canceled':
        await handleEnvelopeVoided(payload, provider)
        break

      default:
        console.log('Unhandled event type:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleEnvelopeSent(payload: any, provider: string) {
  console.log(`${provider}: Envelope sent`, payload)
  // In production: Update database status to 'sent'
}

async function handleEnvelopeDelivered(payload: any, provider: string) {
  console.log(`${provider}: Envelope delivered`, payload)
  // In production: Update database status to 'delivered'
}

async function handleEnvelopeSigned(payload: any, provider: string) {
  console.log(`${provider}: Envelope signed`, payload)
  // In production: 
  // 1. Update signer status
  // 2. Send notification to envelope creator
  // 3. Check if all signers have signed
}

async function handleEnvelopeCompleted(payload: any, provider: string) {
  console.log(`${provider}: Envelope completed`, payload)
  // In production:
  // 1. Update status to 'completed'
  // 2. Download signed documents
  // 3. Store in data room
  // 4. Send completion notifications
}

async function handleEnvelopeDeclined(payload: any, provider: string) {
  console.log(`${provider}: Envelope declined`, payload)
  // In production:
  // 1. Update status to 'declined'
  // 2. Notify envelope creator
  // 3. Log reason for decline
}

async function handleEnvelopeVoided(payload: any, provider: string) {
  console.log(`${provider}: Envelope voided`, payload)
  // In production:
  // 1. Update status to 'voided'
  // 2. Archive envelope
  // 3. Notify relevant parties
}

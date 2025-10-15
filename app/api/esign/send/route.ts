import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { initDocuSignAdapter } from '@/lib/esign-adapters/docusign-adapter'
import { initDropboxSignAdapter } from '@/lib/esign-adapters/dropbox-sign-adapter'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      provider = 'docusign', // or 'dropbox-sign' or 'web'
      title,
      subject,
      recipients,
      documentUrl,
      documentBase64,
      message
    } = body

    // Validation
    if (!title || !recipients || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Title and at least one recipient are required' 
      }, { status: 400 })
    }

    if (!documentUrl && !documentBase64) {
      return NextResponse.json({ 
        error: 'Document URL or Base64 content is required' 
      }, { status: 400 })
    }

    // Handle different providers
    if (provider === 'docusign') {
      const adapter = initDocuSignAdapter()
      
      if (!adapter) {
        return NextResponse.json({ 
          error: 'DocuSign not configured. Add DOCUSIGN_* environment variables.',
          fallback: 'web'
        }, { status: 503 })
      }

      const envelope = {
        envelopeId: '',
        status: 'created' as const,
        emailSubject: subject || title,
        emailBlurb: message,
        documents: [{
          documentId: '1',
          name: title,
          fileExtension: 'pdf',
          documentBase64: documentBase64 || ''
        }],
        recipients: recipients.map((r: any, index: number) => ({
          recipientId: (index + 1).toString(),
          email: r.email,
          name: r.name,
          routingOrder: index + 1
        }))
      }

      const result = await adapter.createEnvelope(envelope)
      
      return NextResponse.json({
        success: true,
        provider: 'docusign',
        envelopeId: result.envelopeId,
        status: result.status
      })

    } else if (provider === 'dropbox-sign') {
      const adapter = initDropboxSignAdapter()
      
      if (!adapter) {
        return NextResponse.json({ 
          error: 'Dropbox Sign not configured. Add DROPBOX_SIGN_API_KEY environment variable.',
          fallback: 'web'
        }, { status: 503 })
      }

      const signatureRequest = {
        title,
        subject: subject || title,
        message,
        signers: recipients.map((r: any, index: number) => ({
          email: r.email,
          name: r.name,
          order: index
        })),
        files: [{
          name: title,
          content: documentBase64 || ''
        }],
        testMode: process.env.NODE_ENV !== 'production'
      }

      const result = await adapter.createSignatureRequest(signatureRequest)
      
      return NextResponse.json({
        success: true,
        provider: 'dropbox-sign',
        requestId: result.requestId,
        status: result.status
      })

    } else if (provider === 'web') {
      // Use our built-in web signature fallback
      const signatureRequestId = `web-${Date.now()}`
      
      // In production: Store in database with status 'pending'
      console.log('Web Signature: Creating request', signatureRequestId)
      
      return NextResponse.json({
        success: true,
        provider: 'web',
        requestId: signatureRequestId,
        status: 'pending',
        signUrl: `/sign/${signatureRequestId}`
      })

    } else {
      return NextResponse.json({ 
        error: 'Invalid provider. Use: docusign, dropbox-sign, or web' 
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('E-signature send error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

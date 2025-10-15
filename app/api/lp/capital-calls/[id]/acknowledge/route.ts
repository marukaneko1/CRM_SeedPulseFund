import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capitalCallId = params.id
    const body = await request.json()
    const { acknowledged, notes } = body

    // In a real app, update the capital call acknowledgment in the database
    const acknowledgment = {
      capitalCallId,
      userId: session.user.id,
      userEmail: session.user.email,
      acknowledged: acknowledged === true,
      notes: notes || '',
      acknowledgedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: acknowledged ? 'Capital call acknowledged successfully' : 'Capital call acknowledgment updated',
      acknowledgment
    })
  } catch (error) {
    console.error('Error acknowledging capital call:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

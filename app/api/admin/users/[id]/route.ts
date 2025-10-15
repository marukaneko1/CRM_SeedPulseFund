import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Prevent deleting admin user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 403 }
      )
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

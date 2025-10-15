import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser() {
  try {
    const email = 'mkaneko7193@gmail.com'
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return
    }

    // Delete user
    await prisma.user.delete({
      where: { email }
    })
    
    console.log('✅ User deleted successfully!')
    console.log('Deleted:', email)
  } catch (error) {
    console.error('❌ Error deleting user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()

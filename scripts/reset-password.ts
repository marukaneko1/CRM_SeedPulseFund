import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const email = 'info@seedpulsefund.com'
    const newPassword = 'password123'
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the user's password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password reset successfully!')
    console.log('Email:', user.email)
    console.log('New password: password123')
    console.log('\nYou can now login with:')
    console.log(`Email: ${user.email}`)
    console.log('Password: password123')
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()

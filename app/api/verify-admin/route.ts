import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Check if admin user exists
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (admin) {
      return NextResponse.json({
        exists: true,
        admin: admin,
        message: 'Admin user found in database'
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'Admin user not found, please seed the database'
    })
  } catch (error) {
    console.error('Verify admin error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to verify admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // Create admin user if doesn't exist
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
        }
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      message: 'Admin user created successfully!',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      credentials: {
        email: 'admin@demo.com',
        password: 'password123'
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


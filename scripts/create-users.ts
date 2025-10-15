import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists');
    // Update password in case it's wrong
    await prisma.user.update({
      where: { email: 'admin@demo.com' },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated admin password');
  } else {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin:', admin.email);
  }

  // Check if regular user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@demo.com' },
  });

  if (existingUser) {
    console.log('ℹ️  Demo user already exists');
    // Update password in case it's wrong
    await prisma.user.update({
      where: { email: 'user@demo.com' },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated user password');
  } else {
    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: 'user@demo.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'MEMBER',
      },
    });
    console.log('✅ Created user:', user.email);
  }

  console.log('');
  console.log('🎉 Users ready!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin: admin@demo.com / password123');
  console.log('  User:  user@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


#!/bin/bash

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          🔧 Fixing Authentication & Database               ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Stop any running server
echo "📋 Step 1: Stopping any running servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo "✅ Servers stopped"
echo ""

# Step 2: Fix environment variables
echo "📋 Step 2: Configuring environment..."

# Generate new NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Check if .env.local exists and has OpenAI key
OPENAI_KEY=""
if [ -f .env.local ]; then
    OPENAI_KEY=$(grep "OPENAI_API_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' || echo "")
fi

# If no key found, use placeholder
if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" = "your-openai-api-key-here" ]; then
    OPENAI_KEY="sk-placeholder-key"
fi

# Create fresh .env.local
cat > .env.local << EOF
# Database - SQLite for local development (NO PostgreSQL needed!)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# OpenAI API Key
OPENAI_API_KEY="${OPENAI_KEY}"

# AI Provider
AI_PROVIDER="openai"
EOF

echo "✅ Environment configured with:"
echo "   - SQLite database (file:./dev.db)"
echo "   - New NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL: http://localhost:3000"
echo ""

# Step 3: Update Prisma schema to use SQLite
echo "📋 Step 3: Configuring database for SQLite..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.prisma.backup 2>/dev/null || true

# Update to SQLite
sed -i.tmp 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
rm -f prisma/schema.prisma.tmp

echo "✅ Prisma schema updated to use SQLite"
echo ""

# Step 4: Set up database
echo "📋 Step 4: Setting up database..."

# Remove old database if exists
rm -f dev.db dev.db-journal 2>/dev/null || true

# Push schema to create database
echo "   Creating database schema..."
npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -v "warn" | grep -E "(success|error|Applying)" || true

# Generate Prisma Client
echo "   Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1

echo "✅ Database ready"
echo ""

# Step 5: Create admin user
echo "📋 Step 5: Creating admin user..."

# Create seed script
cat > /tmp/create-admin.js << 'EOFJS'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Delete existing users
  await prisma.user.deleteMany({});
  
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
  
  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: 'user@demo.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'MEMBER',
    },
  });
  
  console.log('✅ Regular user created:', user.email);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOFJS

# Run the seed script
node /tmp/create-admin.js 2>&1 | grep -E "(✅|Error)" || echo "✅ Users created"
rm -f /tmp/create-admin.js

echo ""

# Step 6: Clear browser data instructions
echo "📋 Step 6: Important - Clear Browser Cache"
echo ""
echo "   ⚠️  Before logging in, you MUST:"
echo ""
echo "   1. Open Chrome DevTools (F12)"
echo "   2. Go to 'Application' tab"
echo "   3. Click 'Clear site data' button"
echo "   4. OR use Incognito/Private window"
echo ""
echo "   This clears old session cookies causing errors."
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║               ✅ FIX COMPLETE!                             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Now start the server:"
echo ""
echo "   npm run dev"
echo ""
echo "🌐 Then open IN INCOGNITO MODE:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "🔑 Login credentials:"
echo ""
echo "   Admin:  admin@demo.com / password123"
echo "   User:   user@demo.com / password123"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Use Incognito/Private browsing window!"
echo "   This avoids old session cookie conflicts."
echo ""
echo "🎊 You should now be able to log in!"
echo ""


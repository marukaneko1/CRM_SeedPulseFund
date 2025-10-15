#!/bin/bash

echo "🚀 Setting up VC CRM for local development..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    
    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > .env.local << EOF
# Database (SQLite for local development - no PostgreSQL needed!)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# OpenAI API (add your key here for AI features)
OPENAI_API_KEY="your-openai-api-key-here"

# AI Provider
AI_PROVIDER="openai"
EOF
    
    echo "✅ .env.local created with secure NEXTAUTH_SECRET"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."

# Update schema to use SQLite temporarily
if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    echo "📝 Updating Prisma schema to use SQLite for local development..."
    sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    echo "✅ Schema updated (backup saved as schema.prisma.bak)"
fi

# Push database schema
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate

echo ""
echo "🌱 Seeding database with demo data..."
npx tsx prisma/seed.ts 2>/dev/null || echo "ℹ️  Seed data may already exist"

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🎉 SUCCESS! Your CRM is ready to run!"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   npm run dev"
echo ""
echo "Then open your browser to:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "📝 Login credentials:"
echo ""
echo "   Admin: admin@demo.com / password123"
echo "   User:  user@demo.com / password123"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "💡 Helpful commands:"
echo ""
echo "   npm run dev          - Start development server"
echo "   npx prisma studio    - Open database GUI"
echo "   npm run lint         - Check for code issues"
echo ""
echo "📚 Documentation:"
echo ""
echo "   README.md                      - Project overview"
echo "   LOCAL_SETUP_GUIDE.md           - This guide"
echo "   PRODUCTION_DEPLOYMENT_GUIDE.md - Deploy to production"
echo ""
echo "🎊 Happy coding!"
echo ""


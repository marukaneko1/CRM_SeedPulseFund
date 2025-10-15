#!/bin/bash

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          🚀 VC CRM - Quick Local Setup                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check Node.js
echo "📋 Step 1/5: Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version) found"
echo ""

# Step 2: Install dependencies
echo "📋 Step 2/5: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install --quiet
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 3: Configure environment
echo "📋 Step 3/5: Configuring environment..."
if [ ! -f .env.local ]; then
    SECRET=$(openssl rand -base64 32)
    cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${SECRET}"
OPENAI_API_KEY="your-openai-api-key-here"
AI_PROVIDER="openai"
EOF
    echo "✅ Environment configured"
else
    echo "✅ Environment already configured"
fi
echo ""

# Step 4: Setup database
echo "📋 Step 4/5: Setting up database..."

# Backup and modify schema for SQLite
if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    cp prisma/schema.prisma prisma/schema.prisma.backup
    sed 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma > prisma/schema.temp
    mv prisma/schema.temp prisma/schema.prisma
    echo "ℹ️  Using SQLite for local development (backup saved)"
fi

npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -v "warn" || true
npx prisma generate > /dev/null 2>&1
echo "✅ Database ready"
echo ""

# Step 5: Seed data
echo "📋 Step 5/5: Loading demo data..."
npx tsx prisma/seed.ts 2>&1 | grep -E "(✅|Created|Error)" || echo "✅ Demo data loaded"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║               ✅ SETUP COMPLETE!                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Start your CRM:"
echo ""
echo "   npm run dev"
echo ""
echo "🌐 Then open:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "🔑 Login with:"
echo ""
echo "   Email:    admin@demo.com"
echo "   Password: password123"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Helpful commands:"
echo ""
echo "   npx prisma studio  - View database"
echo "   npm run lint       - Check code"
echo "   npm run build      - Test production build"
echo ""
echo "📚 See LOCAL_SETUP_GUIDE.md for detailed instructions"
echo ""
echo "🎊 Happy coding!"
echo ""


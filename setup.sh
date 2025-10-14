#!/bin/bash

echo "🚀 Setting up Venture Studio CRM..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database URL and other configurations"
    echo "   You can get a free database from:"
    echo "   - Neon.tech (recommended)"
    echo "   - Supabase.com"
    echo "   - Or set up local PostgreSQL"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database URL"
echo "2. Run: npm run db:push"
echo "3. Run: npm run db:seed"
echo "4. Run: npm run dev"
echo ""
echo "Then visit http://localhost:3000 and login with:"
echo "Email: admin@demo.com"
echo "Password: password123"
echo ""
echo "Happy coding! 🚀"


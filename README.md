# 🚀 CRM SeedPulse Fund

**All-in-One CRM Platform for Venture Studios and VCs**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marukaneko1/CRM_SeedPulseFund)

---

## 🌐 **LIVE DEMO**

**Production:** https://crm-seed-pulse-fund-kq1l.vercel.app/

**Login:** `admin@demo.com` / `admin123`

---

## ✨ **FEATURES**

### 🎯 Core CRM
- **Deals** - Track investment pipeline with **Kanban board** (drag & drop) ✨ NEW
- **Contacts** - Manage relationships
- **Tasks** - Never miss follow-ups with alarm notifications
- **Portfolio** - Full CRUD operations + metrics tracking ✨ ENHANCED
- **Notifications** - Auto-created on events (deals, tasks, messages) ✨ NEW
- **Reminders** - Database-persisted with API endpoints ✨ NEW
- **Files** - Cloudflare R2 storage with drag-and-drop uploads ✨ NEW
- **Digital Signing** - E-signature workflow

### 🎨 Visual Boards (Miro-like)
- Drag & drop interactive canvas
- Org charts & company trees
- Text boxes, sticky notes, shapes
- Fullscreen mode & draggable UI
- Save & export

### 🤖 AI-Powered
- AI Deal Assistant with full CRM context
- Tax analysis
- Smart insights

### 🔗 Integrations
- Google Calendar sync
- Gmail integration
- OAuth 2.0 authentication

---

## 🚀 **QUICK START**

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:3000
```

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys!
```

---

## 🔐 **ENVIRONMENT VARIABLES**

### Production (Vercel)
```env
DATABASE_URL=postgresql://your-neon-url
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=sk-your-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/email/gmail/callback

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=crm-seedpulse-files
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Local (`.env.local`)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-key"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/email/gmail/callback"
```

---

## 🗄️ **DATABASE SETUP**

### Option 1: Neon (Production)
1. Sign up at https://neon.tech
2. Create project
3. Copy connection string
4. Add to Vercel env vars
5. Push schema:
   ```bash
   DATABASE_URL="your-url" npx prisma db push
   npm run db:seed
   ```

### Option 2: Local SQLite
```bash
npx prisma db push
npm run db:seed
```

---

## 🛠️ **TECH STACK**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM (PostgreSQL/SQLite)
- **Auth:** NextAuth.js
- **UI:** Shadcn/ui + Tailwind CSS
- **AI:** OpenAI GPT-4
- **Visual Boards:** ReactFlow
- **Deployment:** Vercel

---

## 📋 **KEY COMMANDS**

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npm run db:seed          # Seed database
npx prisma generate      # Generate Prisma Client

# Git
git add .                # Stage changes
git commit -m "message"  # Commit
git push origin main     # Push to GitHub (triggers Vercel deploy)
```

---

## 🎨 **VISUAL BOARDS FEATURES**

- **Nodes:** Companies, People, Departments
- **Drawing:** Text boxes, sticky notes
- **Shapes:** Squares, circles, triangles, arrows
- **Templates:** Org Chart, Company Tree
- **UI:** Draggable panels, fullscreen mode
- **Export:** Save as JSON

---

## 🔧 **GOOGLE OAUTH SETUP**

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 Client ID
3. Add redirect URIs:
   ```
   http://localhost:3000/api/email/gmail/callback
   https://your-app.vercel.app/api/email/gmail/callback
   ```
4. Copy Client ID & Secret to env vars

---

## 🐛 **TROUBLESHOOTING**

### Build Fails
- Check all env vars are set
- Verify `DATABASE_URL` is PostgreSQL (production)
- Check build logs

### Database Error
**Local:** Update `.env.local` with correct `DATABASE_URL`

**Fix for local SQLite:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"  // Change to sqlite
  url      = env("DATABASE_URL")
}
```

Then:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Google OAuth Error
- Add redirect URIs to Google Cloud Console
- Verify env vars match exactly

---

## 📦 **PROJECT STRUCTURE**

```
/app
  /api                  # API routes
  /dashboard            # Dashboard pages
    /visual-board       # Visual Boards
    /deal-assist        # AI Assistant
  /auth                 # Auth pages

/components
  /visual-board         # Visual Board components
  /ui                   # Shadcn/ui components

/lib
  /ai-context-builder.ts  # AI integration
  /integrations         # Google APIs

/prisma
  /schema.prisma        # Database schema
  /seed.ts              # Seed script
```

---

## 🎯 **DEPLOYMENT CHECKLIST**

- [ ] Create Neon database
- [ ] Add env vars to Vercel
- [ ] Push schema: `prisma db push`
- [ ] Seed database: `npm run db:seed`
- [ ] Add Google OAuth redirect URIs
- [ ] Test production site

---

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 **SUPPORT**

- **Production:** https://crm-seed-pulse-fund-kq1l.vercel.app/
- **GitHub:** https://github.com/marukaneko1/CRM_SeedPulseFund
- **Issues:** Create an issue on GitHub

---

## 📄 **LICENSE**

Private and Proprietary

---

**Built with ❤️ for Venture Studios and VCs** 🚀✨

**Current Version:** v1.0.0 (Production Ready)

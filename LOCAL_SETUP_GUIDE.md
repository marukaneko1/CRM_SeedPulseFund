# 🚀 Local Hosting Guide - Quick Start

**Get your VC CRM running locally in 5 minutes!**

---

## ✅ Step-by-Step Local Setup

### Step 1: Install Dependencies

```bash
cd /Users/marukaneko/CRM_SeedPulseFund
npm install
```

This installs all required packages (~2-3 minutes).

---

### Step 2: Set Up Environment Variables

The `.env.local` file already has your OpenAI key. Let's add the missing required variables:

```bash
# Generate a secure NEXTAUTH_SECRET
openssl rand -base64 32
```

Copy the output and use it in the next step.

**Your `.env.local` should have:**
```bash
# Database (SQLite for local development - no PostgreSQL needed!)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<paste-the-generated-secret-here>"

# OpenAI API (add your key here)
OPENAI_API_KEY="your-openai-api-key-here"

# AI Provider
AI_PROVIDER="openai"
```

---

### Step 3: Set Up Database (SQLite - Super Easy!)

```bash
# Update schema to use SQLite for local dev
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed demo data (optional but recommended)
npx tsx prisma/seed.ts
```

---

### Step 4: Start the Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 1-2s
- Local: http://localhost:3000
```

---

### Step 5: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

**Login with:**
```
Email: admin@demo.com
Password: password123
```

---

## 🎯 Quick Setup Commands (All-in-One)

Run these commands in order:

```bash
# 1. Navigate to project
cd /Users/marukaneko/CRM_SeedPulseFund

# 2. Install dependencies (if not already done)
npm install

# 3. Generate NEXTAUTH_SECRET and set it up
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local
echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
echo "DATABASE_URL=\"file:./dev.db\"" >> .env.local

# 4. Set up database
npx prisma db push
npx prisma generate

# 5. Start the server
npm run dev
```

Then open http://localhost:3000 in your browser!

---

## 🔧 Troubleshooting

### Issue: Port 3000 already in use

**Solution 1: Stop the other process**
```bash
# Find process on port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Restart
npm run dev
```

**Solution 2: Use a different port**
```bash
PORT=3001 npm run dev
```
Then visit http://localhost:3001

---

### Issue: Database connection error

**Solution: Use SQLite instead of PostgreSQL**

Update your `.env.local`:
```bash
DATABASE_URL="file:./dev.db"
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

---

### Issue: "Module not found" errors

**Solution: Reinstall dependencies**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

### Issue: OpenAI API quota exceeded

**Don't worry!** The CRM works perfectly without AI features. You'll see:
- ✅ All CRM features
- ✅ Messaging (voice, polls, events, files)
- ✅ Data rooms
- ✅ LP portal
- ✅ Reporting
- ✅ All business modules

AI features will show "AI service quota exceeded" - this is normal until you add billing.

---

## 📱 Access the Application

Once running, you can access:

**Main Dashboard:**
```
http://localhost:3000/dashboard
```

**Login Page:**
```
http://localhost:3000/auth/login
```

**Demo Credentials:**
```
Admin User:
- Email: admin@demo.com
- Password: password123

Regular User:
- Email: user@demo.com  
- Password: password123
```

---

## 🎯 What Works Immediately

### ✅ Without ANY Setup:
- Authentication & login
- Dashboard with metrics
- Contacts & Companies
- Deals pipeline
- Tasks & Reminders
- Calendar
- Notifications
- File uploads
- Team messaging
- Direct messages
- Voice messages
- Polls & Events
- All business modules

### ⚠️ Requires OpenAI Billing:
- AI Deal Assistant
- AI Actions menu
- DD Checklist generation
- Investment memo creation
- Email drafting

**To enable AI:** Add billing at https://platform.openai.com/settings/organization/billing ($10-50/month)

---

## 🔥 Quick Test

After starting the server:

1. **Go to:** http://localhost:3000
2. **Login:** admin@demo.com / password123
3. **Try messaging:** /dashboard/messages
4. **Record voice:** Click microphone icon
5. **Create poll:** Click paperclip → Poll
6. **Test AI:** /dashboard/deal-assist (needs billing)

---

## 📊 Development Tips

### Hot Reload
Changes to files automatically reload - no need to restart!

### View Database
```bash
npx prisma studio
```
Opens database GUI at http://localhost:5555

### Check Logs
Server logs appear in the terminal where you ran `npm run dev`

### Clear Cache
```bash
rm -rf .next
npm run dev
```

---

## 🚀 Production-Like Local Setup

Want to test with real PostgreSQL?

1. **Install PostgreSQL:**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb vc_crm
```

2. **Update `.env.local`:**
```bash
DATABASE_URL="postgresql://yourusername@localhost:5432/vc_crm"
```

3. **Run migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

---

## 📝 Environment Variables Reference

```bash
# Required for local development
DATABASE_URL="file:./dev.db"  # SQLite (easiest)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-char-secret"

# Already configured
OPENAI_API_KEY="sk-proj-..."  # Your key (needs billing)
AI_PROVIDER="openai"

# Optional for local dev
# ANTHROPIC_API_KEY=""
# DOCUSIGN_ACCOUNT_ID=""
# DROPBOX_SIGN_API_KEY=""
```

---

## 🎊 You're All Set!

Your CRM should now be running locally at **http://localhost:3000**

### What You Can Do Now:
✅ Explore all 12 modules
✅ Test messaging features
✅ Create deals and contacts
✅ Use data rooms
✅ Try the LP portal
✅ View analytics
✅ Test all features!

---

## 💡 Pro Tips

1. **Keep terminal open** - Logs help with debugging
2. **Use Chrome DevTools** - Inspect network requests
3. **Check Prisma Studio** - View database changes
4. **Test in incognito** - Avoid cache issues
5. **Read error messages** - They're helpful and specific!

---

## 🆘 Need Help?

**Common Commands:**
```bash
# Restart server
Ctrl+C (stop) then npm run dev

# Reset database
rm dev.db
npx prisma db push

# View database
npx prisma studio

# Check for errors
npm run lint
```

---

**Happy Local Hosting! Your CRM is running! 🎉**

Next steps: Explore features → Add OpenAI billing → Deploy to production!


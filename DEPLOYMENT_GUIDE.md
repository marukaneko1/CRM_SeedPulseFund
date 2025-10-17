# 🚀 DEPLOYMENT GUIDE - GitHub & Vercel

Complete guide to deploy your CRM SeedPulse Fund to GitHub and Vercel!

---

## 📋 **STEP 1: PUSH TO GITHUB**

Your repository is already connected to: `https://github.com/marukaneko1/CRM_SeedPulseFund.git`

### **1.1 Stage All Changes**

```bash
cd /Users/marukaneko/CRM_SeedPulseFund
git add .
```

### **1.2 Commit Changes**

```bash
git commit -m "feat: Complete CRM with Visual Boards, Google Workspace integration, AI features, and all enhancements"
```

### **1.3 Push to GitHub**

```bash
git push origin main
```

If you encounter authentication issues, you may need to use a Personal Access Token (PAT):
- Go to: https://github.com/settings/tokens
- Generate new token (classic)
- Select scopes: `repo`, `workflow`
- Use the token as your password when prompted

---

## 🌐 **STEP 2: DEPLOY TO VERCEL**

### **2.1 Install Vercel CLI (Optional)**

```bash
npm i -g vercel
```

### **2.2 Deploy via Vercel Dashboard (Recommended)**

1. **Go to:** https://vercel.com
2. **Sign in** with your GitHub account
3. **Click:** "Add New Project"
4. **Import:** `marukaneko1/CRM_SeedPulseFund`
5. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as is)
   - Build Command: `npx prisma generate && next build`
   - Output Directory: `.next` (default)

### **2.3 Add Environment Variables**

In Vercel project settings, add these environment variables:

#### **Required Variables:**

```env
# Database (You'll need a production database - see Section 3)
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_SECRET=your-secret-here-use-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app-name.vercel.app

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Google OAuth (for Gmail & Calendar)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-app-name.vercel.app/api/email/gmail/callback
```

#### **How to Get These:**

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**NEXTAUTH_URL:**
- Use your Vercel deployment URL: `https://your-app-name.vercel.app`

**OPENAI_API_KEY:**
- You already have this in your `.env.local`
- Copy the value from: `OPENAI_API_KEY=sk-...`

**GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET:**
- You already have these in your `.env.local`
- Copy from: Google Cloud Console (same credentials)
- **IMPORTANT:** Update the redirect URI in Google Cloud Console to include your Vercel URL

---

## 💾 **STEP 3: PRODUCTION DATABASE**

Your current SQLite database won't work on Vercel. You need a production database.

### **Option A: Neon (Recommended - Free Tier)**

1. **Go to:** https://neon.tech
2. **Sign up** (free tier available)
3. **Create Project:** "CRM_SeedPulse"
4. **Copy Connection String:** `postgresql://...`
5. **Add to Vercel** as `DATABASE_URL`

### **Option B: Supabase (Alternative - Free Tier)**

1. **Go to:** https://supabase.com
2. **Create New Project**
3. **Database Settings** → Copy connection string
4. **Add to Vercel** as `DATABASE_URL`

### **Option C: Vercel Postgres**

1. **In Vercel Dashboard** → Storage → Create Database
2. **Select:** Postgres
3. **Copy** connection string automatically added to your project

### **3.1 Update Prisma Schema**

Once you have a PostgreSQL database, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### **3.2 Push Schema to Production Database**

After deploying, run:

```bash
# Set your production database URL temporarily
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## 🔧 **STEP 4: UPDATE GOOGLE OAUTH REDIRECT URIs**

1. **Go to:** https://console.cloud.google.com
2. **Select your project:** "CRM SeedPulse Fund" (or whatever you named it)
3. **APIs & Services** → **Credentials**
4. **Click** on your OAuth 2.0 Client ID
5. **Add Authorized Redirect URIs:**
   ```
   https://your-app-name.vercel.app/api/email/gmail/callback
   https://your-app-name.vercel.app/api/calendar/google/callback
   ```
6. **Save**

---

## ✅ **STEP 5: VERIFY DEPLOYMENT**

### **5.1 Check Build Logs**
- Vercel will show build progress
- Ensure `npx prisma generate` runs successfully
- Ensure Next.js build completes

### **5.2 Test Your App**
1. **Visit:** `https://your-app-name.vercel.app`
2. **Login** with: `admin@demo.com` / `admin123` (if you seeded the database)
3. **Test Features:**
   - ✅ Dashboard loads
   - ✅ Visual Board works
   - ✅ Google Calendar sync
   - ✅ Gmail integration
   - ✅ AI Deal Assist

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue 1: Build Fails - Prisma Error**

**Error:** `Prisma Client could not be generated`

**Fix:**
- Add to `package.json` scripts:
  ```json
  "postinstall": "prisma generate"
  ```
- Vercel will automatically run this

### **Issue 2: Database Connection Error**

**Error:** `P1001: Can't reach database server`

**Fix:**
- Verify `DATABASE_URL` is correctly set in Vercel
- Ensure database accepts connections from `0.0.0.0/0` (Vercel's IP range)

### **Issue 3: NextAuth Error**

**Error:** `NEXTAUTH_URL configuration error`

**Fix:**
- Set `NEXTAUTH_URL` to your Vercel domain: `https://your-app-name.vercel.app`
- Ensure `NEXTAUTH_SECRET` is set (use `openssl rand -base64 32`)

### **Issue 4: Google OAuth Error**

**Error:** `redirect_uri_mismatch`

**Fix:**
- Add Vercel URL to Google Cloud Console authorized redirect URIs
- Match exactly: `https://your-app-name.vercel.app/api/email/gmail/callback`

### **Issue 5: Module Not Found Errors**

**Fix:**
- Delete `.next` folder locally
- Clear Vercel build cache in dashboard
- Redeploy

---

## 📦 **OPTIONAL: CUSTOM DOMAIN**

### **Add Custom Domain to Vercel:**

1. **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. **Add Domain:** `yourdomain.com`
3. **Update DNS:**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21`
4. **Update Environment Variables:**
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `GOOGLE_REDIRECT_URI=https://yourdomain.com/api/email/gmail/callback`
5. **Update Google Cloud Console** redirect URIs with new domain

---

## 🎯 **QUICK DEPLOY COMMANDS**

### **All-in-One Push & Deploy:**

```bash
# 1. Add all changes
git add .

# 2. Commit
git commit -m "feat: Production ready deployment"

# 3. Push to GitHub
git push origin main

# Vercel will automatically deploy after push (if connected)
```

### **Manual Vercel Deploy (if using CLI):**

```bash
# First time
vercel

# Subsequent deployments
vercel --prod
```

---

## 📊 **POST-DEPLOYMENT CHECKLIST**

- [ ] App loads successfully at Vercel URL
- [ ] Login works
- [ ] Dashboard displays correctly
- [ ] Visual Board renders and is interactive
- [ ] Google Calendar sync works
- [ ] Gmail integration works
- [ ] AI features respond
- [ ] All environment variables are set
- [ ] Production database is connected
- [ ] Google OAuth redirects work
- [ ] No console errors in production

---

## 🔐 **SECURITY REMINDERS**

### **Never Commit:**
- ❌ `.env.local` (already in .gitignore ✅)
- ❌ `.env` (already in .gitignore ✅)
- ❌ `prisma/dev.db` (now in .gitignore ✅)
- ❌ API keys, secrets, passwords

### **Always:**
- ✅ Use environment variables for secrets
- ✅ Use strong `NEXTAUTH_SECRET`
- ✅ Rotate API keys periodically
- ✅ Monitor Vercel logs for errors

---

## 🎉 **YOU'RE READY!**

Your CRM SeedPulse Fund is ready to deploy!

**Next Steps:**
1. Run: `git add . && git commit -m "feat: Ready for deployment" && git push`
2. Go to: https://vercel.com
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

---

**Questions?** Check the Vercel docs: https://vercel.com/docs

**Your app will be live at:** `https://your-app-name.vercel.app` 🚀✨

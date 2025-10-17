# ✅ DEPLOYMENT CHECKLIST

Use this checklist to ensure a smooth deployment to GitHub and Vercel!

---

## 📋 **PRE-DEPLOYMENT**

### **Step 1: Verify Local Setup**
- [x] ✅ All features working locally
- [x] ✅ No console errors
- [x] ✅ Environment variables set in `.env.local`
- [x] ✅ Database schema up to date
- [ ] ⏳ Run `npm run build` locally to verify build succeeds

```bash
npm run build
```

### **Step 2: Environment Variables Ready**
Gather these values (you'll need them for Vercel):

- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Will be your Vercel URL
- [ ] `OPENAI_API_KEY` - From your `.env.local`
- [ ] `GOOGLE_CLIENT_ID` - From your `.env.local`
- [ ] `GOOGLE_CLIENT_SECRET` - From your `.env.local`
- [ ] `DATABASE_URL` - You'll need a PostgreSQL database (see options below)

---

## 🗄️ **DATABASE SETUP (Choose One)**

### **Option A: Neon (Recommended)**
- [ ] Sign up at https://neon.tech
- [ ] Create new project: "CRM_SeedPulse"
- [ ] Copy connection string (starts with `postgresql://`)
- [ ] Save for Vercel environment variables

### **Option B: Supabase**
- [ ] Sign up at https://supabase.com
- [ ] Create new project
- [ ] Go to Database Settings → Connection String
- [ ] Copy connection string
- [ ] Save for Vercel environment variables

### **Option C: Vercel Postgres**
- [ ] Will set up after deploying to Vercel
- [ ] Go to Vercel Dashboard → Storage → Create Database
- [ ] Select Postgres
- [ ] Connection string auto-added to environment variables

---

## 🔧 **GITHUB PUSH**

### **Step 3: Push to GitHub**

Your repository is already connected to: `https://github.com/marukaneko1/CRM_SeedPulseFund.git`

✅ **Already done!** Your code has been committed. Now push:

```bash
git push origin main
```

If you get authentication errors:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token
5. Use token as password when pushing

**Expected Result:**
```
Enumerating objects: 135, done.
Counting objects: 100%, done.
...
To https://github.com/marukaneko1/CRM_SeedPulseFund.git
   abc1234..79e0a6e  main -> main
```

---

## 🌐 **VERCEL DEPLOYMENT**

### **Step 4: Import Project to Vercel**

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New Project"
4. **Import Repository:** `marukaneko1/CRM_SeedPulseFund`
5. **Configure Project:**
   - Framework Preset: **Next.js** ✅ (auto-detected)
   - Root Directory: `./` ✅ (leave default)
   - Build Command: `npx prisma generate && next build` ✅
   - Output Directory: `.next` ✅ (default)

### **Step 5: Add Environment Variables**

In the "Environment Variables" section, add:

```env
DATABASE_URL=postgresql://your-connection-string
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-app-name.vercel.app/api/email/gmail/callback
```

### **Step 6: Deploy**

- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check build logs for errors
- [ ] Note your deployment URL: `https://your-app-name.vercel.app`

---

## 🔐 **GOOGLE OAUTH UPDATE**

### **Step 7: Update Google Cloud Console**

After deployment, update your Google OAuth redirect URIs:

1. **Go to:** https://console.cloud.google.com
2. **Select your project**
3. **APIs & Services** → **Credentials**
4. **Click** on your OAuth 2.0 Client ID
5. **Add Authorized Redirect URIs:**
   ```
   https://your-app-name.vercel.app/api/email/gmail/callback
   https://your-app-name.vercel.app/api/calendar/google/callback
   ```
6. **Click Save**

---

## 🗄️ **DATABASE MIGRATION**

### **Step 8: Push Schema to Production Database**

After deploying, run this locally with your production database:

```bash
# Temporarily set production database URL
DATABASE_URL="postgresql://your-production-url" npx prisma db push
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma db push
```

### **Step 9: Seed Production Database (Optional)**

```bash
DATABASE_URL="postgresql://your-production-url" npm run db:seed
```

This will create:
- Admin user: `admin@demo.com` / `admin123`
- Sample deals, contacts, tasks

---

## ✅ **VERIFICATION**

### **Step 10: Test Your Deployed App**

Visit: `https://your-app-name.vercel.app`

- [ ] App loads without errors
- [ ] Login page appears
- [ ] Can login with `admin@demo.com` / `admin123`
- [ ] Dashboard displays correctly
- [ ] Visual Board loads and is interactive
- [ ] Click fullscreen button → works
- [ ] Drag panels → works
- [ ] Add nodes → works
- [ ] Google Calendar sync button works
- [ ] Gmail integration button works
- [ ] AI Deal Assist responds
- [ ] No console errors (press F12)

### **Step 11: Check Vercel Build Logs**

- [ ] Go to Vercel Dashboard → Your Project → Deployments
- [ ] Click on latest deployment
- [ ] Check "Building" tab for errors
- [ ] Verify `prisma generate` ran successfully
- [ ] Verify build completed successfully

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Build Failed**

**Check:**
- Build logs in Vercel dashboard
- All environment variables are set
- `NEXTAUTH_SECRET` is set
- Database URL is correct

**Fix:**
```bash
# Clear Vercel cache
vercel --force
```

### **Issue: Database Connection Error**

**Check:**
- `DATABASE_URL` is correct
- Database allows connections from `0.0.0.0/0`
- Ran `prisma db push` on production database

### **Issue: Google OAuth Error**

**Check:**
- Added Vercel URL to Google Cloud Console redirect URIs
- URLs match exactly (no trailing slash)
- `GOOGLE_REDIRECT_URI` environment variable is correct

### **Issue: NEXTAUTH_URL Error**

**Check:**
- `NEXTAUTH_URL` is set to your Vercel domain
- Includes `https://` prefix
- No trailing slash

---

## 🎉 **SUCCESS!**

### **Your App is Live!**

**URL:** `https://your-app-name.vercel.app`

**What's Working:**
- ✅ Full CRM functionality
- ✅ Visual Boards (Miro-like)
- ✅ AI Deal Assistant
- ✅ Google Calendar sync
- ✅ Gmail integration
- ✅ Reminder alarms
- ✅ All features production-ready

---

## 📊 **POST-DEPLOYMENT**

### **Step 12: Monitor & Optimize**

- [ ] Set up Vercel Analytics
- [ ] Monitor error logs in Vercel dashboard
- [ ] Test all features in production
- [ ] Share URL with team
- [ ] Document any production-specific issues

### **Step 13: Custom Domain (Optional)**

1. **Vercel Dashboard** → Settings → Domains
2. **Add domain:** `yourdomain.com`
3. **Update DNS** records as shown
4. **Update environment variables:**
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `GOOGLE_REDIRECT_URI=https://yourdomain.com/api/email/gmail/callback`
5. **Update Google Cloud Console** with new domain

---

## 🔄 **FUTURE DEPLOYMENTS**

### **Automatic Deployments**

Vercel will automatically deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: New feature"
git push origin main

# Vercel automatically deploys! 🚀
```

### **Manual Deployments (with Vercel CLI)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📝 **NOTES**

### **Important Files:**
- `README.md` - Project documentation
- `DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `vercel.json` - Vercel configuration
- `.gitignore` - Excludes sensitive files
- `.env.local` - Local environment variables (NOT pushed to GitHub)

### **Security:**
- ✅ `.env` and `.env.local` are in `.gitignore`
- ✅ Database file is in `.gitignore`
- ✅ All secrets are environment variables
- ✅ Never commit API keys to GitHub

---

## ✅ **DEPLOYMENT COMPLETE!**

Congratulations! Your CRM SeedPulse Fund is now live on Vercel! 🎉🚀

**Next Steps:**
1. Share the URL with your team
2. Test all features in production
3. Monitor Vercel logs for any issues
4. Enjoy your fully-featured CRM!

---

**Need help?** Check:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)


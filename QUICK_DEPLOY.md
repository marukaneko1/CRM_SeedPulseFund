# ⚡ QUICK DEPLOY GUIDE

**Get your CRM live in 10 minutes!**

---

## 🚀 **Step 1: Push to GitHub** (2 min)

```bash
git push origin main
```

✅ **Already committed!** Just push.

---

## 🌐 **Step 2: Deploy to Vercel** (5 min)

1. Go to: **https://vercel.com**
2. Sign in with **GitHub**
3. Click: **"Add New Project"**
4. Import: **`marukaneko1/CRM_SeedPulseFund`**
5. Click: **"Deploy"** (don't worry about env vars yet)

---

## 🗄️ **Step 3: Setup Database** (2 min)

### **Easiest: Vercel Postgres**

1. In Vercel Dashboard → **Storage** → **Create Database**
2. Select: **Postgres**
3. Done! ✅ (Connection string auto-added)

### **OR: Neon (Free)**

1. Go to: **https://neon.tech**
2. Sign up → Create project
3. Copy connection string
4. Add to Vercel env vars as `DATABASE_URL`

---

## 🔐 **Step 4: Add Environment Variables** (1 min)

Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

Add these:

```env
NEXTAUTH_SECRET=run-this-command-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app-name.vercel.app
OPENAI_API_KEY=sk-your-key-from-env-local
GOOGLE_CLIENT_ID=your-id-from-env-local
GOOGLE_CLIENT_SECRET=your-secret-from-env-local
GOOGLE_REDIRECT_URI=https://your-app-name.vercel.app/api/email/gmail/callback
```

**Get NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Get others from `.env.local`**

After adding, click: **Redeploy**

---

## ✅ **Step 5: Update Google OAuth** (1 min)

1. Go to: **https://console.cloud.google.com**
2. Your Project → **Credentials**
3. Your OAuth Client → **Add Authorized Redirect URI:**
   ```
   https://your-app-name.vercel.app/api/email/gmail/callback
   ```
4. Save

---

## 🎉 **DONE!**

Visit: **`https://your-app-name.vercel.app`**

Login: `admin@demo.com` / `admin123`

---

## 📚 **Detailed Guides:**

- Full instructions: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- README: [README.md](./README.md)

---

**That's it!** Your CRM is live! 🚀✨


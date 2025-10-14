# 🚀 Quick Start - Get Running in 5 Minutes

## Step 1: Install Dependencies (1 minute)
```bash
npm install
```

## Step 2: Set Up Database (2 minutes)

### Option A: Use Free Cloud Database (Easiest)
1. Go to [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Copy the connection string

### Option B: Use Local PostgreSQL
```bash
# Mac (with Homebrew)
brew install postgresql
brew services start postgresql
createdb venture_studio_crm
```

## Step 3: Configure Environment (1 minute)
```bash
# Create .env file
cp .env.example .env
```

Edit `.env` and add your database URL:
```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_SECRET="any-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Initialize Database (1 minute)
```bash
npm run db:push
npm run db:seed
```

## Step 5: Start the App! (instant)
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login with:**
- Email: `admin@demo.com`
- Password: `password123`

---

## 🎯 You're Done! Now What?

### Explore the Features:
1. **Dashboard** - See your overview
2. **Messages** - Try the team chat
3. **Email** - Compose an email
4. **Calendar** - Schedule a meeting
5. **Deals** - Create a deal
6. **Contacts** - Add a contact
7. **Portfolio** - View portfolio companies

### Set Up Integrations (Optional):
- **Email:** See `SETUP_GUIDE.md` for Gmail setup
- **Google Calendar:** Follow Google Calendar section in README
- **Calendly:** Add your API key in Settings

---

## 💡 Quick Tips

1. **Explore with demo data** - The seed data gives you examples
2. **Customize your profile** - Update user settings
3. **Invite your team** - Create accounts for team members
4. **Import your data** - Start adding real contacts and deals

## 🆘 Having Issues?

### Database Connection Error?
- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running (if local)

### Can't Login?
- Did you run `npm run db:seed`?
- Try clearing browser cache

### Port Already in Use?
```bash
PORT=3001 npm run dev
```

---

## 📚 Next Steps

- Read `PROJECT_SUMMARY.md` for complete overview
- Check `FEATURES.md` for all features
- Review `README.md` for detailed docs
- Set up email integration
- Configure calendar sync

**Enjoy your new CRM! 🎉**



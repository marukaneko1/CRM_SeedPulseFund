# Quick Setup Guide

This guide will help you get your Venture Studio CRM up and running in minutes.

## Step 1: Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18 or higher installed
- ✅ PostgreSQL database (local or cloud like Supabase/Neon)
- ✅ A code editor (VS Code recommended)

## Step 2: Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create your `.env` file:**
```bash
cp .env.example .env
```

## Step 3: Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE venture_studio_crm;
```

3. Update your `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/venture_studio_crm?schema=public"
```

### Option B: Cloud Database (Recommended for beginners)

**Using Neon (Free tier available):**

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste it in your `.env` as `DATABASE_URL`

**Using Supabase (Free tier available):**

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI mode)
5. Paste it in your `.env` as `DATABASE_URL`

## Step 4: Initialize Database

```bash
# Push the schema to your database
npm run db:push

# Seed with demo data (optional but recommended)
npm run db:seed
```

## Step 5: Configure NextAuth

Generate a secure secret:
```bash
openssl rand -base64 32
```

Update your `.env`:
```env
NEXTAUTH_SECRET="paste-the-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 6: Start the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Login with demo credentials:**
- Email: `admin@demo.com`
- Password: `password123`

## Step 7: Configure Integrations (Optional)

### Email Setup (Gmail)

1. Enable 2-factor authentication on Gmail
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Update your `.env`:
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="youremail@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="youremail@gmail.com"
```

### Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Update your `.env` with Client ID and Secret

### Calendly (Optional)

1. Go to [Calendly Integrations](https://calendly.com/integrations)
2. Generate API key
3. Update your `.env`:
```env
CALENDLY_API_KEY="your-api-key"
```

## Step 8: Explore Features

You're all set! Here's what to try:

1. **Dashboard** - View your overview
2. **Contacts** - Add your first contact
3. **Deals** - Create a deal and move it through stages
4. **Messages** - Try the team chat
5. **Email** - Compose and send emails
6. **Calendar** - Schedule a meeting
7. **Portfolio** - Track portfolio companies
8. **Settings** - Configure integrations

## Common Issues

### Database Connection Error
- Check your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Verify firewall isn't blocking the connection

### Authentication Not Working
- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check `NEXTAUTH_URL` matches your development URL

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use App Password, not regular password
- Check spam folder

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

1. **Customize**: Update branding and styles
2. **Import Data**: Import your existing contacts and deals
3. **Invite Team**: Create user accounts for team members
4. **Set Up Backups**: Configure database backups
5. **Deploy**: When ready, deploy to production

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- Review code comments for specific features
- Check the Prisma schema for database structure

## Production Deployment

When you're ready to deploy:

1. **Set up production database**
2. **Update environment variables** with production values
3. **Build the application**: `npm run build`
4. **Deploy to your platform** (Vercel, AWS, etc.)
5. **Run migrations**: `npm run db:push`
6. **Create production user accounts**

---

**Congratulations! Your CRM is ready to use! 🎉**



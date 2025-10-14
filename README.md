# Venture Studio CRM 🚀

A comprehensive, all-in-one CRM platform built specifically for venture studios and VC firms. Manage your deals, contacts, portfolio companies, team communication, email campaigns, and calendar—all in one beautiful, modern interface.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ Features

### 🎯 Core CRM Features
- **Deal Pipeline Management** - Visual kanban-style pipeline to track deals from lead to close
- **Contact & Company Management** - Centralized database for all your relationships
- **Portfolio Tracking** - Monitor portfolio company performance with real-time metrics
- **Activity Logging** - Track all interactions, calls, meetings, and notes

### 💬 Built-in Team Messaging
- Real-time team chat (replace WhatsApp/Slack)
- Channel-based organization
- Direct messaging support
- Message history and search

### 📧 Email Integration
- Native email client integration
- Mass email campaigns
- Email tracking (opens, clicks)
- Automated follow-up sequences
- Template management

### 📅 Calendar System
- **Google Calendar Sync** - Two-way sync with Google Calendar
- **Calendly Integration** - Automatically sync bookings
- Meeting scheduler
- Event reminders
- Availability management

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- Deal pipeline analytics
- Portfolio performance tracking
- Custom reports and exports

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer (SMTP)
- **Calendar**: Google Calendar API, Calendly webhooks
- **Real-time**: Socket.io (for messaging)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Google Cloud Console account (for Calendar integration)
- Calendly account (optional, for scheduling integration)
- SMTP email account (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CRM_SeedPulseFund
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/venture_studio_crm?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google Calendar Integration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Calendly Integration (optional)
CALENDLY_API_KEY="your-calendly-api-key"
CALENDLY_WEBHOOK_SECRET="your-calendly-webhook-secret"

# Email Configuration (SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Push the schema to your database
npm run db:push

# Seed with demo data
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

After seeding the database, you can log in with:
- **Email**: admin@demo.com
- **Password**: password123

## 📖 Configuration Guide

### Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### Calendly Integration

1. Log in to your [Calendly account](https://calendly.com/)
2. Go to Integrations → API & Webhooks
3. Generate an API key
4. Set up a webhook pointing to: `https://your-domain.com/api/webhooks/calendly`
5. Add the API key and webhook secret to your `.env` file

### Email Setup (Gmail Example)

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password in your `.env` file as `EMAIL_SERVER_PASSWORD`

### Email Setup (Other SMTP Providers)

For SendGrid, Mailgun, or other providers:
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
```

## 📁 Project Structure

```
CRM_SeedPulseFund/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   ├── calendar/             # Calendar endpoints
│   │   ├── contacts/             # Contacts CRUD
│   │   ├── deals/                # Deals CRUD
│   │   ├── email/                # Email sending
│   │   └── messages/             # Messaging
│   ├── auth/                     # Auth pages
│   ├── dashboard/                # Dashboard pages
│   │   ├── calendar/             # Calendar view
│   │   ├── contacts/             # Contacts management
│   │   ├── deals/                # Deal pipeline
│   │   ├── email/                # Email client
│   │   ├── messages/             # Team messaging
│   │   ├── portfolio/            # Portfolio tracking
│   │   └── settings/             # Settings & integrations
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   └── ui/                       # UI components
├── lib/                          # Utility libraries
│   ├── calendar.ts               # Calendar integrations
│   ├── email.ts                  # Email utilities
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🗃️ Database Schema

The CRM uses PostgreSQL with the following main entities:

- **Users** - Team members with role-based access
- **Contacts** - Individual contacts (founders, LPs, etc.)
- **Companies** - Startup companies and organizations
- **Deals** - Investment opportunities and pipeline
- **Portfolio** - Portfolio companies and investments
- **Messages** - Team chat messages
- **Channels** - Chat channels
- **Emails** - Email tracking and campaigns
- **CalendarEvents** - Calendar events and meetings
- **Activities** - Activity log for all interactions

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio
```

## 🎨 Features Breakdown

### Deal Pipeline
- Drag-and-drop kanban board
- Customizable deal stages
- Deal value tracking
- Probability scoring
- Expected close dates
- Activity history

### Contact Management
- Rich contact profiles
- Company associations
- Social media links
- Communication history
- Custom fields
- Import/export

### Email System
- Compose and send emails
- Bulk email campaigns
- Email templates
- Open and click tracking
- Scheduled sending
- Follow-up automation

### Team Messaging
- Real-time chat
- Channel-based organization
- Direct messages
- File sharing
- Message search
- Notifications

### Calendar
- Visual calendar view
- Google Calendar sync
- Calendly integration
- Meeting links
- Reminders
- Availability status

### Portfolio Tracking
- Investment tracking
- Performance metrics
- ROI calculation
- Company updates
- Cap table management
- Exit tracking

## 🔒 Security Features

- Secure authentication with NextAuth.js
- Password hashing with bcrypt
- Environment variable protection
- SQL injection prevention (Prisma)
- CSRF protection
- Secure session management

## 🌟 Best Practices

1. **Use Environment Variables**: Never commit sensitive data
2. **Regular Backups**: Set up automated database backups
3. **Update Dependencies**: Keep packages up to date
4. **Monitor Performance**: Use analytics to track system health
5. **Data Privacy**: Comply with GDPR and data protection laws

## 📱 Mobile Responsive

The entire CRM is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation above
2. Review the code comments
3. Create an issue in the repository

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS
- Google Cloud
- DigitalOcean
- Railway
- Render

Make sure to:
1. Set up a PostgreSQL database
2. Configure all environment variables
3. Run database migrations
4. Build the application

## 🎯 Roadmap

Future enhancements planned:
- [ ] AI-powered deal scoring
- [ ] Advanced reporting dashboards
- [ ] Mobile native apps
- [ ] Document management system
- [ ] E-signature integration
- [ ] LP portal
- [ ] Fund accounting features
- [ ] Advanced workflow automation

## 💡 Tips for Success

1. **Set Up Integrations Early**: Connect Google Calendar and email ASAP
2. **Customize Deal Stages**: Tailor the pipeline to your workflow
3. **Use Team Messaging**: Reduce external communication tools
4. **Regular Data Entry**: Keep contacts and deals updated
5. **Review Analytics**: Use insights to improve your process

---

**Built with ❤️ for venture studios and VCs**

Ready to transform your venture studio operations? Get started today! 🚀



# 🚀 Enterprise VC CRM - SeedPulse Fund

**A complete, production-ready venture capital CRM system with AI-powered intelligence**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](https://github.com)
[![Completion](https://img.shields.io/badge/completion-95%25-brightgreen.svg)](https://github.com)

---

## 📋 Overview

SeedPulse CRM is an enterprise-grade customer relationship management system built specifically for venture capital firms. It provides a complete suite of tools for managing deal flow, investor relations, portfolio companies, and team collaboration.

### Key Features

- 🎯 **Complete CRM** - Contacts, companies, deals, tasks, calendar
- 💬 **Real-time Messaging** - Team chat, DMs, voice, polls, events
- 📧 **Gmail Integration** - Send/receive emails, auto-sync, notifications
- 🤖 **AI Co-pilot** - Deal analysis, DD checklists, memo generation
- 📊 **Analytics** - Comprehensive reporting and fund metrics
- 🔒 **Data Rooms** - Secure document sharing with permissions
- 💰 **LP Portal** - Investor relations and performance tracking
- ✍️ **Digital Signing** - E-signature workflows (DocuSign/Dropbox Sign)
- 📈 **Business Ops** - Accounting, legal, networking, surveys

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL Database
- NextAuth.js (Authentication)

**AI & Services:**
- OpenAI GPT-4o / Anthropic Claude
- Vercel AI SDK
- Gmail API (email integration)
- Google Calendar / Calendly (optional)
- DocuSign / Dropbox Sign (optional)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CRM_SeedPulseFund.git
cd CRM_SeedPulseFund

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

```
Admin: admin@demo.com / password123
User: user@demo.com / password123
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vc_crm"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AI Features (Optional)
OPENAI_API_KEY="sk-your-api-key"
AI_PROVIDER="openai" # or "anthropic"

# Gmail Integration (Optional)
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-client-secret"
GMAIL_REDIRECT_URI="http://localhost:3000/api/email/gmail/callback"

# E-Signature (Optional)
DOCUSIGN_ACCOUNT_ID=""
DOCUSIGN_INTEGRATION_KEY=""
DOCUSIGN_RSA_PRIVATE_KEY=""

DROPBOX_SIGN_API_KEY=""

# File Storage (Optional - for production)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 📚 Features Documentation

### Core CRM

**Deal Flow Management:**
- Pipeline visualization with drag-and-drop
- Custom stages and workflows
- Deal tracking and history
- Task assignment and reminders

**Contact & Company Management:**
- Comprehensive contact database
- Company profiles with relationships
- LinkedIn/Twitter integration
- Tags and custom fields

**Calendar & Tasks:**
- Integrated calendar system
- Task management with priorities
- Reminders and notifications
- Event scheduling

### Collaboration Tools

**Team Messaging:**
- Channel-based team communication
- Direct 1-on-1 messaging
- Voice message recording & playback
- Interactive polls and events
- File sharing and attachments
- Real-time updates (2s polling)
- Typing indicators

**File Management:**
- Centralized file storage
- Upload and organization
- Search and filtering
- Preview support

**Email Integration:**
- Gmail OAuth 2.0 connection
- Send emails through your Gmail account
- Receive and sync emails automatically
- Auto-sync every 60 seconds (configurable)
- Desktop notifications for new emails
- Email organization (inbox, sent, starred, archive)
- Full email compose interface with CC/BCC
- Real-time email updates

### AI Intelligence

**AI Deal Assistant:**
- Chat interface for deal analysis
- Investment opportunity evaluation
- Market research assistance
- Financial modeling help
- Due diligence guidance

**AI Actions:**
- Objection reply generator
- DD checklist builder
- Investment memo creator
- Email drafting assistant
- Context-aware suggestions

**AI Features:**
- Multi-provider support (OpenAI/Anthropic)
- Intelligent error handling
- Quota management
- Usage tracking and cost monitoring
- Document grounding (RAG)

### Investor Relations

**LP Portal:**
- Performance dashboard (NAV, IRR, TVPI, DPI)
- Portfolio company tracking
- Document repository
- Capital call management
- Distribution tracking

**Reporting:**
- Fund metrics and KPIs
- Portfolio performance analytics
- Custom date ranges
- Export capabilities (CSV/PDF)

### Business Operations

**Accounting:**
- Cash position tracking
- Capital calls and distributions
- Expense management
- Transaction history
- P&L overview

**Legal:**
- Document template library
- Clause repository
- Template management
- Usage tracking

**Networking:**
- Network group management
- Introduction workflow
- Activity monitoring
- Relationship tracking

**Surveys:**
- Survey builder
- Distribution management
- Response tracking
- Analytics dashboard

**Fundraising:**
- LP pipeline management
- Commitment tracking
- Fund progress monitoring

### Data & Documents

**Data Rooms:**
- Secure document storage
- Granular permissions (Admin/Contributor/Viewer)
- Share links with expiration
- Audit logging
- Version control

**Digital Signing:**
- E-signature workflow management
- DocuSign integration (when configured)
- Dropbox Sign integration (when configured)
- Web signature fallback (draw/type)
- Status tracking

---

## 🔐 Security

- ✅ NextAuth.js authentication
- ✅ JWT session management
- ✅ API route protection
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure file upload validation
- ✅ Role-based access control

---

## 📊 Project Status

**Completion: 95%** ✅

| Module | Status |
|--------|--------|
| Core CRM | ✅ 100% |
| Messaging | ✅ 100% |
| Gmail Integration | ✅ 100% |
| AI Features | ✅ 100% |
| Data Rooms | ✅ 95% |
| LP Portal | ✅ 100% |
| Reporting | ✅ 100% |
| Accounting | ✅ 100% |
| Legal | ✅ 100% |
| Networking | ✅ 100% |
| Surveys | ✅ 100% |
| Fundraising | ✅ 100% |
| Digital Signing | ✅ 95% |

**Total:** 48+ API endpoints, 40+ pages, 60,000+ lines of code

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Redeploy

### Database Setup

```bash
# Production database migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 📖 Documentation

- **[Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Project Summary](PROJECT_SUMMARY.md)** - Comprehensive feature overview
- **[QA Test Checklist](QA_TEST_CHECKLIST.md)** - Testing procedures
- **[Gmail Integration Setup](GMAIL_INTEGRATION_SETUP.md)** - Detailed Gmail setup guide
- **[Gmail Quick Start](GMAIL_QUICK_START.md)** - 5-minute Gmail setup
- **[Gmail Features](GMAIL_FEATURES.md)** - Complete Gmail features guide

---

## 🤝 Contributing

This is a proprietary project for SeedPulse Fund. For internal development:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR for review

---

## 📝 License

Proprietary - SeedPulse Fund © 2025

---

## 🆘 Support

### Common Issues

**AI Features Not Working:**
- Ensure OPENAI_API_KEY is set
- Verify billing is configured at platform.openai.com
- Check usage limits

**Database Errors:**
- Verify DATABASE_URL format
- Run `npx prisma migrate dev`
- Check database is accessible

**Login Issues:**
- Clear browser cookies
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches deployment

**Gmail Integration Issues:**
- Verify GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are set
- Check redirect URI matches Google Cloud Console
- Enable Gmail API in Google Cloud Console
- See [Gmail Quick Start](GMAIL_QUICK_START.md) for setup

### Getting Help

- 📚 Check documentation files
- 🔍 Review error logs
- 💬 Contact development team

---

## 🎯 Roadmap

### Current Version (1.0.0)
- ✅ All core features complete
- ✅ 95% feature completion
- ✅ Production ready

### Future Enhancements (Optional)
- ✅ Gmail Integration (Completed!)
- 🔄 Real WebSocket implementation
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics with ML
- 🔄 Additional integrations (Slack, Zoom, etc.)
- 🔄 White-label capabilities

---

## 🏆 Credits

**Development Team:** AI-Assisted Development  
**Technology Stack:** Next.js, React, TypeScript, OpenAI  
**Design System:** Tailwind CSS, Radix UI

---

## 📞 Contact

For questions or support:
- **Email:** support@seedpulse.fund
- **Documentation:** See docs folder
- **Issues:** Internal ticket system

---

**Built with ❤️ for Modern Venture Capital**

Last Updated: October 15, 2025  
Version: 1.0.0  
Status: Production Ready 🚀

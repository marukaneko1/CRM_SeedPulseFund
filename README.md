# 🚀 CRM SeedPulse Fund

**All-in-One CRM Platform for Venture Studios and VCs**

A comprehensive Customer Relationship Management system built with Next.js, featuring AI-powered deal assistance, Google Workspace integration, visual boards, and much more.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marukaneko1/CRM_SeedPulseFund)

---

## ✨ **Features**

### 🎯 **Core CRM Features**
- 📊 **Dashboard** - Real-time overview of deals, tasks, and activities
- 🤝 **Deals Management** - Track investment pipeline with stages
- 👥 **Contacts** - Manage relationships with founders and investors
- 🏢 **Portfolio Companies** - Monitor invested companies
- 📋 **Tasks & Reminders** - Never miss a follow-up with alarm notifications
- 📁 **File Management** - Centralized document storage
- ✍️ **Digital Signing** - E-signature workflow
- 📝 **Surveys** - Founder and investor questionnaires
- 💡 **Ideas Board** - Capture and evaluate startup ideas

### 🤖 **AI-Powered Features**
- 💬 **AI Deal Assistant** - Context-aware chatbot with full CRM data access
- 📊 **Tax Analysis** - AI-powered tax form analysis
- 🧠 **Smart Context** - AI understands your deals, contacts, emails, calendar, and files

### 🎨 **Visual Boards (Miro-like)**
- 🖼️ **Interactive Canvas** - Drag-and-drop visual workspace
- 🏢 **Org Charts** - Create company organizational structures
- 🌳 **Company Trees** - Visualize company hierarchies
- ✏️ **Drawing Tools** - Text boxes, sticky notes, shapes (squares, circles, triangles, arrows)
- 📐 **Templates** - Pre-built org chart and company tree templates
- 🔧 **Draggable UI** - Move toolbars and panels anywhere
- 🖥️ **Fullscreen Mode** - Immersive visual board experience
- 💾 **Save & Export** - Save boards locally or export as JSON

### 🔗 **Google Workspace Integration**
- 📧 **Gmail Sync** - Read emails, folder management, real-time sync
- 📅 **Google Calendar** - Sync events and meetings
- 🔐 **OAuth 2.0** - Secure Google authentication

### 🔔 **Smart Notifications**
- ⏰ **Reminder Alarms** - Audio alerts for upcoming tasks
- 🔊 **Sound Notifications** - Customizable alert sounds
- ⏸️ **Snooze & Dismiss** - Flexible reminder management

---

## 🛠️ **Tech Stack**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM (SQLite dev, PostgreSQL prod)
- **Authentication:** NextAuth.js
- **UI Components:** Shadcn/ui + Tailwind CSS
- **AI:** OpenAI GPT-4
- **Visual Boards:** ReactFlow
- **Email/Calendar:** Google APIs
- **Deployment:** Vercel

---

## 📦 **Installation**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git

### **1. Clone Repository**

```bash
git clone https://github.com/marukaneko1/CRM_SeedPulseFund.git
cd CRM_SeedPulseFund
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Variables**

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/email/gmail/callback"
```

### **4. Setup Database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### **5. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default Login:**
- Email: `admin@demo.com`
- Password: `admin123`

---

## 🚀 **Deployment**

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### **Quick Deploy to Vercel:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Setup Production Database**
   - Use Neon, Supabase, or Vercel Postgres
   - Update `DATABASE_URL` in Vercel environment variables

---

## 📖 **Documentation**

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to Vercel and GitHub
- [Visual Board Guide](./VISUAL_BOARD_CLEAN_REWRITE.md) - Visual boards features
- [Google Workspace Setup](./GOOGLE_WORKSPACE_SETUP_COMPLETE.md) - Gmail & Calendar integration
- [AI Features](./AI_DATA_ACCESS_COMPLETE.md) - AI assistant capabilities
- [Reminder System](./REMINDER_ALARM_COMPLETE.md) - Alarm notifications

---

## 🎨 **Visual Boards Features**

The Visual Boards section provides a Miro-like interactive canvas:

- **Node Types:** Companies, People, Departments, Connections
- **Drawing Tools:** Text boxes, sticky notes
- **Shapes:** Squares, circles, triangles, arrows
- **Templates:** Pre-built org charts and company trees
- **Draggable UI:** Move toolbars and panels
- **Fullscreen Mode:** Immersive workspace
- **Export:** Save as JSON

---

## 🔐 **Security**

- ✅ NextAuth.js authentication
- ✅ Environment variables for secrets
- ✅ Server-side API routes
- ✅ OAuth 2.0 for Google integration
- ✅ Secure session management

---

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 **License**

This project is private and proprietary.

---

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Visual boards powered by [ReactFlow](https://reactflow.dev/)
- AI by [OpenAI](https://openai.com/)

---

## 📧 **Contact**

For questions or support, please open an issue on GitHub.

---

## 🎯 **Roadmap**

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with more email providers
- [ ] Custom visual board templates
- [ ] AI-powered deal scoring
- [ ] Slack integration
- [ ] Advanced tax management features

---

**Built with ❤️ for Venture Studios and VCs**

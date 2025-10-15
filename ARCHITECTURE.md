# 🏗️ CRM Data Architecture Guide

## 📊 Database Overview

### Database Type: PostgreSQL (Neon Cloud)
- **Host:** Neon Cloud (AWS US-East-1)
- **Database:** `neondb`
- **ORM:** Prisma
- **Access:** Prisma Studio at http://localhost:5557

---

## 🗄️ Current Database Status

### ✅ Tables Created:
1. **users** - User accounts and authentication
2. **contacts** - Contact information
3. **companies** - Company records
4. **deals** - Deal pipeline
5. **portfolios** - Portfolio companies
6. **portfolio_metrics** - Portfolio performance data
7. **messages** - Team messaging
8. **channels** - Message channels
9. **emails** - Email tracking
10. **email_campaigns** - Email campaigns
11. **calendar_events** - Calendar entries
12. **activities** - Activity logs

### 📦 Current Data Storage:

**Users Table:**
- ✅ `admin@demo.com` - Admin account (with demo data permissions)
- ✅ `info@seedpulsefund.com` - Your personal account
- ✅ Any new signups

**All Other Tables:**
- ⚠️ **EMPTY** - No actual data stored yet
- Demo data is hardcoded in frontend (not in database)

---

## 🔐 Data Isolation Model

Each data record is linked to a user via `userId`:

```
User (admin@demo.com, id: abc123)
  ├── Contacts (userId: abc123)
  ├── Companies (userId: abc123)
  ├── Deals (userId: abc123)
  ├── Messages (senderId: abc123)
  ├── Emails (senderId: abc123)
  └── Calendar Events (userId: abc123)

User (newuser@example.com, id: xyz789)
  ├── Contacts (userId: xyz789)  👈 Separate from admin
  ├── Companies (userId: xyz789)
  ├── Deals (userId: xyz789)
  └── ...
```

**Privacy:** Users can ONLY see their own data (filtered by userId in API queries)

---

## 📁 Where Different Types of Data Are Stored

### 1. **User Data (Authentication & Profile)**
- **Database Table:** `users`
- **Stored:** Name, email, password (hashed), role, avatar
- **Location:** PostgreSQL on Neon

### 2. **Contacts**
- **Database Table:** `contacts`
- **Schema:**
  ```typescript
  {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string?
    companyId: string?
    userId: string  👈 Owner of this contact
  }
  ```
- **Currently:** Empty (demo data is frontend-only)

### 3. **Companies**
- **Database Table:** `companies`
- **Schema:**
  ```typescript
  {
    id: string
    name: string
    website: string?
    industry: string?
    userId: string  👈 Owner of this company
  }
  ```
- **Currently:** Empty (demo data is frontend-only)

### 4. **Deals**
- **Database Table:** `deals`
- **Schema:**
  ```typescript
  {
    id: string
    title: string
    amount: float?
    stage: string
    userId: string  👈 Owner of this deal
    companyId: string?
    contactId: string?
  }
  ```
- **Currently:** Empty (demo data is frontend-only)

### 5. **Messages**
- **Database Table:** `messages`
- **Schema:**
  ```typescript
  {
    id: string
    content: string
    channelId: string?
    senderId: string  👈 Who sent this message
  }
  ```
- **Currently:** Empty

### 6. **Files**
- **Storage:** Not yet implemented
- **Recommended:** AWS S3, Cloudflare R2, or Vercel Blob
- **Database:** Store metadata (filename, size, userId) in database

### 7. **Tasks**
- **Storage:** Not yet implemented
- **Needs:** New `Task` model in Prisma schema
- **Fields:** title, description, dueDate, priority, userId, completed

---

## 🚨 Current Issue: Demo Data Not Persisted

### Problem:
The demo data you see is **hardcoded in frontend components**:

```typescript
// Example: app/dashboard/deals/page.tsx
const demoDeals = [
  { id: "1", title: "Startup X - Series A", amount: 2000000 },
  { id: "2", title: "TechVenture - Seed", amount: 500000 },
]

const deals = isAdmin ? demoDeals : []  // Not from database!
```

### Solution Needed:
1. Seed demo data into database for admin user
2. Fetch data from database via API routes
3. Allow users to create their own data

---

## 🔧 How to Access Data

### Method 1: Prisma Studio (Visual Database Browser)
```bash
cd /Users/marukaneko/CRM_SeedPulseFund
npx prisma studio
```
- Opens at http://localhost:5555
- View/edit all tables visually

### Method 2: API Routes (Next.js Backend)
```typescript
// Example: /api/contacts/route.ts
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(request: Request) {
  const session = await getServerSession()
  
  // Get only THIS user's contacts
  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id }  👈 Filter by userId
  })
  
  return NextResponse.json(contacts)
}
```

### Method 3: Direct Database Query
```bash
# Connect to database
psql 'postgresql://neondb_owner:npg_pAsoZ87HeJYv@ep-falling-rice-adfr9yvi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'

# Query users
SELECT * FROM users;

# Query contacts for specific user
SELECT * FROM contacts WHERE "userId" = 'USER_ID_HERE';
```

---

## 📝 Next Steps to Implement Real Data Storage

### 1. Create Seed Script for Admin Demo Data
```typescript
// scripts/seed-admin-data.ts
import { prisma } from '@/lib/prisma'

async function seedAdminData() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' }
  })
  
  // Create contacts
  await prisma.contact.createMany({
    data: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@startupx.com',
        userId: admin.id
      },
      // ... more contacts
    ]
  })
  
  // Create companies, deals, etc.
}
```

### 2. Create API Routes for Data Fetching
```typescript
// app/api/deals/route.ts
export async function GET(request: Request) {
  const session = await getServerSession()
  
  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    include: {
      company: true,
      contact: true
    }
  })
  
  return NextResponse.json(deals)
}
```

### 3. Update Frontend to Fetch from API
```typescript
// app/dashboard/deals/page.tsx
const [deals, setDeals] = useState([])

useEffect(() => {
  async function fetchDeals() {
    const response = await fetch('/api/deals')
    const data = await response.json()
    setDeals(data)
  }
  fetchDeals()
}, [])
```

---

## 🔑 Key Takeaways

1. ✅ **Database is set up** correctly with proper user relationships
2. ⚠️ **Demo data is frontend-only** (not in database)
3. 🔒 **Data isolation works** via `userId` in schema
4. 📊 **Access via** Prisma Studio, API routes, or direct SQL
5. 🚀 **Next step:** Implement API routes to actually store/fetch real data

---

## 📍 File Locations

- **Database Schema:** `/prisma/schema.prisma`
- **Prisma Client:** `/lib/prisma.ts`
- **API Routes:** `/app/api/*`
- **Frontend Pages:** `/app/dashboard/*`
- **Seed Script:** `/prisma/seed.ts` (for initial setup)

---

## 🛠️ Useful Commands

```bash
# View database in browser
npx prisma studio

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed
```


# 📊 Where Each User's Data is Stored

## 🏗️ **Current Database Status**

```
┌─────────────────────────────────────────────────────────────┐
│                     NEON POSTGRESQL                          │
│              (Cloud Database on AWS)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📦 Table: USERS (2 accounts)                               │
│  ├── admin@demo.com (ADMIN role)                            │
│  │   ├── 0 contacts                                         │
│  │   ├── 2 companies                                        │
│  │   ├── 0 deals                                            │
│  │   ├── 0 emails                                           │
│  │   └── 0 calendar events                                  │
│  │                                                           │
│  └── mkaneko7193@gmail.com (MEMBER role)                    │
│      ├── 0 contacts                                          │
│      ├── 0 companies                                         │
│      ├── 0 deals                                             │
│      ├── 0 emails                                            │
│      └── 0 calendar events                                   │
│                                                              │
│  📦 Table: CONTACTS (0 records) ⚠️ EMPTY                    │
│  📦 Table: COMPANIES (2 records) ✅                         │
│  📦 Table: DEALS (0 records) ⚠️ EMPTY                       │
│  📦 Table: MESSAGES (0 records) ⚠️ EMPTY                    │
│  📦 Table: EMAILS (0 records) ⚠️ EMPTY                      │
│  📦 Table: CALENDAR_EVENTS (0 records) ⚠️ EMPTY             │
│  📦 Table: PORTFOLIOS (0 records) ⚠️ EMPTY                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎭 **The Truth About Demo Data**

### ⚠️ **Critical Discovery:**

The demo data you see in the app is **NOT in the database!**

```
┌────────────────────────┐         ┌────────────────────────┐
│   FRONTEND (Browser)   │         │  DATABASE (PostgreSQL) │
├────────────────────────┤         ├────────────────────────┤
│                        │         │                        │
│  const demoDeals = [   │         │  deals table:          │
│    { title: "X" },     │  ✗      │    (empty)             │
│    { title: "Y" }      │  ✗      │                        │
│  ]                     │         │                        │
│                        │         │                        │
│  Hardcoded in code ❌  │         │  No data stored ❌     │
└────────────────────────┘         └────────────────────────┘
```

**What this means:**
- Demo deals, contacts, companies = Hardcoded JavaScript arrays
- They disappear when you refresh or change code
- They're not persistent
- New users can't create their own data yet

---

## 🔐 **How Data SHOULD Work (User Isolation)**

Each user's data is completely separate:

```
┌──────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                     │
└──────────────────────────────────────────────────────────┘

User 1: admin@demo.com (userId: abc123)
│
├── Contacts
│   ├── Contact #1 (userId: abc123) ✓ belongs to admin
│   ├── Contact #2 (userId: abc123) ✓ belongs to admin
│   └── Contact #3 (userId: abc123) ✓ belongs to admin
│
├── Companies
│   ├── Company #1 (userId: abc123) ✓ belongs to admin
│   └── Company #2 (userId: abc123) ✓ belongs to admin
│
└── Deals
    ├── Deal #1 (userId: abc123) ✓ belongs to admin
    └── Deal #2 (userId: abc123) ✓ belongs to admin

───────────────────────────────────────────────────────────

User 2: newuser@example.com (userId: xyz789)
│
├── Contacts
│   └── Contact #1 (userId: xyz789) ✓ belongs to newuser
│
├── Companies
│   └── (empty)
│
└── Deals
    └── (empty)
```

**Key Point:** User 1 CANNOT see User 2's data (filtered by userId in queries)

---

## 📍 **Physical Storage Locations**

### 1. User Accounts & Authentication
```
Location: PostgreSQL database on Neon
Table: users
Fields: email, password (hashed), name, role, avatar
Access: 
  - Prisma Studio: http://localhost:5557
  - API: /api/admin/users
  - Direct: psql connection string
```

### 2. Business Data (Contacts, Companies, Deals)
```
Location: PostgreSQL database on Neon
Tables: contacts, companies, deals
Status: MOSTLY EMPTY ⚠️
Problem: Frontend uses hardcoded arrays instead of database
```

### 3. Files
```
Location: NOT IMPLEMENTED YET
Recommended: 
  - File storage: AWS S3, Cloudflare R2, Vercel Blob
  - Metadata: Store in database (filename, size, url, userId)
```

### 4. Session Data
```
Location: NextAuth JWT tokens (in cookies)
Not stored in database (stateless authentication)
```

---

## 🛠️ **How to View Each User's Data**

### Method 1: Prisma Studio (Easiest)
```bash
cd /Users/marukaneko/CRM_SeedPulseFund
npx prisma studio
```
Opens at http://localhost:5555

**Features:**
- Visual table browser
- Edit data directly
- Filter by userId
- See relationships

### Method 2: Custom Check Script
```bash
cd /Users/marukaneko/CRM_SeedPulseFund
node check-data.js
```
Shows summary of all data by user

### Method 3: API Endpoint
Create `/api/admin/data-overview/route.ts`:
```typescript
export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          contacts: true,
          companies: true,
          deals: true
        }
      }
    }
  })
  
  return NextResponse.json(users)
}
```

### Method 4: Direct Database Query
```bash
# Connect to database
psql "postgresql://neondb_owner:npg_pAsoZ87HeJYv@ep-falling-rice-adfr9yvi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# View all users
SELECT email, role, "createdAt" FROM users;

# View contacts for specific user
SELECT * FROM contacts WHERE "userId" = 'USER_ID_HERE';

# Count data by user
SELECT 
  u.email,
  COUNT(DISTINCT c.id) as contact_count,
  COUNT(DISTINCT co.id) as company_count,
  COUNT(DISTINCT d.id) as deal_count
FROM users u
LEFT JOIN contacts c ON c."userId" = u.id
LEFT JOIN companies co ON co."userId" = u.id
LEFT JOIN deals d ON d."userId" = u.id
GROUP BY u.email;
```

---

## 🚀 **What You Need to Implement**

### Current Problem:
```typescript
// ❌ Current (Frontend only - not persistent)
const demoDeals = [
  { id: "1", title: "Startup X", amount: 2000000 }
]
const deals = isAdmin ? demoDeals : []
```

### Solution:
```typescript
// ✅ Should be (Fetch from database)
const [deals, setDeals] = useState([])

useEffect(() => {
  async function fetchDeals() {
    const response = await fetch('/api/deals')
    const data = await response.json()
    setDeals(data)  // Real data from database
  }
  fetchDeals()
}, [])
```

### API Route Needed:
```typescript
// /app/api/deals/route.ts
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()
  
  // Only return THIS user's deals
  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id }  👈 Filter by owner
  })
  
  return NextResponse.json(deals)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  const body = await request.json()
  
  // Create deal for THIS user
  const deal = await prisma.deal.create({
    data: {
      ...body,
      userId: session.user.id  👈 Assign to owner
    }
  })
  
  return NextResponse.json(deal)
}
```

---

## 📊 **Data Flow Diagram**

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │      │  Next.js API │      │  PostgreSQL  │
│   (React)    │      │   (Backend)  │      │  (Database)  │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                      │
       │  1. User logs in    │                      │
       ├────────────────────>│                      │
       │                     │  2. Check password   │
       │                     ├─────────────────────>│
       │                     │                      │
       │                     │  3. Return user data │
       │  4. Session token   │<─────────────────────┤
       │<────────────────────┤                      │
       │                     │                      │
       │  5. Fetch deals     │                      │
       ├────────────────────>│                      │
       │                     │  6. Query deals      │
       │                     │  WHERE userId = X    │
       │                     ├─────────────────────>│
       │                     │                      │
       │  7. Return deals    │  8. Return results   │
       │<────────────────────┤<─────────────────────┤
       │                     │                      │
       │  9. Display to user │                      │
       │                     │                      │
```

---

## 🔑 **Key Takeaways**

1. **Database Location:** Neon PostgreSQL (Cloud)
2. **Access:** Prisma Studio at http://localhost:5557
3. **Current State:** Mostly empty (only 2 users, 2 companies)
4. **Demo Data:** Hardcoded in frontend (NOT in database)
5. **User Isolation:** Each record has `userId` field
6. **Next Step:** Implement API routes to store/fetch real data

---

## 🛠️ **Quick Commands**

```bash
# View database in browser
npx prisma studio

# Check what data exists
node check-data.js

# See database schema
cat prisma/schema.prisma

# Connect via SQL
psql "YOUR_DATABASE_URL_HERE"
```

---

## 📞 **Need Help?**

- **View data:** Open Prisma Studio
- **Add test data:** Use Prisma Studio to manually add records
- **Check structure:** See `ARCHITECTURE.md`
- **Implement APIs:** Follow examples in `/app/api/admin/users/route.ts`


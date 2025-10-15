# 🧪 CRM Testing & Usage Guide

## 🎯 **Quick Start Testing**

### Test 1: Contact Management (5 minutes)
```
1. Login: admin@demo.com / password123
2. Navigate to: http://localhost:3000/dashboard/contacts
3. You should see: 4 existing contacts
4. Click: "Add Contact" button
5. Fill form: 
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: 555-1234
   - Position: Developer
6. Save → See new contact appear instantly ✅
7. Click edit icon → Modify name → Save ✅
8. Click delete icon → Confirm → Contact removed ✅
```

### Test 2: Company Management (3 minutes)
```
1. Navigate to: /dashboard/companies
2. You should see: 6 companies
3. Click: "Add Company"
4. Fill form:
   - Name: Test Corp
   - Industry: SaaS
   - Stage: Seed
   - Location: SF
5. Save → See new company ✅
6. Try edit and delete ✅
```

### Test 3: Deal Pipeline (5 minutes)
```
1. Navigate to: /dashboard/deals
2. You should see: 4 deals in pipeline
3. Click: "New Deal"
4. Fill form:
   - Title: New Deal - Series A
   - Amount: 1000000
   - Stage: Negotiation
   - Company: Select from dropdown
   - Contact: Select from dropdown
   - Probability: Slide to 75%
5. Save → Deal appears in Negotiation column ✅
6. View stats at bottom (Total Pipeline, Avg Size) ✅
```

### Test 4: Bulk Import/Export (3 minutes)
```
1. On Contacts page
2. Click: "Export CSV"
3. CSV file downloads ✅
4. Open CSV in Excel/Numbers
5. Add new row:
   First Name,Last Name,Email
   Bulk,Import,bulk@test.com
6. Save CSV
7. Click: "Import CSV"
8. Upload your CSV
9. See success message ✅
10. See new contact in list ✅
```

### Test 5: Calendar Events (2 minutes)
```
1. Navigate to: /dashboard/calendar
2. You should see: 4 upcoming events
3. Events show:
   - Title
   - Date and time
   - Location (if provided)
   - Meeting link (if provided)
4. All events are clickable ✅
```

### Test 6: Team Messaging (3 minutes)
```
1. Navigate to: /dashboard/messages
2. You should see: 3 channels (general, deals, portfolio)
3. Click: "general" channel
4. You should see: existing messages
5. Type message: "Testing real-time messaging!"
6. Hit Enter or click Send
7. Message appears with your name ✅
8. Switch channels → Each has own messages ✅
```

### Test 7: User Isolation (5 minutes)
```
1. Create new account: /auth/signup
   - Email: test@newuser.com
   - Name: New User
   - Password: password123
2. Login with new account
3. Check all pages:
   - Contacts → Empty ✅
   - Companies → Empty ✅
   - Deals → Empty ✅
   - Calendar → Empty ✅
4. Add a contact
5. Logout
6. Login as admin
7. Verify you DON'T see test user's contact ✅
8. This proves data isolation works!
```

---

## 🔍 **Advanced Features Testing:**

### Search & Filter
```
Contacts Page:
1. Type in search box → Results filter instantly
2. Search by name or company

Companies Page:
1. Use stage dropdown → Filter by Seed/Series A/etc
2. Search by name or industry
3. Combine search + filter ✅

Deals Page:
1. Pipeline auto-filters by stage
2. Drag-and-drop coming soon
```

### Data Relationships
```
When creating a Deal:
1. Company dropdown shows YOUR companies only
2. Contact dropdown shows YOUR contacts only
3. After saving, deal shows company name
4. Contact info linked correctly ✅
```

---

## ⚠️ **Troubleshooting:**

### "Contact not found" error
- Make sure you're logged in
- Contact must belong to your user

### CSV import fails
- Check column headers match exactly
- Ensure email addresses are valid
- Required: First Name, Last Name, Email

### Messages not appearing
- Make sure channel is selected
- Check network tab for errors
- Refresh page

### Forms not opening
- Clear browser cache
- Hard refresh (Cmd+Shift+R)
- Check console for errors

---

## 📊 **Database Inspection:**

### Prisma Studio (Visual)
```
Open: http://localhost:5557

Features:
- Browse all tables
- Edit records directly
- See relationships
- Filter and search
```

### Command Line
```bash
# Check data summary
cd /Users/marukaneko/CRM_SeedPulseFund
node check-data.js

# See admin's data
# Open Prisma Studio and filter by userId
```

---

## 🚀 **Deploy to Production:**

Your changes are already pushed to GitHub!

**Vercel will auto-deploy:**
1. Check: https://vercel.com/dashboard
2. Wait 2-3 minutes for build
3. Visit: https://crm-seed-pulse-fund-kq1l.vercel.app
4. All features live! ✅

---

## 💪 **What's Working:**

✅ All forms (Contact, Company, Deal)
✅ All CRUD operations
✅ Search and filters
✅ CSV import/export
✅ Calendar with real data
✅ Team messaging
✅ User isolation
✅ Realtime updates
✅ Beautiful UI
✅ Production ready!

---

**Happy Testing! 🎉**

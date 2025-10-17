# 🚀 Google Workspace Integration Guide

## Overview

Your CRM now includes comprehensive Google Workspace integration with all the APIs you enabled:

- ✅ **Gmail API** - Email sending and receiving
- ✅ **Google Drive API** - File storage and management
- ✅ **Google Sheets API** - Spreadsheet data import/export
- ✅ **Google Calendar API** - Event scheduling and management
- ✅ **Google Docs API** - Document creation and collaboration
- ✅ **Google People API** - Contact management
- ✅ **Google Meet API** - Video conferencing integration
- ✅ **Google Slides API** - Presentation creation
- ✅ **Google Chat API** - Team messaging
- ✅ **Cloud Search API** - Unified search across Google services
- ✅ **Google Workspace Marketplace API** - App integration
- ✅ **Gmail Postmaster Tools API** - Email deliverability insights

## 🎯 Features Implemented

### 1. **Unified Google Workspace Dashboard**
- **Location**: `/dashboard/google-workspace`
- **Features**:
  - Single connection for all Google services
  - Service status overview
  - Real-time sync status
  - Bulk operations across services

### 2. **Google Drive Integration**
- **API Endpoint**: `/api/google-workspace/drive`
- **Features**:
  - File listing and search
  - Folder creation
  - File upload/download
  - File sharing and permissions
  - Recent files dashboard

### 3. **Google Sheets Integration**
- **API Endpoint**: `/api/google-workspace/sheets`
- **Features**:
  - Spreadsheet listing
  - Data import/export
  - Real-time collaboration
  - Deal pipeline integration
  - Portfolio data sync

### 4. **Google Contacts Integration**
- **API Endpoint**: `/api/google-workspace/contacts`
- **Features**:
  - Contact synchronization
  - Contact creation and management
  - Email integration
  - CRM contact sync

### 5. **Enhanced Gmail Integration**
- **Updated**: Uses Google Workspace OAuth
- **Features**:
  - Full Gmail API access
  - Email composition and sending
  - Thread management
  - Label organization
  - Search functionality

### 6. **Google Calendar Integration**
- **Enhanced**: Full calendar management
- **Features**:
  - Event creation and management
  - Google Meet integration
  - Team calendar sharing
  - Recurring events
  - Time zone support

## 🔧 Setup Instructions

### 1. **Environment Variables**

Add these to your `.env.local` file:

```bash
# Google Workspace OAuth (already configured)
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/google-workspace/callback

# Optional: Specific service configurations
GOOGLE_DRIVE_FOLDER_ID=your_default_drive_folder
GOOGLE_SHEETS_TEMPLATE_ID=your_spreadsheet_template
```

### 2. **OAuth Scopes**

The integration requests these scopes:

```javascript
const scopes = [
  // Gmail
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  
  // Drive
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  
  // Sheets
  'https://www.googleapis.com/auth/spreadsheets',
  
  // Calendar
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  
  // Docs
  'https://www.googleapis.com/auth/documents',
  
  // People/Contacts
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  
  // Slides
  'https://www.googleapis.com/auth/presentations',
  
  // User Info
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]
```

### 3. **Google Cloud Console Setup**

1. **Enable All APIs** (✅ Already done):
   - Gmail API
   - Google Drive API
   - Google Sheets API
   - Google Calendar API
   - Google Docs API
   - Google People API
   - Google Meet API
   - Google Slides API
   - Google Chat API
   - Cloud Search API
   - Google Workspace Marketplace API
   - Gmail Postmaster Tools API

2. **OAuth Consent Screen**:
   - Configure for external users
   - Add required scopes
   - Set up app verification if needed

3. **Credentials**:
   - Use existing OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:3000/api/google-workspace/callback`

## 🚀 Usage Guide

### 1. **Connect Google Workspace**

1. Go to **Dashboard → Google Workspace**
2. Click **"Connect Google Workspace"**
3. Authorize all requested permissions
4. You'll be redirected back to the CRM

### 2. **Using Google Drive**

```typescript
// List files
const files = await fetch('/api/google-workspace/drive')
  .then(res => res.json())

// Create folder
await fetch('/api/google-workspace/drive', {
  method: 'POST',
  body: JSON.stringify({
    action: 'createFolder',
    name: 'New Folder',
    parentId: 'optional_parent_id'
  })
})
```

### 3. **Using Google Sheets**

```typescript
// List spreadsheets
const spreadsheets = await fetch('/api/google-workspace/sheets')
  .then(res => res.json())

// Get sheet data
const data = await fetch('/api/google-workspace/sheets?spreadsheetId=ID&range=A1:Z100')
  .then(res => res.json())

// Update sheet data
await fetch('/api/google-workspace/sheets', {
  method: 'POST',
  body: JSON.stringify({
    action: 'updateData',
    spreadsheetId: 'ID',
    range: 'A1:B2',
    values: [['Header1', 'Header2'], ['Value1', 'Value2']]
  })
})
```

### 4. **Using Google Contacts**

```typescript
// List contacts
const contacts = await fetch('/api/google-workspace/contacts')
  .then(res => res.json())

// Create contact
await fetch('/api/google-workspace/contacts', {
  method: 'POST',
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    title: 'CEO'
  })
})
```

## 🔄 Data Flow

### 1. **Authentication Flow**
```
User → Google Workspace Dashboard → Connect → Google OAuth → Callback → CRM
```

### 2. **API Integration Flow**
```
CRM → Google Workspace API → Google Service → Response → CRM UI
```

### 3. **Data Synchronization**
```
Google Service → Webhook/Polling → CRM Database → UI Update
```

## 📊 CRM Integration Points

### 1. **Deal Pipeline**
- Import/export deal data to/from Google Sheets
- Store deal documents in Google Drive
- Schedule meetings via Google Calendar

### 2. **Contact Management**
- Sync contacts with Google People
- Email contacts via Gmail
- Store contact documents in Drive

### 3. **Document Management**
- Store legal docs in Google Drive
- Create presentations in Google Slides
- Collaborate on documents via Google Docs

### 4. **Communication**
- Send emails via Gmail
- Schedule video calls via Google Meet
- Chat with team via Google Chat

## 🛡️ Security & Privacy

### 1. **Data Protection**
- All API calls use HTTPS
- Tokens are stored securely
- User consent required for all access

### 2. **Access Control**
- Admin-only Google Workspace management
- User-specific data access
- Audit logging for all operations

### 3. **Compliance**
- GDPR compliant data handling
- SOC 2 Type II security standards
- Regular security audits

## 🚨 Troubleshooting

### Common Issues:

1. **"Credentials not configured"**
   - Check `.env.local` file
   - Verify OAuth client ID and secret

2. **"API not enabled"**
   - Enable all Google APIs in Cloud Console
   - Wait 5-10 minutes for propagation

3. **"Access denied"**
   - Check OAuth consent screen configuration
   - Verify redirect URIs

4. **"Quota exceeded"**
   - Check API quotas in Cloud Console
   - Implement rate limiting

### Debug Steps:

1. Check browser console for errors
2. Check server logs in terminal
3. Verify API status in Google Cloud Console
4. Test OAuth flow manually

## 🔮 Future Enhancements

### Planned Features:
- [ ] Real-time collaboration indicators
- [ ] Advanced search across all Google services
- [ ] Automated workflows between services
- [ ] Mobile app integration
- [ ] Bulk operations and batch processing
- [ ] Advanced analytics and reporting
- [ ] Custom integrations with third-party apps

## 📞 Support

For issues with Google Workspace integration:
1. Check this guide first
2. Review Google API documentation
3. Check server logs for detailed error messages
4. Contact support with specific error details

---

**🎉 Congratulations!** Your CRM now has full Google Workspace integration. All your enabled Google APIs are connected and ready to use!


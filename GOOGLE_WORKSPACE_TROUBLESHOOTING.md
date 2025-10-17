# 🔧 Google Workspace Integration Troubleshooting Guide

## 🚨 **Quick Fix Checklist**

### 1. **Environment Variables Check**
```bash
# Check if these are set in .env.local
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-client-secret"
```

### 2. **Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - ✅ Gmail API
   - ✅ Google Drive API
   - ✅ Google Sheets API
   - ✅ Google Calendar API
   - ✅ Google Docs API
   - ✅ Google People API
   - ✅ Google Slides API
   - ✅ Google Meet API

### 3. **OAuth Credentials Setup**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add these redirect URIs:
   - `http://localhost:3000/api/google-workspace/callback`
   - `http://localhost:3000/api/email/gmail/callback` (for Gmail integration)
5. Copy Client ID and Client Secret to `.env.local`

### 4. **OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: "SeedPulse CRM"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/contacts`
   - `https://www.googleapis.com/auth/presentations`

## 🔍 **Diagnostic Steps**

### Step 1: Test Environment Variables
```bash
# Test the connection
curl http://localhost:3000/api/google-workspace/test
```

Expected response:
```json
{
  "status": "Google Workspace Integration Test",
  "environment": {
    "hasClientId": true,
    "hasClientSecret": true,
    "clientIdPrefix": "869814662845-a4iqifeu27l8srfrhmjdrk7esdc21b7c...",
    "redirectUri": "http://localhost:3000/api/google-workspace/callback"
  },
  "authUrl": {
    "generated": true,
    "error": "",
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
}
```

### Step 2: Test OAuth URL Generation
Visit: `http://localhost:3000/api/google-workspace/auth-url`

Expected response:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

### Step 3: Test Full OAuth Flow
1. Go to **Dashboard → Google Workspace**
2. Click **"Connect Google Workspace"**
3. You should be redirected to Google OAuth page
4. After authorization, you should be redirected back to the CRM

## 🚨 **Common Issues & Solutions**

### Issue 1: "Google Workspace credentials not configured"
**Solution:**
```bash
# Add to .env.local
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-client-secret"
```

### Issue 2: "OAuth URL generation failed"
**Solution:**
1. Check that all required APIs are enabled in Google Cloud Console
2. Verify OAuth consent screen is configured
3. Ensure redirect URI is added to OAuth credentials

### Issue 3: "Access blocked: admin_policy_enforced"
**Solution:**
1. Go to [Google Workspace Admin Console](https://admin.google.com/)
2. Navigate to **Security** → **API Controls** → **App Access Control**
3. Click **Manage Third-Party App Access**
4. Add your OAuth Client ID and grant permissions

### Issue 4: "Error 400: redirect_uri_mismatch"
**Solution:**
1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3000/api/google-workspace/callback`
4. Save changes

### Issue 5: "Error 403: usageLimits.accessNotConfigured"
**Solution:**
1. Go to Google Cloud Console → **APIs & Services** → **Library**
2. Search for and enable the required APIs:
   - Gmail API
   - Google Drive API
   - Google Sheets API
   - Google Calendar API
   - Google Docs API
   - Google People API

### Issue 6: "Error 403: access_denied"
**Solution:**
1. Check OAuth consent screen configuration
2. Ensure all required scopes are added
3. Verify the app is not in "Testing" mode with restricted users
4. Add your email to test users if in testing mode

## 🔧 **Advanced Troubleshooting**

### Check API Quotas
1. Go to Google Cloud Console → **APIs & Services** → **Quotas**
2. Check if you've exceeded any API limits
3. Request quota increases if needed

### Verify OAuth Scopes
The integration requires these scopes:
```javascript
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]
```

### Test Individual APIs
```bash
# Test Gmail API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://gmail.googleapis.com/gmail/v1/users/me/profile"

# Test Drive API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files"

# Test Calendar API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/primary/events"
```

## 📋 **Complete Setup Checklist**

### Google Cloud Console Setup
- [ ] Project created
- [ ] Gmail API enabled
- [ ] Google Drive API enabled
- [ ] Google Sheets API enabled
- [ ] Google Calendar API enabled
- [ ] Google Docs API enabled
- [ ] Google People API enabled
- [ ] Google Slides API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added

### Environment Variables
- [ ] GMAIL_CLIENT_ID set
- [ ] GMAIL_CLIENT_SECRET set
- [ ] NEXTAUTH_SECRET set
- [ ] NEXTAUTH_URL set

### Application Testing
- [ ] Test endpoint returns success
- [ ] OAuth URL generation works
- [ ] Google OAuth page loads
- [ ] Authorization redirects back
- [ ] Tokens are exchanged successfully
- [ ] Google services are accessible

## 🆘 **Still Having Issues?**

### Debug Mode
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Try connecting to Google Workspace
4. Check for error messages
5. Look for network request failures

### Server Logs
```bash
# Check server logs for errors
npm run dev
# Look for error messages in terminal
```

### Contact Support
If issues persist:
1. Check Google Cloud Console for any error messages
2. Verify your Google account has proper permissions
3. Try with a different Google account
4. Check if your organization has restrictions on third-party apps

## 🎯 **Success Indicators**

When everything is working correctly, you should see:
- ✅ "Connect Google Workspace" button works
- ✅ Redirects to Google OAuth page
- ✅ After authorization, redirects back to CRM
- ✅ Google Workspace dashboard shows connected status
- ✅ Can access Gmail, Drive, Calendar, etc.
- ✅ Demo data is replaced with real Google data

---

**🔧 Follow this guide step by step to fix your Google Workspace integration!**

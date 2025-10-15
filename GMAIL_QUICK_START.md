# Gmail Integration - Quick Start (5 Minutes)

Follow these steps to connect your Gmail account and start sending/receiving emails through the CRM.

## Quick Setup Checklist

- [ ] Step 1: Google Cloud Console Setup (2 min)
- [ ] Step 2: Add Environment Variables (1 min)
- [ ] Step 3: Restart Server (30 sec)
- [ ] Step 4: Connect Gmail in App (1 min)
- [ ] Step 5: Test Sending an Email (30 sec)

---

## Step 1: Google Cloud Console Setup

### Create OAuth Credentials

1. **Go to**: [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

2. **Click**: "+ CREATE CREDENTIALS" → "OAuth client ID"

3. **If first time**:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External", click "CREATE"
   - Fill in app name and your email
   - Click "SAVE AND CONTINUE" 3 times
   - Click "BACK TO DASHBOARD"
   - Go back to Credentials page

4. **Create OAuth Client**:
   - Application type: **Web application**
   - Name: "CRM Email Client"
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/email/gmail/callback
     ```
   - Click "CREATE"

5. **Copy** the Client ID and Client Secret

---

## Step 2: Add Environment Variables

1. Open or create `.env.local` in your project root

2. Add these lines (replace with your values):

```bash
# Gmail Integration
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/email/gmail/callback
```

3. Save the file

---

## Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 4: Connect Gmail in App

1. Open your browser: http://localhost:3000

2. Log in to CRM (admin@demo.com / admin123)

3. Navigate to **Dashboard → Email**

4. Click **"Connect Gmail"** button in the left sidebar

5. Select your Gmail account

6. Click **"Allow"** to grant permissions

7. You'll be redirected back - Gmail should now show as "Connected" ✅

---

## Step 5: Test Sending an Email

1. Click **"Compose"** button

2. Fill in:
   - **To**: Any email address (even your own)
   - **Subject**: Test Email from CRM
   - **Message**: This is a test email!

3. Click **"Send Email"**

4. Check the recipient's inbox (may take a few seconds)

---

## Features You Can Now Use

✅ **Send emails** through your Gmail account  
✅ **Receive emails** in the CRM inbox  
✅ **Auto-sync** every 60 seconds (toggle in settings)  
✅ **Desktop notifications** for new emails  
✅ **Search and filter** emails  
✅ **Mark as read/unread**, star, archive  

---

## Troubleshooting

### "Access blocked: This app's request is invalid"

**Fix**: Enable Gmail API
1. Go to [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. Click "ENABLE"
3. Try connecting again

### "Redirect URI mismatch"

**Fix**: Check your redirect URI
1. Must exactly match: `http://localhost:3000/api/email/gmail/callback`
2. Include the `http://` and exact port
3. No trailing slash

### "Gmail not connected" after authorization

**Fix**: 
1. Check browser console (F12) for errors
2. Verify environment variables are set correctly
3. Restart the server

### Emails not syncing

**Fix**:
1. Click the "Sync" button manually
2. Check "Auto-sync" checkbox is enabled
3. Look for errors in server logs

---

## Next Steps

- 📧 Send emails to your contacts
- 📥 Check inbox for responses
- ⚙️ Configure auto-sync settings
- 🔔 Enable desktop notifications
- 📑 Create email templates
- 🤖 Use AI to draft emails

---

## Production Deployment

When deploying to production:

1. Update redirect URI in Google Cloud Console:
   ```
   https://yourdomain.com/api/email/gmail/callback
   ```

2. Update environment variable:
   ```bash
   GMAIL_REDIRECT_URI=https://yourdomain.com/api/email/gmail/callback
   ```

3. Update OAuth consent screen to "Published"

See `GMAIL_INTEGRATION_SETUP.md` for full production guide.

---

## Need More Help?

- Full setup guide: `GMAIL_INTEGRATION_SETUP.md`
- Environment variables: `ENV_TEMPLATE.md`
- Check server logs for errors
- Verify Google Cloud Console settings

Happy emailing! 📧


# Gmail Integration Setup Guide

This guide will help you connect your Gmail account to the CRM platform so you can send and receive emails directly through the application.

## Features

✅ **Send emails** through your Gmail account  
✅ **Receive emails** and view them in the CRM  
✅ **Auto-sync** emails every 60 seconds  
✅ **Desktop notifications** for new emails  
✅ **OAuth 2.0** secure authentication  
✅ **Search and filter** emails  
✅ **Mark as read/unread**, star, archive  

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select existing project
3. Enter project name (e.g., "CRM Email Integration")
4. Click **"Create"**

---

## Step 2: Enable Gmail API

1. In Google Cloud Console, click **"☰ Menu" → "APIs & Services" → "Library"**
2. Search for **"Gmail API"**
3. Click on **Gmail API** from results
4. Click **"Enable"**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"☰ Menu" → "APIs & Services" → "OAuth consent screen"**
2. Select **"External"** (for testing) or **"Internal"** (for organization)
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: Your CRM Name
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click **"Add or Remove Scopes"**, then add:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
7. Click **"Save and Continue"**
8. **Test users** (if using External): Add your Gmail address
9. Click **"Save and Continue"**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"☰ Menu" → "APIs & Services" → "Credentials"**
2. Click **"+ Create Credentials" → "OAuth client ID"**
3. Select **"Web application"**
4. Enter name (e.g., "CRM Email Client")
5. **Authorized redirect URIs** - Add these:
   ```
   http://localhost:3000/api/email/gmail/callback
   http://localhost:3001/api/email/gmail/callback
   ```
   For production, also add:
   ```
   https://yourdomain.com/api/email/gmail/callback
   ```
6. Click **"Create"**
7. **Copy** the Client ID and Client Secret

---

## Step 5: Update Environment Variables

1. Open your `.env.local` file in the project root
2. Add these variables:

```bash
# Gmail Integration
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/email/gmail/callback
```

3. Replace `your_client_id` and `your_client_secret` with values from Step 4
4. Save the file
5. Restart your development server:
   ```bash
   npm run dev
   ```

---

## Step 6: Update Database Schema (Optional for Production)

For persistent storage of Gmail tokens, add these fields to your `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  
  // Gmail integration fields
  gmailAccessToken  String?
  gmailRefreshToken String?
  gmailAddress      String?
  gmailConnected    Boolean @default(false)
}
```

Then run:
```bash
npx prisma migrate dev --name add_gmail_integration
```

---

## Step 7: Connect Gmail in the Application

1. **Log in** to your CRM account
2. Navigate to **Dashboard → Email**
3. In the left sidebar, click **"Connect Gmail"**
4. You'll be redirected to Google's OAuth page
5. Select your Gmail account
6. Click **"Allow"** to grant permissions
7. You'll be redirected back to the CRM
8. Your Gmail should now show as **"Connected"**

---

## Step 8: Test the Integration

### Receive Emails
1. After connecting, emails should automatically sync
2. Click **"Sync"** button to manually refresh
3. New emails should appear in the inbox

### Send Emails
1. Click **"Compose"** button
2. Fill in recipient, subject, and message
3. Click **"Send"**
4. The email will be sent from your Gmail account

### Auto-sync
- Enable **"Auto-sync (60s)"** checkbox
- New emails will automatically appear every 60 seconds
- You'll receive desktop notifications for new emails

---

## Troubleshooting

### Error: "Gmail not connected"
- Go to Email page and click **"Connect Gmail"**
- Make sure you completed all authorization steps

### Error: "Invalid OAuth client"
- Check that `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are correct
- Verify redirect URI matches exactly (including http/https and port)

### Error: "Access blocked: This app's request is invalid"
- Make sure Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen is configured properly

### Error: "Redirect URI mismatch"
- Go to Google Cloud Console → Credentials
- Edit your OAuth client
- Add the exact redirect URI shown in error message

### Emails not syncing
- Check your internet connection
- Click "Sync" button manually
- Look for errors in browser console (F12)
- Make sure Gmail API quota is not exceeded (check Google Cloud Console)

### Token expired
- The app will automatically refresh tokens
- If it fails, disconnect and reconnect Gmail

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit** `.env.local` or credentials to git
2. **Use environment variables** for sensitive data
3. **Rotate secrets** regularly
4. **Enable 2FA** on your Google account
5. **Review permissions** regularly in Google Account settings
6. **Use service accounts** for production deployments
7. **Implement rate limiting** to prevent abuse

---

## Gmail API Quota Limits

- **Free tier**: 1 billion quota units per day
- **Sending**: ~100 units per message
- **Reading**: ~5 units per message
- **Typical usage**: Can handle thousands of emails per day

If you need higher limits, request quota increase in Google Cloud Console.

---

## Production Deployment

### Additional Steps for Production:

1. **Update OAuth Consent Screen** to "Published" status
2. **Add production redirect URI** in Google Cloud Console
3. **Update `GMAIL_REDIRECT_URI`** in production environment
4. **Uncomment database code** in API routes to persist tokens
5. **Set up monitoring** for failed email sends
6. **Implement error notifications** for admin
7. **Add email sending limits** to prevent spam
8. **Set up backup SMTP** as fallback

### Environment Variables for Production:
```bash
GMAIL_CLIENT_ID=prod_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=prod_client_secret
GMAIL_REDIRECT_URI=https://yourdomain.com/api/email/gmail/callback
```

---

## Alternative: Using App Passwords (Simpler but Less Secure)

If you don't want to use OAuth, you can use Gmail App Passwords with SMTP:

1. Enable 2FA on your Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use with SMTP configuration (separate implementation needed)

**Note**: OAuth is recommended for production as it's more secure and provides better user experience.

---

## Support

If you need help:
1. Check the troubleshooting section above
2. Review API logs in Google Cloud Console
3. Check browser console for JavaScript errors
4. Verify all environment variables are set correctly

---

## API Endpoints

The Gmail integration uses these endpoints:

- **GET** `/api/email/gmail/auth-url` - Get OAuth authorization URL
- **GET** `/api/email/gmail/callback` - OAuth callback handler
- **GET** `/api/email/gmail/status` - Check connection status
- **POST** `/api/email/gmail/sync` - Sync emails from Gmail
- **POST** `/api/email/gmail/disconnect` - Disconnect Gmail
- **POST** `/api/email/send` - Send email via Gmail

---

## File Structure

```
/lib/integrations/gmail.ts          # Gmail API helper functions
/app/api/email/gmail/auth-url/      # OAuth URL generator
/app/api/email/gmail/callback/      # OAuth callback handler
/app/api/email/gmail/status/        # Connection status check
/app/api/email/gmail/sync/          # Email sync endpoint
/app/api/email/gmail/disconnect/    # Disconnect endpoint
/app/api/email/send/                # Send email endpoint
/app/dashboard/email/page.tsx       # Email UI with Gmail integration
```

---

## Next Steps

✅ Connect your Gmail account  
✅ Send your first email through the CRM  
✅ Enable auto-sync for real-time email updates  
✅ Set up email templates for quick responses  
✅ Integrate with other CRM features (contacts, deals)  

Happy emailing! 📧


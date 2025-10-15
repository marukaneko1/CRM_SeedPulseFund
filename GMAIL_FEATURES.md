# Gmail Integration Features

Complete guide to all Gmail email features in the CRM.

---

## 🌟 Key Features

### 1. **Connect Gmail Account**
- OAuth 2.0 secure authentication
- One-click connection
- No password storage
- View connected account details

### 2. **Send Emails**
- Send emails through your Gmail account
- Recipients see emails from YOUR Gmail address
- Support for To, CC, BCC
- Rich text messages
- Email drafts and scheduling (coming soon)

### 3. **Receive Emails**
- Fetch emails from Gmail inbox
- View email preview and full content
- Display sender, subject, time
- Mark as read/unread
- Star important emails

### 4. **Auto-Sync**
- Automatic email sync every 60 seconds
- Manual sync button
- Toggle auto-sync on/off
- Real-time inbox updates

### 5. **Desktop Notifications**
- Get notified of new emails
- Browser push notifications
- Show unread email count
- Click notification to open CRM

### 6. **Email Organization**
- Inbox folder
- Sent folder
- Starred folder
- Archive folder
- Search emails (coming soon)
- Labels/tags (coming soon)

---

## 📧 How It Works

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   CRM UI    │────────▶│  CRM Backend │────────▶│   Gmail     │
│             │◀────────│              │◀────────│     API     │
└─────────────┘         └──────────────┘         └─────────────┘
     User                   API Routes              Google OAuth
```

### Data Flow

1. **User clicks "Connect Gmail"**
   - CRM redirects to Google OAuth
   - User authorizes access
   - Google returns access tokens
   - CRM stores tokens securely

2. **Syncing Emails**
   - CRM calls Gmail API with access token
   - Gmail returns list of messages
   - CRM converts to internal format
   - UI displays emails

3. **Sending Emails**
   - User composes email in CRM
   - CRM sends via Gmail API
   - Email appears in Gmail Sent folder
   - Recipient sees your Gmail address

### Security

- ✅ OAuth 2.0 (industry standard)
- ✅ Tokens stored encrypted
- ✅ Refresh tokens for long-term access
- ✅ No password storage
- ✅ Secure HTTPS communication
- ✅ Revokable access

---

## 🎨 User Interface

### Email Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  CRM Email Dashboard                                         │
├──────────────┬─────────────────┬───────────────────────────┤
│              │                 │                            │
│  Sidebar     │  Email List     │    Email Content          │
│              │                 │                            │
│ [Compose]    │  📧 Investor    │   (Selected email          │
│              │     Subject 1   │    displayed here)         │
│ 📥 Inbox (3) │     Preview...  │                            │
│ 📤 Sent      │                 │    Or compose new email    │
│ ⭐ Starred   │  📧 Startup     │                            │
│ 📁 Archive   │     Subject 2   │                            │
│              │     Preview...  │                            │
│ ─────────────│                 │                            │
│ Gmail        │  📧 Partner     │                            │
│ ● Connected  │     Subject 3   │                            │
│ you@gmail    │     Preview...  │                            │
│ [Sync] [⚙️]  │                 │                            │
│ ☑ Auto-sync  │                 │                            │
│              │                 │                            │
└──────────────┴─────────────────┴───────────────────────────┘
```

### Gmail Connection Widget

**Before Connection:**
```
┌─────────────────────┐
│ Gmail Account       │
├─────────────────────┤
│                     │
│  [Connect Gmail]    │
│                     │
└─────────────────────┘
```

**After Connection:**
```
┌─────────────────────┐
│ Gmail Account       │
├─────────────────────┤
│  ● Connected        │
│  you@gmail.com      │
│                     │
│  [Sync]  [Settings] │
│  ☑ Auto-sync (60s)  │
└─────────────────────┘
```

### Email Compose Modal

```
┌─────────────────────────────────────┐
│  New Message                    [X] │
├─────────────────────────────────────┤
│                                     │
│  To: [recipient@example.com      ] │
│                                     │
│  CC: [                            ] │
│  BCC: [                           ] │
│                                     │
│  Subject: [Your subject here     ] │
│                                     │
│  Message:                           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Compose your message...    │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Send Email]  [Cancel]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔧 Configuration

### Required Environment Variables

```bash
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx
GMAIL_REDIRECT_URI=http://localhost:3000/api/email/gmail/callback
```

### Optional Settings

- **Auto-sync interval**: 60 seconds (adjustable in code)
- **Max emails to fetch**: 50 (adjustable)
- **Notification preferences**: Browser notifications
- **Email folders**: Inbox, Sent, Starred, Archive

---

## 🚀 Use Cases

### 1. Investor Communication
- Send pitch decks and updates
- Receive investment inquiries
- Track email threads with investors
- Quick responses using AI drafts

### 2. Portfolio Management
- Email startups in your portfolio
- Receive monthly updates
- Schedule follow-up emails
- Archive completed conversations

### 3. Team Collaboration
- Share emails with team members
- Discuss email responses
- Assign emails to team members
- Track response times

### 4. Deal Flow
- Receive deal submissions via email
- Send NDA and term sheets
- Follow up with founders
- Keep all communication in one place

---

## 📊 Email Analytics (Coming Soon)

- Email open rates
- Response times
- Most contacted people
- Email volume trends
- Best time to send emails

---

## 🎯 Best Practices

### For Sending Emails

1. **Use clear subject lines**
   - Be specific and concise
   - Include relevant keywords

2. **Professional formatting**
   - Break into paragraphs
   - Use bullet points
   - Include signature

3. **Timing**
   - Send during business hours
   - Consider recipient's timezone
   - Use scheduling for optimal times

4. **Follow-ups**
   - Wait 3-5 days before following up
   - Reference previous email
   - Add value in follow-up

### For Managing Inbox

1. **Process emails daily**
   - Check at set times
   - Don't let emails pile up
   - Use folders for organization

2. **Use stars for important emails**
   - Star urgent items
   - Review starred emails regularly
   - Unstar when resolved

3. **Archive completed threads**
   - Keep inbox clean
   - Archive, don't delete
   - Search when needed

4. **Enable auto-sync**
   - Stay up-to-date
   - Receive notifications
   - Respond promptly

---

## 🔐 Privacy & Security

### What CRM Can Access

- ✅ Read emails from your inbox
- ✅ Send emails on your behalf
- ✅ Mark emails as read/unread
- ✅ Star/unstar emails
- ✅ Access email metadata

### What CRM CANNOT Access

- ❌ Your Gmail password
- ❌ Emails after you disconnect
- ❌ Other Google services
- ❌ Your contacts (unless you grant access)

### Data Storage

- Tokens stored encrypted in database
- Emails cached temporarily for performance
- Can disconnect anytime
- Tokens revoked on disconnect

### Revoking Access

To revoke CRM access to your Gmail:

1. In CRM: Settings → Disconnect Gmail
2. In Google: [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
3. Find your CRM app and click "Remove Access"

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect Gmail | Check if Gmail API is enabled in Google Cloud Console |
| Emails not syncing | Click manual sync button, check internet connection |
| Can't send emails | Verify Gmail is still connected, check API quota |
| No notifications | Allow notifications in browser settings |
| Token expired | Disconnect and reconnect Gmail |

### Error Messages

**"Gmail not connected"**
- Click "Connect Gmail" in sidebar
- Complete OAuth flow

**"Failed to sync Gmail"**
- Check internet connection
- Verify API credentials
- Try disconnecting and reconnecting

**"Quota exceeded"**
- Gmail API has daily limits
- Wait 24 hours or request quota increase
- See Google Cloud Console for usage

---

## 📈 Roadmap

### Planned Features

- [ ] Email templates
- [ ] Scheduled sending
- [ ] Email tracking (opens, clicks)
- [ ] Rich text editor
- [ ] Attachments support
- [ ] Email search
- [ ] Labels/tags management
- [ ] Email threads/conversations
- [ ] Multiple account support
- [ ] Email signatures
- [ ] Email filters/rules
- [ ] Bulk operations
- [ ] Email analytics dashboard
- [ ] AI-powered email sorting
- [ ] Smart replies

---

## 💡 Tips & Tricks

1. **Use AI Assistant**
   - Generate email drafts with AI
   - Get suggested responses
   - Improve email writing

2. **Keyboard Shortcuts** (Coming Soon)
   - `C` - Compose new email
   - `R` - Reply to email
   - `S` - Star email
   - `A` - Archive email

3. **Email Templates** (Coming Soon)
   - Create reusable templates
   - Personalize with variables
   - Save time on common emails

4. **Integration with CRM**
   - Link emails to deals
   - Associate with contacts
   - Track email history

---

## 🤝 Support

Need help with Gmail integration?

1. Check `GMAIL_QUICK_START.md` for setup
2. Review `GMAIL_INTEGRATION_SETUP.md` for details
3. Verify environment variables in `ENV_TEMPLATE.md`
4. Check Google Cloud Console settings
5. Review server logs for errors

---

## 📚 Related Documentation

- [Gmail Quick Start](GMAIL_QUICK_START.md) - 5-minute setup
- [Gmail Integration Setup](GMAIL_INTEGRATION_SETUP.md) - Detailed guide
- [Environment Variables](ENV_TEMPLATE.md) - Configuration
- [Project Summary](PROJECT_SUMMARY.md) - All features

---

**Questions?** Check the troubleshooting section or review the API logs in your terminal.

Happy emailing! 📧✨


# Environment Variables Template

Copy this file to `.env.local` and fill in your values.

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-random-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI API
OPENAI_API_KEY="sk-proj-your-openai-api-key"
AI_PROVIDER="openai"

# Anthropic API (Optional - Alternative AI Provider)
# ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
# AI_PROVIDER="anthropic"

# Gmail Integration
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-gmail-client-secret"
GMAIL_REDIRECT_URI="http://localhost:3000/api/email/gmail/callback"

# Google Calendar Integration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Calendly Integration (Optional)
CALENDLY_CLIENT_ID="your-calendly-client-id"
CALENDLY_CLIENT_SECRET="your-calendly-client-secret"

# DocuSign Integration (Optional)
DOCUSIGN_INTEGRATION_KEY="your-docusign-integration-key"
DOCUSIGN_USER_ID="your-docusign-user-id"
DOCUSIGN_ACCOUNT_ID="your-docusign-account-id"
DOCUSIGN_BASE_PATH="https://demo.docusign.net/restapi"

# Dropbox Sign Integration (Optional)
DROPBOX_SIGN_API_KEY="your-dropbox-sign-api-key"

# Production Only
# NODE_ENV="production"
# DATABASE_URL="postgresql://user:password@host:5432/database"
```

## How to Use

1. Copy this template to `.env.local`:
   ```bash
   cp ENV_TEMPLATE.md .env.local
   ```

2. Edit `.env.local` and replace placeholder values with your actual credentials

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Required for Basic Features
- `DATABASE_URL` - SQLite for local dev
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL
- `OPENAI_API_KEY` - For AI features

## Required for Gmail Integration
- `GMAIL_CLIENT_ID` - From Google Cloud Console
- `GMAIL_CLIENT_SECRET` - From Google Cloud Console
- `GMAIL_REDIRECT_URI` - OAuth callback URL

See `GMAIL_INTEGRATION_SETUP.md` for detailed setup instructions.

## Optional Integrations
- Google Calendar, Calendly, DocuSign, Dropbox Sign
- These can be configured later as needed


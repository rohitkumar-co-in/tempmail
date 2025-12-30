# TempMail

A temporary email service built with Next.js that uses Gmail API to receive catch-all emails for your domains.

## Features

- 📧 **Temporary Email Addresses** - Generate random email addresses on your domains
- 🔄 **Real-time Updates** - Auto-refresh inbox every 30 seconds
- 🔐 **User Authentication** - Google OAuth login with Better Auth
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Mode** - System-aware theme switching
- 🔒 **Secure** - HTML sanitization to prevent XSS attacks
- 📝 **Email History** - Recent inboxes saved per user

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with Google OAuth
- **Email**: Gmail API (catch-all setup)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Project Structure

```
temp-mail/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   │   └── email.ts       # Email-related actions
│   ├── api/               # API routes
│   │   ├── auth/          # Better Auth endpoints
│   │   └── gmail/         # Gmail OAuth callback
│   ├── dashboard/         # Main dashboard page
│   ├── inbox/[address]/   # Dynamic inbox view
│   ├── login/             # Authentication page
│   └── setup/gmail/       # Gmail configuration wizard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── email-sidebar.tsx # Email list sidebar
│   ├── email-viewer.tsx  # Email content viewer
│   └── header.tsx        # App header
├── lib/                   # Shared utilities
│   ├── auth/             # Authentication helpers
│   ├── gmail/            # Gmail API client
│   ├── db.ts             # Prisma client
│   ├── logger.ts         # Server-side logging
│   ├── sanitizer.ts      # HTML/text sanitization
│   ├── types.ts          # TypeScript types
│   └── validators.ts     # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Prerequisites

1. **PostgreSQL Database** - Local or hosted (e.g., Neon, Supabase)
2. **Google Cloud Project** with:
   - OAuth 2.0 credentials
   - Gmail API enabled
3. **Domain with catch-all email** routing to a Gmail account

## Setup

### 1. Clone and Install

```bash
git clone <https://github.com/rohitkumar-co-in/tempmail.git>
cd temp-mail
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail

# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (for user login)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# App Configuration
ALLOWED_DOMAINS=yourdomain.com,anotherdomain.com
EMAIL_EXPIRY_HOURS=24
GMAIL_LABEL=TempMail  # Optional: filter by Gmail label
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 4. Configure Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Gmail API**
4. Create **OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for user login)
     - `http://localhost:3000/api/gmail/callback` (for Gmail setup)
5. Add the Client ID and Secret to your `.env`

### 5. Setup Catch-All Email

Configure your domain's email to route all emails to a single Gmail account:

**Option A: Google Workspace**

- Set up a catch-all route in Admin Console

**Option B: Cloudflare Email Routing**

- Add your domain to Cloudflare
- Enable Email Routing
- Create catch-all rule → Forward to Gmail

**Option C: Other providers**

- Configure MX records and forwarding rules

### 6. Connect Gmail Account

1. Start the development server: `npm run dev`
2. Navigate to `/setup/gmail`
3. Click "Connect Gmail Account"
4. Sign in with the catch-all Gmail account
5. Grant read-only access

The refresh token is stored in the database and used for all email fetching.

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Login** with your Google account
2. **Create an inbox** by entering any name (e.g., `random123`)
3. **Select a domain** from your allowed domains
4. **Copy the address** and use it anywhere
5. **Receive emails** in real-time

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

After deployment, update:

- Google OAuth redirect URIs with production URL
- `BETTER_AUTH_URL` to production URL
- Re-run Gmail setup at `/setup/gmail`

### Other Platforms

The app can be deployed anywhere that supports Next.js:

- Railway
- Render
- Docker
- Self-hosted

## Database Schema

```prisma
model User           # User accounts (Google OAuth)
model Session        # Active sessions
model Account        # OAuth account links
model RecentInbox    # User's recent inbox history
model CachedEmail    # Cached email content & read status
model GmailConfig    # Gmail API refresh token (single row)
```

## API Routes

| Route                 | Method | Description           |
| --------------------- | ------ | --------------------- |
| `/api/auth/*`         | ALL    | Better Auth endpoints |
| `/api/gmail/callback` | GET    | Gmail OAuth callback  |

## Server Actions

| Action                    | Description               |
| ------------------------- | ------------------------- |
| `getEmailsAction`         | Fetch emails for an inbox |
| `addRecentEmailAction`    | Save inbox to history     |
| `markEmailAsReadAction`   | Mark email as read        |
| `clearRecentEmailsAction` | Clear inbox history       |

## Environment Variables

| Variable               | Required | Description                  |
| ---------------------- | -------- | ---------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string |
| `BETTER_AUTH_SECRET`   | Yes      | Secret for token signing     |
| `BETTER_AUTH_URL`      | Yes      | Base URL of the app          |
| `GOOGLE_CLIENT_ID`     | Yes      | Google OAuth client ID       |
| `GOOGLE_CLIENT_SECRET` | Yes      | Google OAuth client secret   |
| `ALLOWED_DOMAINS`      | Yes      | Comma-separated domains      |
| `EMAIL_EXPIRY_HOURS`   | No       | Email expiry (default: 24)   |
| `GMAIL_LABEL`          | No       | Filter emails by label       |

## Logging

The app includes server-side logging with color-coded output:

```
[2024-12-30T10:00:00.000Z] [INFO ] [USER] Inbox accessed {"userId":"...","address":"test@domain.com"}
[2024-12-30T10:00:01.000Z] [INFO ] [GMAIL] Gmail configuration saved {"email":"catch-all@gmail.com"}
[2024-12-30T10:00:02.000Z] [ERROR] Gmail authentication error {"error":"invalid_grant"}
```

## Security Considerations

- HTML emails are sanitized using DOMPurify
- Gmail refresh token stored encrypted in database
- User sessions managed by Better Auth
- Input validation with Zod schemas
- CORS handled by Next.js

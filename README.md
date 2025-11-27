# Unosend - Email API for Developers

One API. Infinite Emails. An email sending API service with competitive pricing and higher limits.

## Features

- 🚀 **High Performance** - Send emails in milliseconds
- 💰 **Competitive Pricing** - 100K free emails/month
- 🔐 **Secure Authentication** - Supabase Auth with OAuth support
- 📊 **Real-time Analytics** - Track opens, clicks, bounces
- 🌐 **Custom Domains** - Send from your own domain
- 🔑 **API Keys** - Secure API authentication with `un_` prefix
- 📧 **Email Events** - Webhooks for email tracking
- 👥 **Team Management** - Organizations and roles

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Email Sending**: AWS SES / Nodemailer SMTP

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- AWS SES account (or SMTP server)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/unosend.git
cd unosend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Provider (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

5. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## API Reference

### Authentication

All API requests require a Bearer token:

```bash
Authorization: Bearer re_xxxxxxxxxxxxx
```

### Endpoints

#### Send Email

```bash
POST /api/v1/emails
```

Request body:

```json
{
  "from": "hello@yourdomain.com",
  "to": "user@example.com",
  "subject": "Hello World",
  "html": "<p>Welcome!</p>",
  "text": "Welcome!"
}
```

Response:

```json
{
  "id": "email-uuid",
  "from": "hello@yourdomain.com",
  "to": ["user@example.com"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### List Emails

```bash
GET /api/v1/emails?limit=10&offset=0
```

#### Get Email Details

```bash
GET /api/v1/emails/:id
```

#### Create API Key

```bash
POST /api/v1/api-keys
```

#### Revoke API Key

```bash
DELETE /api/v1/api-keys/:id
```

#### Add Domain

```bash
POST /api/v1/domains
```

#### List Domains

```bash
GET /api/v1/domains
```

## Project Structure

```
mailsend/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── api/v1/           # API routes
│   └── auth/             # Auth callback
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── supabase/         # Supabase clients
│   └── *.ts              # Utilities
├── supabase/
│   └── migrations/       # Database migrations
└── types/                # TypeScript types
```

## Pricing

| Plan | Price | Emails/Month | Domains |
|------|-------|--------------|---------|
| Free | $0 | 100,000 | 1 |
| Pro | $20 | 500,000 | 10 |
| Enterprise | Custom | Unlimited | Unlimited |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## License

MIT License

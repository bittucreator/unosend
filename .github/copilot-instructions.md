# Unosend - Email API Service

This is Unosend - an email sending API service with competitive pricing and high limits. "One API. Infinite Emails."

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Email Sending**: AWS SES / Nodemailer SMTP

## Project Structure

```
unosend/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   └── api/              # API routes
│       └── v1/           # Versioned API
├── components/           # React components
├── lib/                  # Utilities and helpers
├── supabase/             # Database migrations
└── public/               # Static assets
```

## Development Guidelines

- Use Server Components by default, Client Components only when needed
- Follow REST API best practices for the email API
- Implement proper rate limiting and usage tracking
- Use Supabase for all database operations
- Keep components modular and reusable

## API Authentication

- API keys should be prefixed with `un_` for identification
- Keys should be hashed before storage
- Include rate limiting headers in API responses

## Getting Started

1. Install dependencies: `npm install`
2. Setup environment variables in `.env.local`
3. Run Supabase migrations in SQL Editor
4. Start development server: `npm run dev`

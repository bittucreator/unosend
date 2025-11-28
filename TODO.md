# Unosend - TODO

## 🔧 Features to Add

### High Priority

- [x] **Scheduled Broadcast Processing**
  - Created cron job endpoint `/api/cron/broadcasts`
  - Checks `broadcasts` table for `scheduled_at` in the past with `status = 'scheduled'`
  - Process and update status to 'sending' → 'sent'
  - Added `vercel.json` for cron schedule (every 5 minutes)

- [x] **Email Preview & Test Send**
  - Added "Send Test" button component
  - Created `/api/v1/emails/test` endpoint
  - Sends preview to user's email with [TEST] prefix
  - Variable substitution preview

- [x] **Unsubscribe Management**
  - Public unsubscribe page: `/unsubscribe/[token]`
  - One-click unsubscribe API endpoint
  - Updates contact `subscribed` status
  - Token-based verification

- [x] **Email Bounces/Complaints Handling**
  - AWS SES SNS webhook endpoint `/api/webhooks/ses`
  - Handles bounce notifications
  - Handles complaint notifications
  - Auto-unsubscribes hard bounces
  - Updates email status accordingly

### Medium Priority

- [x] **Email Analytics Dashboard**
  - Already exists in `/metrics` page
  - Delivery rate chart
  - Open/click rate trends
  - Daily/hourly volume charts

- [x] **Search & Filtering**
  - Created `SearchFilter` component
  - Ready to integrate into pages
  - Filter emails by status, date range
  - Search templates by name

- [x] **Export Data**
  - Export contacts to CSV/JSON `/api/v1/contacts/export`
  - Export email logs to CSV/JSON `/api/v1/emails/export`
  - Created `ExportButton` component

- [x] **API Rate Limiting Dashboard**
  - Created `/api/v1/usage` endpoint
  - Shows current rate limit usage
  - Historical API usage data
  - Per-plan rate limits

### Low Priority

- [ ] **Two-Factor Authentication (2FA)**
  - TOTP-based 2FA (Google Authenticator)
  - Backup codes
  - Recovery options
  - Enforce 2FA for team members

- [x] **Dark Mode Support**
  - Added theme toggle in top nav
  - Installed next-themes
  - System preference detection
  - Persists user preference

- [ ] **Email Builder Enhancements**
  - Drag-and-drop email builder
  - Pre-built template library
  - Image upload in editor
  - Mobile preview

- [ ] **Advanced Segmentation**
  - Create segments based on contact metadata
  - Engagement-based segments (opened, clicked)
  - Dynamic segments (auto-update)

- [ ] **A/B Testing**
  - Subject line testing
  - Content testing
  - Send time optimization
  - Winner auto-selection

- [ ] **Automation/Workflows**
  - Welcome email sequences
  - Drip campaigns
  - Trigger-based emails
  - Visual workflow builder

---

## 🐛 Bug Fixes / Improvements

- [ ] Add loading states to all forms
- [ ] Improve error messages
- [ ] Add confirmation dialogs for destructive actions
- [ ] Optimize database queries
- [ ] Add pagination to all lists
- [ ] Mobile responsiveness improvements

---

## 🧪 Testing

- [ ] Unit tests for API routes
- [ ] Integration tests for email sending
- [ ] E2E tests for critical flows
- [ ] Load testing for API

---

## 📚 Documentation

- [ ] API reference improvements
- [ ] SDK documentation
- [ ] Webhook events documentation
- [ ] Integration guides (Node.js, Python, etc.)
- [ ] Video tutorials

---

## 🚀 Deployment / DevOps

- [ ] Set up production environment
- [ ] Configure AWS SES for production
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for assets
- [ ] Set up backup strategy
- [ ] CI/CD pipeline

---

## ✅ Completed

- [x] Dashboard overview
- [x] API Keys management
- [x] Audiences & Contacts (with CSV import)
- [x] Templates (create, edit, list)
- [x] Broadcasts (create, edit, schedule, send)
- [x] Domains (add, DNS verification)
- [x] Emails list & view
- [x] Logs
- [x] Webhooks (with retries)
- [x] Settings (profile, workspace, billing, members)
- [x] Storage (avatars, workspace logos)
- [x] Team invites
- [x] Email tracking (opens, clicks)
- [x] Authentication (login, signup, password reset)
- [x] Documentation pages
- [x] Billing integration (Dodo Payments)

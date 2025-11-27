import { z } from 'zod'

// Email sending schema
export const sendEmailSchema = z.object({
  from: z.string().email('Invalid from email'),
  to: z.union([
    z.string().email('Invalid to email'),
    z.array(z.string().email('Invalid to email'))
  ]),
  cc: z.union([
    z.string().email('Invalid cc email'),
    z.array(z.string().email('Invalid cc email'))
  ]).optional(),
  bcc: z.union([
    z.string().email('Invalid bcc email'),
    z.array(z.string().email('Invalid bcc email'))
  ]).optional(),
  reply_to: z.string().email('Invalid reply_to email').optional(),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // Base64 encoded
    content_type: z.string().optional()
  })).optional(),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional()
}).refine(data => data.html || data.text, {
  message: 'Either html or text content is required'
})

// API Key creation schema
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100)
})

// Domain creation schema
export const createDomainSchema = z.object({
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain format')
})

// Webhook creation schema
export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum([
    'email.sent',
    'email.delivered',
    'email.bounced',
    'email.opened',
    'email.clicked',
    'email.complained',
    'email.unsubscribed'
  ])).min(1, 'At least one event is required')
})

// User signup schema
export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required').optional()
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

export type SendEmailInput = z.infer<typeof sendEmailSchema>
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type CreateDomainInput = z.infer<typeof createDomainSchema>
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>

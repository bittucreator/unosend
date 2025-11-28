import nodemailer from 'nodemailer'
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'
import type { SendEmailInput } from './validations'

// Email provider interface
interface EmailProvider {
  send(email: EmailPayload): Promise<{ messageId: string }>
}

interface EmailPayload {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

// AWS SES Provider
class SesProvider implements EmailProvider {
  private client: SESClient
  private transporter: nodemailer.Transporter

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })

    // Use nodemailer to build the raw email, then send via SES
    this.transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
    })
  }

  async send(email: EmailPayload): Promise<{ messageId: string }> {
    // Build the raw email using nodemailer
    const mailOptions = {
      from: email.from,
      to: email.to.join(', '),
      cc: email.cc?.join(', '),
      bcc: email.bcc?.join(', '),
      replyTo: email.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: email.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    }

    // Get the raw email message
    const info = await this.transporter.sendMail(mailOptions)
    const rawMessage = await streamToBuffer(info.message)

    // Send via SES
    const command = new SendRawEmailCommand({
      RawMessage: { Data: rawMessage },
      Source: email.from,
      Destinations: [
        ...email.to,
        ...(email.cc || []),
        ...(email.bcc || []),
      ],
    })

    const response = await this.client.send(command)

    return { messageId: response.MessageId || crypto.randomUUID() }
  }
}

// Helper to convert stream to buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// SMTP Provider using Nodemailer (fallback)
class SmtpProvider implements EmailProvider {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async send(email: EmailPayload): Promise<{ messageId: string }> {
    const result = await this.transporter.sendMail({
      from: email.from,
      to: email.to.join(', '),
      cc: email.cc?.join(', '),
      bcc: email.bcc?.join(', '),
      replyTo: email.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: email.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    })

    return { messageId: result.messageId }
  }
}

// Email service class
class EmailService {
  private provider: EmailProvider

  constructor() {
    // Use AWS SES if configured, otherwise fall back to SMTP
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.provider = new SesProvider()
    } else {
      this.provider = new SmtpProvider()
    }
  }

  async sendEmail(
    input: SendEmailInput, 
    fromName?: string,
    options?: { emailId?: string; trackOpens?: boolean; trackClicks?: boolean }
  ): Promise<{ id: string; messageId: string }> {
    const toEmails = Array.isArray(input.to) ? input.to : [input.to]
    const ccEmails = input.cc ? (Array.isArray(input.cc) ? input.cc : [input.cc]) : undefined
    const bccEmails = input.bcc ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]) : undefined

    const fromAddress = fromName ? `${fromName} <${input.from}>` : input.from

    // Convert base64 attachments to buffers
    const attachments = input.attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.content_type,
    }))

    // Inject tracking if enabled
    let html = input.html
    if (html && options?.emailId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unosend.com'
      
      // Inject open tracking pixel
      if (options.trackOpens !== false) {
        const trackingPixel = `<img src="${baseUrl}/api/v1/track/open/${options.emailId}" width="1" height="1" alt="" style="display:none;visibility:hidden;width:1px;height:1px;opacity:0;border:0;" />`
        
        // Insert before closing body tag, or append to end
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${trackingPixel}</body>`)
        } else {
          html = html + trackingPixel
        }
      }
      
      // Wrap links for click tracking
      if (options.trackClicks !== false) {
        html = this.wrapLinksForTracking(html, options.emailId, baseUrl)
      }
    }

    const result = await this.provider.send({
      from: fromAddress,
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      replyTo: input.reply_to,
      subject: input.subject,
      html,
      text: input.text,
      attachments,
    })

    return {
      id: options?.emailId || crypto.randomUUID(),
      messageId: result.messageId,
    }
  }

  // Wrap all links in HTML with click tracking redirects
  private wrapLinksForTracking(html: string, emailId: string, baseUrl: string): string {
    // Match href="..." or href='...' but exclude mailto: and tel: links
    const linkRegex = /href=["'](?!mailto:|tel:)(https?:\/\/[^"']+)["']/gi
    
    return html.replace(linkRegex, (match, url) => {
      const encodedUrl = encodeURIComponent(url)
      const trackingUrl = `${baseUrl}/api/v1/track/click/${emailId}?url=${encodedUrl}`
      return `href="${trackingUrl}"`
    })
  }
}

export const emailService = new EmailService()

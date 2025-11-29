import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://unosend.com'),
  title: {
    default: 'Unosend - Email API for Developers | One API. Infinite Emails.',
    template: '%s | Unosend',
  },
  description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability. Simple REST API, competitive pricing, and 100,000 free emails/month. Build email features in minutes with our developer-friendly SDK.',
  keywords: [
    // Primary Keywords
    'email API',
    'email API for developers',
    'email sending API',
    'transactional email API',
    'marketing email API',
    'email delivery API',
    'REST email API',
    'email service API',
    'cloud email API',
    'email automation API',
    
    // Transactional Email
    'transactional email',
    'transactional email service',
    'transactional email platform',
    'send transactional emails',
    'automated transactional emails',
    'order confirmation emails',
    'password reset emails',
    'welcome emails',
    'notification emails',
    'receipt emails',
    'invoice emails',
    
    // Marketing Email
    'marketing email',
    'marketing email service',
    'email marketing platform',
    'bulk email sending',
    'mass email service',
    'email campaigns',
    'newsletter service',
    'email broadcast',
    'promotional emails',
    'drip campaigns',
    
    // Email Infrastructure
    'email infrastructure',
    'email delivery infrastructure',
    'email sending infrastructure',
    'scalable email service',
    'reliable email delivery',
    'high deliverability email',
    'email delivery service',
    'email relay service',
    'outbound email service',
    
    // Developer Focus
    'developer email',
    'developer email API',
    'developer friendly email',
    'email SDK',
    'email API SDK',
    'Node.js email',
    'Python email API',
    'React email',
    'Next.js email',
    'JavaScript email API',
    'TypeScript email',
    'PHP email API',
    'Ruby email API',
    'Go email API',
    'email webhooks',
    'email events API',
    
    // SMTP
    'SMTP API',
    'SMTP service',
    'SMTP relay',
    'SMTP gateway',
    'cloud SMTP',
    'SMTP provider',
    'SMTP email service',
    'SMTP as a service',
    
    // Email Features
    'email templates',
    'email template API',
    'HTML email',
    'responsive email',
    'email personalization',
    'dynamic email content',
    'email variables',
    'email tracking',
    'email analytics',
    'email open tracking',
    'email click tracking',
    'email bounce handling',
    'email deliverability',
    'email validation',
    'email verification',
    
    // Use Cases
    'send emails programmatically',
    'automated emails',
    'trigger based emails',
    'event driven emails',
    'real time email',
    'instant email delivery',
    'scheduled emails',
    'batch email sending',
    'high volume email',
    'enterprise email',
    'SaaS email',
    'startup email service',
    'ecommerce email',
    'app email notifications',
    
    // Competitor Alternatives
    'Resend alternative',
    'SendGrid alternative',
    'Mailgun alternative',
    'Postmark alternative',
    'Amazon SES alternative',
    'Mailchimp transactional alternative',
    'Mandrill alternative',
    'SparkPost alternative',
    'Mailjet alternative',
    'Sendinblue alternative',
    'Brevo alternative',
    'email API alternative',
    'better than SendGrid',
    'cheaper than Resend',
    
    // Extended Competitor Alternatives
    'Resend vs Unosend',
    'SendGrid vs Unosend',
    'Mailgun vs Unosend',
    'Postmark vs Unosend',
    'Amazon SES vs Unosend',
    'Mailchimp vs Unosend',
    'best Resend alternative',
    'best SendGrid alternative',
    'best Mailgun alternative',
    'best Postmark alternative',
    'best Amazon SES alternative',
    'best Mandrill alternative',
    'Resend competitor',
    'SendGrid competitor',
    'Mailgun competitor',
    'Postmark competitor',
    'switch from Resend',
    'switch from SendGrid',
    'switch from Mailgun',
    'switch from Postmark',
    'switch from Amazon SES',
    'migrate from Resend',
    'migrate from SendGrid',
    'migrate from Mailgun',
    'migrate from Postmark',
    'Resend replacement',
    'SendGrid replacement',
    'Mailgun replacement',
    'Postmark replacement',
    'cheaper than SendGrid',
    'cheaper than Mailgun',
    'cheaper than Postmark',
    'cheaper than Amazon SES',
    'better than Resend',
    'better than Mailgun',
    'better than Postmark',
    'better than Amazon SES',
    'faster than Resend',
    'faster than SendGrid',
    'easier than SendGrid',
    'simpler than Mailgun',
    'Resend pricing alternative',
    'SendGrid pricing alternative',
    'Mailgun pricing alternative',
    'free Resend alternative',
    'free SendGrid alternative',
    'free Mailgun alternative',
    'Resend free tier alternative',
    'SendGrid free tier alternative',
    'Twilio SendGrid alternative',
    'Twilio email alternative',
    'Mailchimp Transactional alternative',
    'Elastic Email alternative',
    'Pepipost alternative',
    'Netcore alternative',
    'SMTP2GO alternative',
    'Mailtrap alternative',
    'Customer.io alternative',
    'Klaviyo email alternative',
    'Loops alternative',
    'Plunk alternative',
    'ConvertKit alternative',
    'Buttondown alternative',
    'MailerSend alternative',
    'MailerLite alternative',
    'Moosend alternative',
    'Omnisend alternative',
    'Drip alternative',
    'ActiveCampaign alternative',
    'GetResponse alternative',
    'AWeber alternative',
    'Constant Contact alternative',
    'Campaign Monitor alternative',
    'Zoho Mail alternative',
    'Zoho Campaigns alternative',
    'HubSpot email alternative',
    'Intercom email alternative',
    'Crisp email alternative',
    
    // Pricing Related
    'free email API',
    'cheap email API',
    'affordable email service',
    'email API pricing',
    'pay as you go email',
    'email API free tier',
    'free transactional email',
    '100000 free emails',
    'low cost email service',
    'budget email API',
    
    // Technical Terms
    'RESTful email API',
    'JSON email API',
    'email API integration',
    'email microservice',
    'email API documentation',
    'email API examples',
    'email API tutorial',
    'how to send email API',
    'programmatic email',
    'code email sending',
    
    // Regions
    'email API India',
    'email service India',
    'global email delivery',
    'worldwide email service',
    'international email API',
    'US email API',
    'Europe email API',
    'Asia email API',
    
    // Quality & Trust
    '99.9% deliverability',
    'high inbox placement',
    'email deliverability rate',
    'trusted email service',
    'secure email API',
    'GDPR compliant email',
    'enterprise grade email',
    'production ready email',
    
    // Business Types
    'email for startups',
    'email for developers',
    'email for SaaS',
    'email for apps',
    'email for businesses',
    'email for enterprises',
    'email for agencies',
    'email for ecommerce',
    
    // Features
    'email domains',
    'custom email domain',
    'dedicated IP email',
    'email API keys',
    'email rate limiting',
    'email queuing',
    'email retry logic',
    'email logging',
    'email debugging',
    'email testing',
    
    // Long Tail
    'best email API 2024',
    'best email API 2025',
    'modern email API',
    'simple email API',
    'easy email integration',
    'quick email setup',
    'email API getting started',
    'send email from app',
    'send email from website',
    'send email from server',
    'backend email service',
    'serverless email',
    'email lambda function',
    'email cloud function',
    
    // Action Keywords
    'send emails',
    'deliver emails',
    'email notifications',
    'email alerts',
    'email reminders',
    'email confirmations',
    'email receipts',
    'email updates',
    
    // Brand
    'Unosend',
    'Unosend API',
    'Unosend email',
    'uno send',
    'one API infinite emails',
  ],
  authors: [{ name: 'Unosend' }],
  creator: 'Unosend',
  publisher: 'Unosend',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unosend.com',
    siteName: 'Unosend',
    title: 'Unosend - Email API for Developers',
    description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability. 100,000 free emails/month.',
    images: [
      {
        url: '/OG.png',
        width: 1200,
        height: 630,
        alt: 'Unosend - Email API for Developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unosend - Email API for Developers',
    description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability.',
    images: ['/OG.png'],
    creator: '@unosend',
  },
  verification: {
    google: 'GY7qDiDeOLmwDlUgYE1M6CJd9L27cTUlDvZvMQi10gQ',
  },
  alternates: {
    canonical: 'https://unosend.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Unosend',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability.',
    url: 'https://unosend.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: '100,000 free emails per month',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '500',
    },
  }

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Unosend',
    url: 'https://unosend.com',
    logo: 'https://unosend.com/Logo.svg',
    description: 'Email API for developers. One API. Infinite Emails.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/unosend',
      'https://github.com/unosend',
      'https://linkedin.com/company/unosend',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://unosend.com/contact',
      availableLanguage: ['English'],
    },
  }

  // WebSite Schema for Sitelinks Search Box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Unosend',
    url: 'https://unosend.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://unosend.com/docs?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // Product Schema for Rich Results
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Unosend Email API',
    description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability.',
    brand: {
      '@type': 'Brand',
      name: 'Unosend',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '5,000 emails/month, 1,000 contacts',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '20',
        priceCurrency: 'USD',
        description: '50,000 emails/month, 10,000 contacts',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Scale Plan',
        price: '100',
        priceCurrency: 'USD',
        description: '200,000 emails/month, 25,000 contacts',
        availability: 'https://schema.org/InStock',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Developer' },
        reviewRating: { '@type': 'Rating', ratingValue: '5' },
        reviewBody: 'Best email API I have ever used. Simple, fast, and reliable.',
      },
    ],
  }

  // FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Unosend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unosend is an email API service for developers. It allows you to send transactional and marketing emails with 99.9% deliverability using a simple REST API.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many free emails can I send?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unosend offers 5,000 free emails per month on the free plan. No credit card required to get started.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Unosend better than Resend or SendGrid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unosend offers competitive pricing, higher free tier limits, and a simpler API compared to alternatives like Resend and SendGrid. With 99.9% deliverability and developer-friendly SDKs, many developers prefer Unosend.',
        },
      },
      {
        '@type': 'Question',
        name: 'What programming languages are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unosend provides official SDKs for Node.js, Python, PHP, Ruby, and Go. You can also use our REST API with any programming language.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast is email delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most emails are delivered within seconds. Unosend uses optimized infrastructure to ensure fast and reliable email delivery worldwide.',
        },
      },
    ],
  }

  // HowTo Schema for Quickstart
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Send Emails with Unosend API',
    description: 'Learn how to send transactional emails using the Unosend API in just 3 steps.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Sign up and get API key',
        text: 'Create a free Unosend account and generate your API key from the dashboard.',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Install the SDK',
        text: 'Install the Unosend SDK for your programming language using npm, pip, or composer.',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Send your first email',
        text: 'Use the SDK to send your first email with just a few lines of code.',
        position: 3,
      },
    ],
    totalTime: 'PT5M',
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://eczrfummycqplrgwobsz.supabase.co" />
        <meta name="theme-color" content="#fafafa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

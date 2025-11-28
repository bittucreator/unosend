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
  description: 'The best email API for developers. Send transactional and marketing emails with 99.9% deliverability. Simple REST API, competitive pricing, and 100,000 free emails/month.',
  keywords: [
    'email API',
    'transactional email',
    'email service',
    'developer email',
    'SMTP API',
    'email infrastructure',
    'email delivery',
    'marketing email',
    'email automation',
    'Resend alternative',
    'SendGrid alternative',
    'Mailgun alternative',
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
    icon: '/Fav icon.svg',
    shortcut: '/Fav icon.svg',
    apple: '/Fav icon.svg',
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
        url: '/og-image.png',
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
    images: ['/og-image.png'],
    creator: '@unosend',
  },
  verification: {
    google: 'your-google-verification-code',
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

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

import { type Metadata } from 'next'
import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'
import Script from "next/script";

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  icons: { icon: '/favicon.ico' },
  title: {
    template: '%s - AT Protocol',
    default: 'AT Protocol',
  },
  alternates: {
    types: {
      'application/atom+xml': '/feed.xml',
      'application/rss+xml': '/rss.xml',
      'application/feed+json': '/feed.json',
    },
  },
  openGraph: {
    url: 'https://atproto.com/',
    siteName: 'AT Protocol',
    type: 'website',
    images: [
      {
        url: 'https://atproto.com/default-social-card.png',
        secureUrl: 'https://atproto.com/default-social-card.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: {
      url: 'https://atproto.com/default-social-card.png',
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={params.locale} className="h-full" suppressHydrationWarning>
      <head>
        <Script
          src="https://widget.kapa.ai/kapa-widget.bundle.js"
          data-website-id="918051fd-2626-4b70-b124-e12c71999dea"
          data-project-name="atproto"
          data-project-color="#000000"
          data-project-logo="https://atproto.com/favicon.ico"
          data-button-text="AI"
          data-button-text-font-family="Consolas, SF Mono, monospace"
          data-modal-ask-ai-input-placeholder="Find solutions from the docs, Github, forums, and more..."
          async
        />
      </head>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}

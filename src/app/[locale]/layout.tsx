import { type Metadata } from 'next'
import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
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

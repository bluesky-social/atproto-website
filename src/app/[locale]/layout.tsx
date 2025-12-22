import { type Metadata } from 'next'
import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: {
    template: '%s - AT Protocol',
    default: 'AT Protocol',
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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
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

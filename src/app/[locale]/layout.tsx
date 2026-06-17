import { type Metadata } from 'next'
import { resolveSiteOrigin } from '@/lib/site-url'
import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'
import Script from "next/script";

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  // Base for resolving relative metadata URLs — notably the per-route
  // `opengraph-image` file convention, which needs this to emit an absolute
  // og:image URL. Resolves to the canonical origin in production and to the
  // preview's own URL on Render PR deploys (so preview OG images self-
  // reference instead of pointing at production). Relative URLs below resolve
  // against this.
  metadataBase: new URL(resolveSiteOrigin()),
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
    // Relative URLs resolve against metadataBase, so these follow the
    // environment (canonical in prod, the preview URL on Render PR deploys).
    url: '/',
    siteName: 'AT Protocol',
    type: 'website',
    images: [
      {
        url: '/default-social-card.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    // No explicit image: X falls back to og:image, so per-route
    // opengraph-image files (and the openGraph default above) carry through
    // to the Twitter card without duplicating image config here.
    card: 'summary_large_image',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <html lang={(await params).locale} className="h-full" suppressHydrationWarning>
      <head>
        <Script
          src="https://widget.kapa.ai/kapa-widget.bundle.js"
          data-website-id="918051fd-2626-4b70-b124-e12c71999dea"
          data-project-name="atproto"
          data-project-color="#000000"
          data-project-logo="https://atproto.com/favicon.ico"
          data-modal-ask-ai-input-placeholder="Find solutions from the docs, Github, forums, and more..."
          data-button-hide="true"
          data-mcp-enabled="true"
          data-mcp-server-url="https://atproto.mcp.kapa.ai"
          data-mcp-dropdown-description="Use atproto via [MCP](https://modelcontextprotocol.io/introduction)"
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

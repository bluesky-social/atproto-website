import { type Metadata } from 'next'
import glob from 'fast-glob'

import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'
import { type Section } from '@/components/SectionProvider'

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
  let pages = await glob('**/*.mdx', { cwd: 'src/app/[locale]' })
  let allSectionsEntries = (await Promise.all(
    pages.map(async (filename) => [
      '/' + filename.replace(/(^|\/)page\.mdx$/, ''),
      (await import(`./${filename}`)).sections,
    ]),
  )) as Array<[string, Array<Section>]>
  let allSections = Object.fromEntries(allSectionsEntries)

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}

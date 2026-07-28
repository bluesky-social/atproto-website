import type { Metadata } from 'next'
import '@/styles/tailwind.css'

// Studio is a dev-only authoring tool, intentionally decoupled from the public
// site: it has its OWN root layout (no global nav/header chrome from
// [locale]/layout.tsx) and is excluded from the i18n proxy (see src/proxy.js),
// so it always lives at /studio/* with no locale prefix.
//
// Uses the site's own typefaces (IBM Plex Sans / IBM Plex Mono, from
// tailwind.config) in a monochrome black-on-white theme.
export const metadata: Metadata = {
  title: 'Studio',
}

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-white font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  )
}

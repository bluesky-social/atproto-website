import type { Metadata } from 'next'
import '@/styles/tailwind.css'

// Studio is a dev-only authoring tool, intentionally decoupled from the public
// site: it has its OWN root layout (no global nav/header chrome from
// [locale]/layout.tsx) and is excluded from the i18n proxy (see src/proxy.js),
// so it always lives at /studio/* with no locale prefix.
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
      <head>
        {/* Editorial display serif. Decoupled from the site, so this link only
            affects /studio and won't touch the public pages. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .font-display {
            font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
            font-optical-sizing: auto;
          }
          .studio-paper {
            background-color: #faf8f3;
            background-image:
              radial-gradient(circle at 1px 1px, rgba(120,113,108,0.06) 1px, transparent 0);
            background-size: 22px 22px;
          }
          .studio-body textarea::placeholder,
          .studio-body input::placeholder { color: #a8a29e; }
        `}</style>
      </head>
      <body className="studio-body studio-paper h-full font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}

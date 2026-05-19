import { type Metadata } from 'next'

// Overrides the root layout's blog-feed alternates for the /off-protocol
// subtree. Podcatchers and RSS readers that auto-discover from <head>
// will pick up the podcast feed instead of the blog feeds when someone
// pastes a podcast page URL.
export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/off-protocol/rss.xml', title: 'Off Protocol' },
      ],
    },
  },
}

export default function OffProtocolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

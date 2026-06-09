// Server wrapper for the subscribe dropdown. Derives the canonical feed
// URL from the incoming request (honoring X-Forwarded-Host behind reverse
// proxies like Render / Cloudflare Pages) and hands it off to the client
// component that renders the dropdown UI and handles clipboard interaction.
import { headers } from 'next/headers'
import { SHOW } from '@/lib/episodes'
import { SubscribeMenu } from './SubscribeMenu'

async function deriveFeedUrl(): Promise<string> {
  const h = await headers()
  const forwardedHost = h.get('x-forwarded-host')
  const host = forwardedHost ?? h.get('host')
  if (!host) return SHOW.feedUrl
  const proto = h.get('x-forwarded-proto') ?? (forwardedHost ? 'https' : 'http')
  return `${proto}://${host}/off-protocol/rss.xml`
}

export async function SubscribeLinks({ className }: { className?: string }) {
  return (
    <SubscribeMenu
      feedUrl={await deriveFeedUrl()}
      directory={SHOW.subscribe}
      className={className}
    />
  )
}

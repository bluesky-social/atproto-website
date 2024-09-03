import nextMDX from '@next/mdx'

import { recmaPlugins } from './src/mdx/recma.mjs'
import { rehypePlugins } from './src/mdx/rehype.mjs'
import { remarkPlugins } from './src/mdx/remark.mjs'
import withSearch from './src/mdx/search.mjs'

const withMDX = nextMDX({
  options: {
    remarkPlugins,
    rehypePlugins,
    recmaPlugins,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  async redirects() {
    return [
      {
        source: '/guides',
        destination: '/docs',
        permanent: false,
      },
      {
        source: '/specs',
        destination: '/docs',
        permanent: false,
      },
      {
        source: '/lexicons',
        destination: '/docs',
        permanent: false,
      },
      // legacy docs
      {
        source: '/faq',
        destination: 'https://atproto.com/guides/faq',
        permanent: false,
      },
      {
        source: '/specs/did-plc',
        destination: 'https://github.com/did-method-plc/did-method-plc',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-admin',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-identity',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-label',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-moderation',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-repo',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-server',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-sync',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/com-atproto-sync',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-actor',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-embed',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-feed',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-graph',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-notification',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/lexicons/app-bsky-richtext',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      // redirects to Bluesky API docs site
      {
        source: '/community',
        destination: 'https://docs.bsky.app/showcase',
        permanent: false,
      },
      {
        source: '/community/quick-start',
        destination: 'https://docs.bsky.app/docs/get-started',
        permanent: false,
      },
      {
        source: '/community/projects',
        destination: 'https://docs.bsky.app/showcase',
        permanent: false,
      },
      {
        source: '/community/groups',
        destination: 'https://docs.bsky.app/showcase',
        permanent: false,
      },
      {
        source: '/blog',
        destination: 'https://docs.bsky.app/blog',
        permanent: false,
      },
      {
        source: '/blog/feature-bridgyfed',
        destination: 'https://docs.bsky.app/blog/feature-bridgyfed',
        permanent: false,
      },
      {
        source: '/blog/repo-export',
        destination: 'https://docs.bsky.app/blog/repo-export',
        permanent: false,
      },
      {
        source: '/blog/2023-protocol-roadmap',
        destination: 'https://docs.bsky.app/blog/protocol-roadmap',
        permanent: false,
      },
      {
        source: '/blog/building-on-atproto',
        destination: 'https://docs.bsky.app/blog/building-on-atproto',
        permanent: false,
      },
      {
        source: '/blog/bgs-and-did-doc',
        destination: 'https://docs.bsky.app/blog/bgs-and-did-doc',
        permanent: false,
      },
      {
        source: '/blog/rate-limits-pds-v3',
        destination: 'https://docs.bsky.app/blog/rate-limits-pds-v3',
        permanent: false,
      },
      {
        source: '/blog/repo-sync-update',
        destination: 'https://docs.bsky.app/blog/repo-sync-update',
        permanent: false,
      },
      {
        source: '/blog/create-post',
        destination: 'https://docs.bsky.app/docs/advanced-guides/posts',
        permanent: false,
      },
      {
        source: '/blog/feature-skyfeed',
        destination: 'https://docs.bsky.app/blog/feature-skyfeed',
        permanent: false,
      },
      {
        source: '/blog/call-for-developers',
        destination: 'https://docs.bsky.app/blog/call-for-developers',
        permanent: false,
      },
      {
        source: '/blog/federation-developer-sandbox',
        destination: 'https://docs.bsky.app/blog/federation-sandbox',
        permanent: false,
      },
      {
        source: '/blog/block-implementation',
        destination: 'https://docs.bsky.app/blog/block-implementation',
        permanent: false,
      },
    ]
  },
}

export default withSearch(withMDX(nextConfig))

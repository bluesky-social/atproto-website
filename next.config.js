/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
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
        source: '/lexicons/atproto-com',
        destination: '/lexicons/com-atproto',
        permanent: false,
      },
      {
        source: '/lexicons/bsky-app',
        destination: '/lexicons/app-bsky',
        permanent: false,
      },
      {
        source: '/faq',
        destination: 'https://atproto.com/guides/faq',
        permanent: false,
      },
      {
        source: '/specs/did-plc',
        destination: 'https://github.com/bluesky-social/did-method-plc',
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
      }
    ]
  },
}


module.exports = nextConfig

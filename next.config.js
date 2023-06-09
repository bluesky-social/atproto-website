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
        destination: '/lexicons/com-atproto-identity',
        permanent: false,
      },
      {
        source: '/lexicons/bsky-app',
        destination: '/lexicons/app-bsky-actor',
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
    ]
  },
}


module.exports = nextConfig

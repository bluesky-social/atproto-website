/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
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
    ]
  },
}


module.exports = nextConfig

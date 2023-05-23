import Head from 'next/head'

export default function Meta({ title, description, image }) {
  title = title ? `${title} | AT Protocol` : 'The AT Protocol'
  description =
    description || 'A social networking technology created by Bluesky.'
  return (
    <Head>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:type" content="article" />
      <meta
        property="og:image"
        content={`https://atproto.com/img/${
          image || 'default-social-card.jpg'
        }`}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        property="twitter:image"
        content={`https://atproto.com/img/${
          image || 'default-social-card.jpg'
        }`}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}

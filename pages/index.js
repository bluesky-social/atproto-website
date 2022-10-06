import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import PreviewWarning from '../components/preview-warning'
import Hero from '../components/hero'
import HomeLinks from '../components/home-links'
import Roadmap from '../components/roadmap'

export default function Home() {
  return (
    <div>
      <Head>
        <title>at:// protocol</title>
        <meta name="description" content="" />
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
      <Header />
      <Hero />
      <PreviewWarning />
      <HomeLinks />
      <div className="max-w-lg mx-auto px-5 mb-16">
        <Roadmap />
      </div>
      <Footer />
    </div>
  )
}

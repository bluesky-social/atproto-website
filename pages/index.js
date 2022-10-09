import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/header'
import Footer from '../components/footer'
import PreviewWarning from '../components/preview-warning'
import Hero from '../components/hero'
import HomeLinks from '../components/home-links'
import Roadmap from '../components/roadmap'
import CTA from '../components/cta'

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
      <div className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-lg font-semibold text-blue-600">Introducing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Social Internet
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
            Connect to friends, family, and communities without ever being
            locked into a service. The <code>at://</code> protocol puts you in
            control of your online world.
          </p>
          <div className="mt-12">
            <HomeLinks />
          </div>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mb-24">
        <h3 className="text-center text-3xl mb-8 font-bold">Roadmap</h3>
        <Roadmap />
        <div className="text-center mt-8">
          <Link href="/roadmap">
            <a href="/roadmap" className="text-blue-600 hover:underline">
              Learn more
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </Link>
        </div>
      </div>
      <CTA />
      <Footer />
    </div>
  )
}

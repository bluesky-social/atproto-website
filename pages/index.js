import Link from 'next/link'
import Meta from '../components/meta'
import Header from '../components/header'
import Footer from '../components/footer'
import Hero from '../components/hero'
import Roadmap from '../components/roadmap'
import CTA from '../components/cta'

import {
  AtSymbolIcon,
  CodeBracketSquareIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Federated social',
    description:
      "Connect with anyone on any service that's using the AT Protocol.",
    icon: AtSymbolIcon,
  },
  {
    name: 'Algorithmic choice',
    description:
      'Control how you see the world through an open market of algorithms.',
    icon: CodeBracketSquareIcon,
  },
  {
    name: 'Portable accounts',
    description:
      'Change hosts without losing your content, your follows, or your identity.',
    icon: ArrowsUpDownIcon,
  },
]

export default function Home() {
  return (
    <div>
      <Meta />
      <Header />
      <Hero />
      <FeaturesSection />
      {undefined /*<RoadmapSection />*/}
      {undefined /*<LinksSection />*/}
      <CTA />
      <Footer />
    </div>
  )
}

function FeaturesSection() {
  return (
    <div className="relative bg-white py-16">
      <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-lg font-semibold text-blue-600">Introducing</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          The Social Internet
        </p>
        <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
          The AT Protocol is a networking technology created by{' '}
          <Link href="https://blueskyweb.xyz">
            <a className="text-blue-600 hover:underline">Bluesky</a>
          </Link>{' '}
          to power the next generation of social applications.
        </p>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-center">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="block -mt-6" href={feature.href}>
                    <span>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                        <feature.icon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RoadmapSection() {
  return (
    <div className="max-w-lg mx-auto px-5 mb-24">
      <h3 className="text-center text-3xl mb-8 font-bold">Roadmap</h3>
      <Roadmap />
      <div className="text-center mt-8">
        <Link href="/guides/overview">
          <a className="text-blue-600 hover:underline">
            Learn more
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </Link>
      </div>
    </div>
  )
}

function LinksSection() {
  const links = [
    {
      href: '/guides',
      name: 'Guides',
      description: 'Learn how the AT protocol works at a high level.',
    },
    {
      href: '/specs',
      name: 'Specs',
      description: 'Read detailed specifications for the protocol.',
    },
    {
      href: '/lexicons',
      name: 'Lexicons',
      description: 'Schema reference for AT and its apps.',
    },
  ]
  return (
    <div className="bg-gray-100 py-12">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <dl className="space-y-10 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {links.map((link) => (
            <div key={link.name} className="relative">
              <dt>
                <p className="text-lg font-medium leading-6 text-blue-600">
                  <Link href={link.href}>
                    <a className="hover:underline">
                      <span
                        className="absolute inset-0"
                        aria-hidden="true"
                      ></span>
                      {link.name}
                    </a>
                  </Link>
                </p>
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                {link.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

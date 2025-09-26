import { Hero } from '@/components/home/Hero'
import { CTAButtons } from '@/components/home/CTAButtons'
import { Apps } from '@/components/home/Apps'
import { Testimonials } from '@/components/home/Testimonials'
import { StatsAndMission } from '@/components/home/StatsAndMission'
import Link from 'next/link'
import { DevCTAs } from '@/components/home/DevCTAs'

export const metadata = {
  title: 'AT Protocol',
  description:
    'The AT Protocol is an open, decentralized, and high-performance network for building social applications.',
}

export const sections = []

export default async function HomePage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12 lg:max-w-7xl lg:px-8">
      <div className="mb-24">
        <Hero />
        <CTAButtons />
      </div>
      <div className="my-24 grid grid-cols-2 gap-16">
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="/explorer" className="block px-12 py-8">
            <div className="text-2xl">Network Explorer</div>
            <div>
              Browse the network and see for yourself how the Atmosphere works.
            </div>
          </Link>
        </div>
        <StatsAndMission />
      </div>
      <div className="my-24">
        <h3 className="mb-12 text-center text-5xl font-bold">Make a change</h3>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
            <Link href="/explorer" className="block px-12 py-24">
              <div className="text-2xl">For creators</div>
              <div>
                Own your audience and your income. You should give apps a cut of
                your revenue, not the other way around.
              </div>
            </Link>
          </div>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
            <Link href="/explorer" className="block px-12 py-24">
              <div className="text-2xl">For users</div>
              <div>
                Don&#39;t let apps change the deal on you. If you&#39;re not
                happy, you should have the right to leave.
              </div>
            </Link>
          </div>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
            <Link href="/explorer" className="block px-12 py-24">
              <div className="text-2xl">For developers</div>
              <div>
                Lock the APIs open and forget the cold start problem. The dream
                of the hackable Internet is not dead.
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="my-24">
        <h3 className="mb-12 text-center text-5xl font-bold">
          Start building today
        </h3>
        <DevCTAs />
      </div>
      <div className="my-24">
        <h3 className="mb-12 text-center text-5xl font-bold">
          Check out these apps
        </h3>
        <Apps />
      </div>
      <div className="my-24">
        <h3 className="mb-12 text-center text-5xl font-bold">
          An active community
        </h3>
        <Testimonials />
      </div>
    </div>
  )
}

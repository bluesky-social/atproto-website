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

export default async function Page({ params }: any) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12 lg:max-w-7xl lg:px-8">
      <div className="py-48">
        <h1 className="font-display text-balance text-6xl/[0.9] font-medium text-gray-950 sm:text-7xl/[0.8] md:text-8xl/[0.8]">
          Deploy
        </h1>
        <p className="mt-8 text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
          Self-host your slice of the Atmosphere, for you and your community.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Unit
          title="Account Server"
          description="Make sure your identity and data stay in your hands."
          startHref="#"
          gitHref="#"
          cost={1}
          difficulty={1}
        />
        <Unit
          title="Moderation"
          description="Run a moderation service for your community."
          startHref="#"
          gitHref="#"
          cost={1}
          difficulty={2}
        />
        <Unit
          title="Relay"
          description="Maintain a public firehose of user activity."
          startHref="#"
          gitHref="#"
          cost={2}
          difficulty={1}
        />
        <Link
          className="flex flex-col justify-center rounded-lg bg-gray-50 px-12 pb-8"
          href="/build"
        >
          <span className="block text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Build new apps
          </span>
          <span className="mt-4 block text-lg/8 text-gray-600">
            Connect users and create new experiences.
          </span>
        </Link>
      </div>
    </div>
  )
}

function Unit({
  title,
  description,
  startHref,
  gitHref,
  cost,
  difficulty,
}: {
  title: string
  description: string
  startHref: string
  gitHref: string
  cost: 1 | 2 | 3 | 4
  difficulty: 1 | 2 | 3 | 4
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div className="block px-12 pb-6 pt-14">
        <div className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </div>
        <div className="mt-4 text-lg/8 text-gray-600">{description}</div>
        <div className="mt-6 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
          <a
            className="whitespace-nowrap rounded-full border border-transparent bg-gray-950 px-4 py-[calc(--spacing(2)-1px)] text-base font-medium text-white shadow-md"
            href={startHref}
          >
            Get started
          </a>
          <a
            className="whitespace-nowrap rounded-full border border-transparent bg-white/15 px-4 py-[calc(--spacing(2)-1px)] text-base font-medium text-gray-950 shadow-md ring-1 ring-[#D15052]/15"
            href={gitHref}
          >
            View GitHub
          </a>
        </div>
      </div>
      <div className="flex flex-row gap-12 bg-gray-50 px-12 py-6">
        <div>
          <div className="text-base/8 font-bold text-gray-600">Cost</div>
          <div className="text-xl font-semibold">
            {fill('$', cost)} {numLabel(cost)}
          </div>
        </div>
        <div>
          <div className="text-base/8 font-bold text-gray-600">Difficulty</div>
          <div className="text-xl font-semibold">
            {fill('★', difficulty)} {numLabel(difficulty)}
          </div>
        </div>
      </div>
    </div>
  )
}

function fill(char: string, n: number): string {
  let str = ''
  for (let i = 0; i < 3; i++) {
    if (i < n) str += char
    else str += '•'
  }
  return str
}

function numLabel(n: number): string {
  if (n === 1) return 'Low'
  if (n === 2) return 'Medium'
  return 'High'
}

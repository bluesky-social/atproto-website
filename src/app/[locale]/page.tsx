import { GlobeAnimation } from '@/components/home/GlobeAnimation'
import { Button } from '@/components/Button'
import clsx from 'clsx'

import { ExplainerUnit } from '@/components/home/ExplainerUnit'
import { Firehose } from '@/components/home/Firehose'
import { BentoNav } from '@/components/home/BentoNav'
import { Usecases } from '@/components/home/Usecases'

export default async function HomePage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-2 md:gap-12 md:px-8 lg:max-w-7xl">
      <div className="flex flex-col-reverse items-center md:py-12 xl:flex-row">
        <div className="flex flex-col gap-4 px-6 pb-8 md:px-0 xl:flex-1 xl:pb-0">
          <h1 className="text-center font-mono text-5xl uppercase leading-[1.1] md:text-7xl md:tracking-[-4px] xl:text-left">
            AT PROTOCOL
          </h1>
          <div className="hyphens-none text-center font-mono text-xl text-zinc-700 xl:pr-40 xl:text-left dark:text-zinc-400">
            Building the Social Internet.
          </div>
          <div className="py-4 text-center sm:py-12 xl:text-left">
            <Button
              variant="primary"
              arrow="right"
              font="mono"
              size="xxlarge"
              href="/docs"
              className="max-sm:flex max-sm:py-3"
            >
              GET STARTED
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:text-center xl:text-left">
            <Stat value="40M+" desc="Users" first />
            <Stat value="2.4B+" desc="Totally normal posts" />
            <Stat value="100%" desc="Open data" />
          </div>
        </div>
        <div className="pb-12 pt-4 sm:py-8 xl:flex-1 xl:py-0">
          <GlobeAnimation lines={30} />
        </div>
      </div>

      <Usecases wide />
      <ExplainerUnit />
      <Firehose />
      <BentoNav />
    </div>
  )
}

function Stat({
  value,
  desc,
  first,
}: {
  value: string
  desc: string
  first?: boolean
}) {
  return (
    <div
      className={clsx(
        'flex-1 border-zinc-300 py-1 sm:px-4 xl:flex-none xl:pr-12 dark:border-zinc-700',
        first ? 'xl:border-l' : 'sm:border-l',
      )}
    >
      <div className="font-mono text-2xl md:font-bold">{value}</div>
      <div className="text-lg text-zinc-400 md:text-white">{desc}</div>
    </div>
  )
}

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
      <div className="flex flex-col-reverse items-center pt-12 md:py-12 xl:flex-row">
        <div className="flex flex-col gap-4 px-6 pb-8 sm:text-center md:px-0 xl:flex-1 xl:pb-0 xl:text-left">
          <h1 className="sm:text-5px font-mono text-4xl uppercase leading-[1.1] md:text-7xl md:tracking-[-4px]">
            AT PROTOCOL
          </h1>
          <div className="hyphens-none font-mono text-xl text-zinc-700 xl:pr-40 dark:text-zinc-400">
            The open social network for high&#8209;scale interoperation.
          </div>
          <div className="py-4 sm:py-12">
            <Button
              variant="primary"
              arrow="right"
              font="mono"
              size="xxlarge"
              href="/docs"
            >
              GET STARTED
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
            <Stat value="40M+" desc="Users online" first />
            <Stat value="1.961B+" desc="Totally normal posts" />
            <Stat value="100%" desc="Open source" />
          </div>
        </div>
        <div className="py-16 sm:py-8 xl:flex-1 xl:py-0">
          <GlobeAnimation lines={30} />
        </div>
      </div>

      <Usecases wide />

      <div className="px-6 pt-12 font-mono font-medium text-zinc-400 md:hidden">
        So, how does it work?
      </div>

      <ExplainerUnit />
      <Firehose />

      <div className="px-6 pt-6 font-mono font-medium text-zinc-400 md:hidden">
        Would you like to know more?
      </div>
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

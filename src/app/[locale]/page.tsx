import { GlobeAnimation } from '@/components/home/GlobeAnimation'
import { Button } from '@/components/Button'
import clsx from 'clsx'

export default async function HomePage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col-reverse items-center px-8 lg:max-w-7xl xl:h-full xl:flex-row">
      <div className="flex flex-col gap-4 pb-8 sm:text-center xl:flex-1 xl:pb-0 xl:text-left">
        <h1 className="sm:text-5px font-mono text-4xl uppercase leading-[1.1] md:text-7xl md:tracking-[-4px]">
          Welcome to the Atmosphere
        </h1>
        <div className="font-mono text-zinc-700 xl:pr-40 dark:text-zinc-400">
          The AT Protocol is an open, decentralized network for building social
          applications.
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
          <Stat value="1.961B" desc="Totally normal posts" />
          <Stat value="100%" desc="Open source" />
        </div>
      </div>
      <div className="py-16 sm:py-8 xl:flex-1 xl:py-0">
        <GlobeAnimation lines={30} />
      </div>
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
        'flex-1 border-zinc-300 py-1 sm:px-4 dark:border-zinc-700',
        first ? 'xl:border-l' : 'sm:border-l',
      )}
    >
      <div className="font-mono font-bold">{value}</div>
      <div>{desc}</div>
    </div>
  )
}

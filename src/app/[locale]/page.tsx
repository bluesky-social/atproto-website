import { GlobeAnimation } from '@/components/home/GlobeAnimation'
import { Button } from '@/components/Button'

export default async function HomePage({ params }: any) {
  return (
    <div className="mx-auto flex h-full max-w-6xl items-center lg:max-w-7xl">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-mono text-7xl uppercase leading-[1.1] tracking-[-4px]">
          Welcome to the Atmosphere
        </h1>
        <div className="font-mono lg:pr-40 dark:text-zinc-400">
          The AT Protocol is an open, decentralized network for building social
          applications.
        </div>
        <div className="pb-12 pt-12">
          <Button variant="secondary" arrow="right" font="mono" size="xxlarge">
            GET STARTED
          </Button>
        </div>
        <div className="flex">
          <Stat value="40M+" desc="Users online" />
          <Stat value="1.961B" desc="Totally normal posts" />
          <Stat value="100%" desc="Open source" />
        </div>
      </div>
      <div className="flex-1">
        <GlobeAnimation lines={30} />
      </div>
    </div>
  )
}

function Stat({ value, desc }: { value: string; desc: string }) {
  return (
    <div className="flex-1 border-l px-4 py-1 dark:border-zinc-700">
      <div className="font-mono font-bold">{value}</div>
      <div>{desc}</div>
    </div>
  )
}

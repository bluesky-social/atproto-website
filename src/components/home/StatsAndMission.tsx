const stats = [
  { id: 1, name: 'Users on the network', value: '40M+' },
  { id: 2, name: 'Events per second', value: '300-1000' },
  { id: 3, name: 'Totally normal posts', value: '1.961B' },
  { id: 4, name: 'Open source', value: '100%' },
]

export function StatsAndMission() {
  return (
    <div className="">
      <h2 className="text-base/8 font-semibold text-gray-600 dark:text-gray-400">
        Our mission
      </h2>
      <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
        Nobody should own the Internet
      </p>
      <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores
        impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis
        ratione.
      </p>
      <dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6 dark:border-white/10"
          >
            <dt className="text-sm/6 text-gray-600 dark:text-gray-400">
              {stat.name}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

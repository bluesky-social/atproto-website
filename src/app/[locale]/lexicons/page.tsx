import Sparkline from '@/components/Sparkline'

export const metadata = {
  title: 'AT Protocol',
  description:
    'The AT Protocol is an open, decentralized, and high-performance network for building social applications.',
}

export const sections = []

export default async function LexiconsPage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12 lg:max-w-6xl lg:px-8">
      <div className="prose pb-6 pt-12">
        <h1 className="font-thick text-5xl">Lexicons</h1>
        <p className="lead">The data schemas of the Atmosphere.</p>
      </div>
      <h2 className="text-2xl font-bold">What's hot</h2>
      <Example />
    </div>
  )
}

const hotSchemas = [
  {
    name: 'slices request',
    nsid: 'network.slices.waitlist.request',
  },
  {
    name: 'popfeed profile',
    nsid: 'social.popfeed.actor.profile',
  },
  {
    name: 'popfeed listItem',
    nsid: 'social.popfeed.feed.listItem',
  },
  {
    name: 'popfeed list',
    nsid: 'social.popfeed.feed.list',
  },
  {
    name: 'rito bookmark',
    nsid: 'blue.rito.feed.bookmark',
  },
  {
    name: 'gainforest info',
    nsid: 'app.gainforest.organization.info',
  },
]

function Example() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {hotSchemas.map((hotSchema) => (
        <a
          key={hotSchema.name}
          href="#"
          className="col-span-1 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
        >
          <span className="flex w-full items-center justify-between space-x-6 p-4">
            <span className="flex-1">
              <span className="flex items-center space-x-3">
                <span className="text-md truncate font-medium text-gray-900 dark:text-white">
                  {hotSchema.name}
                </span>
              </span>
              <span className="mb-2 mt-1 block truncate font-mono text-sm text-gray-500 dark:text-gray-400">
                {hotSchema.nsid}
              </span>
              <span className="block h-[20px] w-[100px] text-blue-500">
                <Sparkline data={[1, 2, 1, 5, 3, 1, 2, 5, 2, 3, 8, 4]} />
              </span>
            </span>
          </span>
        </a>
      ))}
    </div>
  )
}

export const metadata = {
  title: 'AT Protocol',
  description:
    'The AT Protocol is an open, decentralized, and high-performance network for building social applications.',
}

export const sections = []

const tools = [
  {
    href: '#',
    projectName: 'goat',
    teamName: 'bluesky',
    type: 'CLI',
    description: 'Multi-tool for interacting with AT',
  },
  {
    href: 'https://pdsls.dev',
    projectName: 'PDSLS',
    teamName: 'juli.ee',
    type: 'Web app',
    description: 'Fully-featured repo explorer',
  },
  {
    href: 'https://atproto.at/',
    projectName: 'taproot',
    teamName: 'sri.xyz',
    type: 'Web app',
    description: 'All-in-one AT Explorer',
  },
  {
    href: 'https://www.microcosm.blue/',
    projectName: 'microcosm',
    teamName: 'bad-example',
    type: 'Service',
    description: 'Open-source APIs to kick-start your next app on AT.',
  },
  {
    href: 'https://slices.network/',
    projectName: 'slices.network',
    teamName: 'slices',
    type: 'Service',
    description: 'A complete development platform for AT applications.',
  },
]

export default async function ToolsPage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12 lg:px-8">
      <div className="prose pt-12">
        <h1 className="font-thick text-5xl">Tools</h1>
        <p className="lead">CLIs, services, and web apps for developers.</p>
      </div>
      <Listing />
    </div>
  )
}

function Listing() {
  return (
    <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
      {tools.map((tool, id) => (
        <li key={id} className="relative flex items-center space-x-4 py-4">
          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-3">
              <h2 className="min-w-0 text-sm/6 font-semibold text-gray-900 dark:text-white">
                <a href={tool.href} className="flex gap-x-2">
                  <span className="truncate">{tool.teamName}</span>
                  <span className="text-gray-500 dark:text-gray-400">/</span>
                  <span className="whitespace-nowrap">{tool.projectName}</span>
                  <span className="absolute inset-0" />
                </a>
              </h2>
            </div>
            <div className="mt-3 text-xs/5 text-gray-500 dark:text-gray-400">
              {tool.description}
            </div>
          </div>
          <div className="inset-ring inset-ring-gray-500/10 dark:inset-ring-gray-400/20 flex-none rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-400/10 dark:text-gray-400">
            {tool.type}
          </div>
        </li>
      ))}
    </ul>
  )
}

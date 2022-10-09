import Meta from '../components/meta'
import Header from '../components/header'
import Footer from '../components/footer'
import RoadmapGrid from '../components/roadmap-grid'
import CTA from '../components/cta'

const core = [
  {
    name: 'Public publishing',
    label: 'stable',
    done: true,
    href: '/guides/overview',
  },
  {
    name: 'Account portability',
    label: 'stable',
    done: true,
    href: '/guides/overview',
  },
  {
    name: 'Federation',
    done: false,
    href: '/guides/overview',
  },
]

const software = [
  {
    name: 'Mobile client',
    label: 'alpha',
    done: true,
  },
  {
    name: 'Desktop client',
    done: false,
  },
  {
    name: 'Personal data server',
    label: 'alpha',
    done: true,
  },
  {
    name: 'Indexing server',
    done: false,
  },
]

const privacy = [
  {
    name: 'Private sharing',
    done: false,
  },
  {
    name: 'Direct messages',
    done: false,
  },
  {
    name: 'Groups / forums',
    done: false,
  },
]

const scale = [
  {
    name: 'Search',
    done: false,
  },
  {
    name: 'Custom algorithms',
    done: false,
  },
]

const curationModeration = [
  {
    name: 'Reputation',
    done: false,
  },
  {
    name: 'Moderation',
    done: false,
  },
  {
    name: 'Spam filtering',
    done: false,
  },
]

export default function RoadmapPage() {
  return (
    <div>
      <Meta title="Development Roadmap" />
      <Header />
      <div className="max-w-4xl mx-auto px-5 my-8">
        <h3 className="text-center text-3xl mb-8 font-bold">
          Development Roadmap
        </h3>
        <p className="mx-auto mb-10 text-xl">
          The <code>at://</code> protocol is in early alpha. This page can help
          you track which technologies are complete and which are in development
          at this stage.
        </p>
        <div className="mb-10">
          <div className="bg-blue-50 px-4 pt-3 pb-4 mb-4 rounded-md">
            <h4 className="font-bold mb-2 text-blue-800">Core Protocol</h4>
            <RoadmapGrid items={core} />
          </div>
          <div className="bg-gray-50 px-4 pt-3 pb-4 mb-4 rounded-md">
            <h4 className="font-bold mb-2 text-gray-800">Software</h4>
            <RoadmapGrid items={software} />
          </div>
          <div className="bg-gray-50 px-4 pt-3 pb-4 mb-4 rounded-md">
            <h4 className="font-bold mb-2">Privacy</h4>
            <RoadmapGrid items={privacy} />
          </div>
          <div className="bg-gray-50 px-4 pt-3 pb-4 mb-4 rounded-md">
            <h4 className="font-bold mb-2">Scaling</h4>
            <RoadmapGrid items={scale} />
          </div>
          <div className="bg-gray-50 px-4 pt-3 pb-4 mb-4 rounded-md">
            <h4 className="font-bold mb-2">Curation & moderation</h4>
            <RoadmapGrid items={curationModeration} />
          </div>
        </div>
      </div>
      <CTA />
      <Footer />
    </div>
  )
}

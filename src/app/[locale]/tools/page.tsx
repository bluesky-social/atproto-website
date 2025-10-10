import * as Projects from '@/components/Projects'

export const metadata = {
  title: 'AT Protocol',
  description:
    'The AT Protocol is an open, decentralized, and high-performance network for building social applications.',
}

export const sections = []

export default async function Page({ params }: any) {
  return (
    <div className="mx-auto w-full max-w-2xl pb-16 pt-16 lg:max-w-5xl">
      <div className="prose pb-12 pt-12">
        <h1 className="font-thick text-5xl">Tools</h1>
        <p className="lead">CLIs, services, and web apps for developers.</p>
      </div>

      <div className="not-prose">
        <Projects.Listing title="CLIs">
          <Projects.Item type="cli">
            <Projects.Title org="bsky.app" name="goat" />
            <Projects.Description>
              Multi-tool for interacting with AT.
            </Projects.Description>
          </Projects.Item>
        </Projects.Listing>
        <Projects.Listing title="Services">
          <Projects.Item type="service">
            <Projects.Title org="juli.ee" name="PDSLS" />
            <Projects.Description>
              Fully-featured repo explorer.
            </Projects.Description>
          </Projects.Item>
          <Projects.Item type="service">
            <Projects.Title org="sri.xyz" name="taproot" />
            <Projects.Description>All-in-one AT Explorer.</Projects.Description>
          </Projects.Item>
          <Projects.Item type="service">
            <Projects.Title org="bad-example.com" name="microcosm" />
            <Projects.Description>
              Open-source APIs to kick-start your next app on AT.
            </Projects.Description>
          </Projects.Item>
          <Projects.Item type="service">
            <Projects.Title org="slices" name="slices.network" />
            <Projects.Description>
              A complete development platform for AT applications.
            </Projects.Description>
          </Projects.Item>
        </Projects.Listing>
        <Projects.Listing title="Codebases">
          <Projects.Item type="repo">
            <Projects.Title org="bsky.app" name="relay" />
            <Projects.Description>
              A utility that crawls the network and produces the "firehose" of
              events.
            </Projects.Description>
          </Projects.Item>
          <Projects.Item type="repo">
            <Projects.Title org="bsky.app" name="ozone" />
            <Projects.Description>
              A human-review moderation system that receives user reports.
            </Projects.Description>
          </Projects.Item>
          <Projects.Item type="repo">
            <Projects.Title org="roost" name="osprey" />
            <Projects.Description>
              An automated moderation system that operates on programmed rules.
            </Projects.Description>
          </Projects.Item>
        </Projects.Listing>
      </div>
    </div>
  )
}

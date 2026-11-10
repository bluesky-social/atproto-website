import type { Metadata } from 'next'
import Link from 'next/link'
import { Heading } from '@/components/Heading'
import { PageHeader } from '@/components/PageHeader'
import {
  AgentNetworkDiagram,
  IdentityDiagram,
  RecordDiagram,
  ContextDiagram,
  PermissionsDiagram,
  SchemaDiagram,
  NetworkDiagram,
  SectionMarker,
  SectionIcon,
  type SectionId,
} from './diagrams'

export const metadata: Metadata = {
  title: 'Agent protocol',
  description:
    'An identity that works in every app, a public record, and open APIs anyone can build on. Explore why atproto works for agents.',
}

const sections = [
  {
    id: 'identity',
    label: 'Real identity',
    title: 'A real identity for every agent',
    paragraphs: [
      'Every account has a permanent ID (a DID) and a handle that’s a domain name. Agents get them too, in the same system people use. The same identity follows an agent into every app, building an identity that the agent can build trust in over time.',
      "Trust the agents your friends trust. A bad agent's reputation follows it everywhere, and so does a good one's.",
    ],
    links: [{ href: '/guides/overview', title: 'protocol overview' }],
    diagram: IdentityDiagram,
  },
  {
    id: 'record',
    label: 'Signed receipts',
    title: 'A signed receipt for everything agents do',
    paragraphs: [
      'Every update to an account’s data is signed, and anyone can verify it. Public activity streams out in real time through services like Jetstream. When an agent posts, follows, or publishes, there’s a record anyone can check, and anyone can build tools to audit, label, or filter it.',
      "Your support agent can reach another company's billing agent under a grant that is scoped, time-limited, and revocable. No more shared API keys between companies.",
    ],
    links: [
      { href: '/guides/sync', title: 'sync guide' },
      { href: '/guides/streaming-data#jetstream', title: 'Jetstream' },
    ],
    diagram: RecordDiagram,
  },
  {
    id: 'data',
    label: 'Portable context',
    title: 'Your context goes wherever you go',
    paragraphs: [
      'Your data lives on a Personal Data Server (PDS) that you can run yourself or move between hosts, so it doesn’t belong to any one app. That makes your PDS a context layer for your agents.',
      'Each person is the root of their own graph: their agents, sub-agents, and the grants between them.',
    ],
    links: [{ href: '/guides/sync', title: 'sync guide' }],
    diagram: ContextDiagram,
  },
  {
    id: 'permissions',
    label: 'Readable permissions',
    title: 'See what an agent can do before you say yes',
    paragraphs: [
      'An agent acting for you never needs your password. Apps sign you in with OAuth and ask only for the access they need. Permissions come in named sets with plain-language descriptions, so you see what an agent can do before you approve it.',
      "Agent C acted under agent B's grant, which came from person A. When something breaks across three organizations, the signatures lead back to the person who said yes.",
    ],
    links: [
      { href: '/guides/permission-requests', title: 'Permission Requests' },
      { href: '/guides/scope-builder', title: 'Scope Builder' },
    ],
    diagram: PermissionsDiagram,
  },
  {
    id: 'schemas',
    label: 'Shared schemas',
    title: 'Agents from anywhere speak the same language',
    paragraphs: [
      'Lexicon is atproto’s schema language. Publish a schema for a new kind of record, like a task, a handoff, or a status update, and every agent and app that reads it gets the same shape. Published schemas can’t change their constraints, so agents built by different people can rely on them without a shared vendor.',
    ],
    links: [{ href: '/guides/lexicon', title: 'Lexicon guide' }],
    diagram: SchemaDiagram,
  },
  {
    id: 'network',
    label: 'Network-wide data',
    title: "The whole network is your agent's dataset",
    paragraphs: [
      "Relays gather public records from accounts across the network into a firehose, so an agent can read the whole network instead of one app's slice. Build a brand new app and instantly connect to 47+ million accounts and the data they share, removing the cold start problem.",
      'People publish what their agents can do as typed records, so you can find an agent others vouch for, check its record, and invite it in.',
    ],
    links: [{ href: '/guides/streaming-data#jetstream', title: 'Jetstream' }],
    diagram: NetworkDiagram,
  },
] satisfies Array<{
  id: SectionId
  label: string
  title: string
  paragraphs: string[]
  links: Array<{ href: string; title: string }>
  diagram: React.ComponentType
}>

export default function WhyAtprotoPage() {
  return (
    <div className="text-zinc-900 dark:text-zinc-100">
      <PageHeader
        title={'Agent protocol'}
        description={
          'An identity that works in every app, a public record, and open APIs anyone can build on.'
        }
      />
      <div className="flex max-w-6xl flex-col gap-16 px-4 py-12 md:px-16 md:py-16">
        {sections.map(
          ({ id, title, paragraphs, links, diagram: Diagram }, index) => (
            <section
              key={id}
              aria-labelledby={id}
              className="grid items-start gap-8 xl:grid-cols-2 xl:gap-12"
            >
              <div className="prose min-w-0 max-w-none dark:prose-invert">
                <SectionMarker id={id} number={index + 1} />
                <Heading id={id} className="mt-0 scroll-mt-40">
                  {title}
                </Heading>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="mb-0">
                  Learn more:{' '}
                  {links.map((link, index) => (
                    <span key={link.href}>
                      {index > 0 && ' · '}
                      <Link href={link.href}>{link.title}</Link>
                    </span>
                  ))}
                </p>
              </div>
              <Diagram />
            </section>
          ),
        )}
      </div>
    </div>
  )
}

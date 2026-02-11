export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
}

export const posts: BlogPost[] = [
  {
    slug: 'relay-rollout',
    title: 'Upcoming Relay Transition',
    description: 'What the new relay rollout means for consumers of the firehose.',
    date: 'January 24, 2026',
    author: 'AT Protocol Team',
  },
  {
    slug: 'introducing-tap',
    title: 'Introducing Tap: Repository Synchronization Made Simple',
    description:
      'We recently released Tap, a tool designed to handle the hard parts of repo synchronization, so you can focus on building your application.',
    date: 'December 12, 2025',
    author: 'Jim Ray',
  },
  {
    slug: 'protocol-check-in-fall-2025',
    title: 'Protocol Check-in (Fall 2025)',
    description: "The Atmosphere is thriving, here's a closer look",
    date: 'October 20, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'taking-at-to-the-ietf',
    title: 'Taking AT to the IETF',
    description:
      'We recently posted two drafts to the IETF Data Tracker. This is the first major step towards standardizing parts of AT in an effort to establish long-term governance for the protocol.',
    date: 'September 23, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'plc-directory-org',
    title: 'Creating an Independent Public Ledger of Credentials (PLC) Directory Organization',
    description:
      'As the next step of maturing governance of the PLC identity system, Bluesky Social PBC is supporting the creation of an independent organization to operate the PLC directory.',
    date: 'September 19, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'oauth-improvements',
    title: 'OAuth Improvements',
    description:
      "We've been making improvements to the end-user and developer experiences with atproto OAuth.",
    date: 'June 12, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'network-account-management',
    title: 'Network Account Management',
    description:
      "We recently shipped new functionality to the PDS reference implementation (and Bluesky's hosting service) which provides a web interface to create and manage accounts directly on the PDS itself.",
    date: 'May 9, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'relay-updates-sync-v1-1',
    title: 'Relay Updates for Sync v1.1',
    description:
      'Updates to our reference implementation of the relay support sync version 1.1',
    date: 'May 2, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: '2025-protocol-roadmap-spring',
    title: '2025 Protocol Roadmap (Spring and Summer)',
    description:
      'Updates to the AT Protocol roadmap, including Sync v1.1, auth scopes, PDS account management, and more.',
    date: 'March 7, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'looking-back-2024',
    title: 'Looking Back At 2024 AT Protocol Development',
    description:
      "A lot of progress was made on the protocol in 2024, here's a look at the big milestones",
    date: 'January 10, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'relay-ops',
    title: 'Relay Operational Updates',
    description:
      'Updates on changes to Bluesky relay servers and guidance for firehose consumers.',
    date: 'November 18, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'pinned-posts',
    title: 'Lexicons, Pinned Posts, and Interoperability',
    description:
      'A discussion of Lexicons, schema extensions, and lessons learned from the pinned posts feature collision.',
    date: 'October 16, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'jetstream',
    title: 'Introducing Jetstream',
    description:
      'Introducing Jetstream, an alternative streaming solution with simple JSON encoding and reduced bandwidth.',
    date: 'October 16, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'oauth-atproto',
    title: 'OAuth for AT Protocol',
    description:
      'Releasing the initial specification of OAuth for AT Protocol, the primary authentication and authorization system going forward.',
    date: 'September 25, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'label-grants',
    title: 'Labeling Services Microgrants',
    description:
      'Launching microgrants for labeling services on Bluesky to support moderation and community safety.',
    date: 'May 15, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: '2024-protocol-roadmap',
    title: '2024 Protocol Roadmap',
    description:
      'An update on our progress and our general goals and focus for the coming months.',
    date: 'May 6, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'atproto-grants-recipients',
    title: 'Meet the second batch of AT Protocol Grant Recipients',
    description:
      'Announcing the second batch of AT Protocol grant recipients, distributing $4,800 total in grants.',
    date: 'April 23, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'atproto-grants',
    title: 'Announcing AT Protocol Grants',
    description:
      'Announcing the AT Protocol Grants program, aimed at fostering the growth and sustainability of the atproto developer ecosystem.',
    date: 'March 6, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'self-host-federation',
    title: 'Early Access Federation for Self-Hosters',
    description:
      'Releasing an early-access version of federation intended for self-hosters and developers.',
    date: 'February 22, 2024',
    author: 'AT Protocol Team',
  },
  {
    slug: 'repo-export',
    title: 'Download and Parse Repository Exports',
    description:
      'How to export and parse a data repository as a CAR file.',
    date: 'November 6, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'protocol-roadmap',
    title: '2023 Protocol Roadmap',
    description:
      'The current AT Protocol development plan through to a version one release.',
    date: 'October 11, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'building-on-atproto',
    title: 'Building on the AT Protocol',
    description:
      'What you can already build on atproto, and what you can expect soon.',
    date: 'October 11, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'bgs-and-did-doc',
    title: 'Bluesky BGS and DID Document Formatting Changes',
    description:
      'Protocol and infrastructure changes including the BGS firehose and DID document formatting updates.',
    date: 'October 6, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'repo-sync-update',
    title: 'Updates to Repository Sync Semantics',
    description:
      'Announcing updates to atproto repositories that remove history and replace it with a logical clock.',
    date: 'August 24, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'create-post',
    title: 'Posting via the Bluesky API',
    description:
      'A guide to creating posts via the Bluesky API, including mentions, links, replies, quote posts, and image embeds.',
    date: 'August 11, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'call-for-developers',
    title: 'Bluesky Call for Developers',
    description:
      "Bluesky is an open social network built on the AT Protocol. If you're a developer interested in building on atproto, we'd love to hear from you.",
    date: 'August 3, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'federation-sandbox',
    title: 'Federation Developer Sandbox Guidelines',
    description:
      'Guidelines for the atproto federation developer sandbox environment.',
    date: 'June 20, 2023',
    author: 'AT Protocol Team',
  },
  {
    slug: 'block-implementation',
    title: 'Why are blocks on Bluesky public?',
    description:
      'The technical implementation of public blocks and some possibilities for more privacy preserving block implementations.',
    date: 'June 8, 2023',
    author: 'AT Protocol Team',
  },
]

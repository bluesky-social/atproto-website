export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
}

export const posts: BlogPost[] = [
  {
    slug: 'serving-the-for-you-feed',
    title: 'Serving the For You Feed',
    description: 'How the maintainer of the popular For You feed serves it from their living room!',
    date: 'April 21, 2026',
    author: 'spacecowboy',
  },
  {
    slug: 'indexing-standard-site',
    title: 'Indexing Standard Site',
    description: 'This guest post from Steve Simkins, creator of Sequoia and docs.surf, outlines the strategy he used to index standard.site records.',
    date: 'April 14, 2026',
    author: 'Steve Simkins',
  },
  {
    slug: 'kicking-off-the-atp-working-group',
    title: 'Kicking off the ATP Working Group at the IETF',
    description: 'The Authenticated Transfer Protocol working group has been created at the IETF. Now that we have a charter, we are looking forward to participation from the broader ATP ecosystem. ',
    date: 'April 2, 2026',
    author: 'AT Protocol Team',
  },
  {
    slug: '2026-spring-roadmap',
    title: 'AT Protocol Roadmap (Spring 2026)',
    description: 'Updates to the AT Protocol roadmap, including Permissioned Data and Account Experience.',
    date: 'March 24, 2026',
    author: 'Bluesky Protocol Team',
  },
  {
    slug: 'introducing-hubble-a-public-mirror-for-the-whole-atmosphere',
    title: 'Introducing Hubble: A Public Mirror for the Whole Atmosphere',
    description: 'Bluesky is providing a grant to the creator of Microcosm to build a full mirror of public data on the Atmosphere to help make the network more resilient.',
    date: 'March 20, 2026',
    author: 'fig',
  },
  {
    slug: 'working-to-decentralize-fedcm',
    title: 'Working to Decentralize FedCM',
    description: 'Bluesky Social PBC have given a grant to Emelia Smith, an Invited Expert with the FedID Working Group, to work on FedCM with the goal of making FedCM really work for the decentralized web.',
    date: 'March 9, 2026',
    author: 'Emelia Smith',
  },
  {
    slug: 'npmx-alpha-launch',
    title: 'Supporting the npmx Alpha Launch',
    description: 'The launch of npmx is an incredible showcase for how open source communities can build quickly on top of atproto.',
    date: 'March 3, 2026',
    author: 'Jim Ray',

  },
  {
    slug: 'plc-replicas',
    title: 'PLC Read Replicas',
    description: 'Introducing a self-hostable did:plc read-replica service.',
    date: 'February 18, 2026',
    author: 'David Buchanan',

  },
  {
    slug: 'new-site-2026',
    title: 'Welcome to the New atproto.com',
    description: 'We\'ve updated just about everything about atproto.com to make it easier for developers to just build things.',
    date: 'February 17, 2026',
    author: 'Alex Garnett',

  },
  {
    slug: 'relay-rollout',
    title: 'Upcoming Relay Transition',
    description: 'What the new relay rollout means for consumers of the firehose.',
    date: 'January 24, 2026',
    author: 'Bryan Newbold',
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

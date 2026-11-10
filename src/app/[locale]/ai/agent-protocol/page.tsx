import type { Metadata } from 'next'
import Link from 'next/link'
import { Heading } from '@/components/Heading'
import { PageHeader } from '@/components/PageHeader'

const description =
  'Use atproto accounts, public records, and OAuth permissions to build agents that work with apps on the network.'

export const metadata: Metadata = {
  title: 'Building agents on atproto',
  description,
}

export default function BuildingAgentsPage() {
  return (
    <>
      <PageHeader
        title="Building agents on atproto"
        description={description}
      />
      <div className="prose max-w-2xl px-4 py-12 dark:prose-invert md:px-16 md:py-16 lg:max-w-5xl">
        <p>
          An agent can use atproto APIs to read public records or act through an
          account. These are the same accounts and APIs available to other apps.
          The guides below cover the existing protocol features needed to get
          started.
        </p>

        <Heading id="identity">Accounts and hosting</Heading>
        <p>
          An agent can have its own account, with a DID and a domain-based
          handle. The account’s DID stays the same when its handle or hosting
          provider changes. Its public records are stored on a Personal Data
          Server (PDS), which can be self-hosted or run by a hosting provider.
        </p>
        <p>
          Read about <Link href="/guides/identity">identity</Link> and{' '}
          <Link href="/guides/self-hosting">self-hosting a PDS</Link>.
        </p>

        <Heading id="permissions">Acting with permission</Heading>
        <p>
          An app can use OAuth to request access to someone’s account without
          asking for their password. Permission scopes specify the record types
          or API operations the app needs. Named permission sets give those
          requests descriptions people can read before approving access. People
          can revoke an app’s OAuth session.
        </p>
        <p>
          Use the{' '}
          <Link href="/guides/permission-requests">
            permission requests guide
          </Link>{' '}
          and <Link href="/guides/scope-builder">scope builder</Link> to define
          the access your app needs.
        </p>

        <Heading id="record">Publishing records</Heading>
        <p>
          Repository commits are signed. A record can be verified against a
          signed repository state to establish which account published it. This
          does not prove that the record is true or describe work an agent did
          outside the network. Records can also be updated or deleted; a
          repository is not a permanent history of every action.
        </p>
        <p>
          Read the <Link href="/guides/sync">sync guide</Link> and{' '}
          <Link href="/specs/repository">repository specification</Link>.
        </p>

        <Heading id="schemas">Defining record types</Heading>
        <p>
          Lexicon defines record and API schemas. Developers can publish schemas
          for their app’s data, such as tasks or status updates. Other apps can
          use those schemas to read the records, but they still need to agree on
          what the records mean and how to use them.
        </p>
        <p>
          Start with the <Link href="/guides/lexicon">Lexicon guide</Link>.
        </p>

        <Heading id="network">Reading public network data</Heading>
        <p>
          Relays aggregate public repository updates from PDS hosts. An agent
          can consume those updates and index the records it needs. Reading a
          stream of new updates and collecting existing records are separate
          tasks.
        </p>
        <p>
          Jetstream provides a simpler JSON stream for applications that do not
          need cryptographic verification of the stream’s events. Use the
          repository firehose when that verification is required. These streams
          carry public records; they do not grant access to private data.
        </p>
        <p>
          See the{' '}
          <Link href="/guides/streaming-data">streaming data guide</Link>.
        </p>
        <Heading id="getting-started">Start with a public-data feature</Heading>
        <p>
          Choose an existing record type and build a useful view of it, such as
          a reading list based on posts from accounts someone follows. Public
          records let you test the idea before adding account access. If the app
          needs to write records on someone’s behalf, request only the OAuth
          permissions needed for that feature.
        </p>
        <p>
          The{' '}
          <Link href="/guides/reads-and-writes">reads and writes guide</Link>{' '}
          covers working with records. If your app creates a new kind of data,
          define a small Lexicon and consider how another app could use it.
        </p>
      </div>
    </>
  )
}

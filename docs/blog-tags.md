# Blog topics

Tags are stable topic IDs from `src/lib/blogTags.mjs`. Use Studio's Topics
checkboxes or the comma-separated prompt in `npm run blog create`. A new topic
requires adding its ID and label to the vocabulary first. Existing posts without
tags remain supported.

Posts store tags in the English MDX `header.tags` and the matching entry in
`src/lib/posts.ts`. Studio and the creation script write both. When editing by
hand, update both; the archive consistency test checks for drift. Blog routes
currently use English content in every locale; tags belong to the post, not a
translation. Search indexing also reads the English tags for translated entries.

Each topic has its own server-rendered page at `/blog/topic/<id>`. Unknown topic
IDs return 404. The blog listing has a topic select box; readers choose one
topic at a time. With JavaScript, the `<topic-select>` element navigates on
change. Without it, the form submits to `/blog/topic`, which redirects to the
topic page. Posts show their topics as small links at the end of the post,
before the discussion.

The order of `blogTopics` is the display order: News & Announcements first,
then alphabetical by label. Labels use title case. IDs never change when labels
do.

Publishing refuses mismatched MDX/listing tags before making a network request.
Saving/publishing preserves the tags and includes them in the standard.site
record. Backfilling this repository does not republish existing records; those
receive tags on their next publish.

## Topic selection rules

Use tags for a post's main subjects. A passing mention, prerequisite, linked
resource, or a technology used by an example does not automatically warrant a tag.
Use one tag when one topic is enough; an empty array is valid when no topic fits.

- **Identity & Auth** (`identity`) combines DIDs, PLC, accounts, migration,
  authentication, OAuth, and authorization. There is no separate OAuth topic,
  and `oauth` is not accepted as a tag.
- **Grants** (`grants`) is a focused replacement for funding announcements that
  previously had only the overly broad Ecosystem tag. It includes announcements
  where the funding arrangement is a substantial part of the article.
- Remove **Tutorials**: it describes a format and conflicts with the existing
  Tutorials navigation category. Tag those posts by the technology they cover.
- Remove **Ecosystem**: the site as a whole serves the ecosystem, so this is not
  a useful discriminator between posts.
- Broad protocol roadmaps and progress recaps use **Roadmaps & Progress** rather
  than an arbitrary subset of the many technologies discussed.
- **SDKs & Tooling** covers SDKs and tools for developing atproto apps, not every
  application or service that happens to be software.

## News and remaining editorial decision

Use **News & Announcements** (`news`) for site, podcast, and community
announcements such as Going Off Protocol, Welcome to the New atproto.com, and
Bluesky Call for Developers. This is an editorial category approved for these
posts, not an additional label on every technical release announcement.

Building on the AT Protocol remains provisionally untagged: it is a broad
introductory overview of bots, clients, and feeds rather than an announcement or
a focused technical topic. It remains visible in the unfiltered archive and in
text search.

## Reviewed archive assignments

All 52 posts were reviewed individually. These are the proposed assignments and
the main-subject rationale for each; post prose is unchanged.

| Post slug                                                   | Topic IDs                      | Reason                                                                                                                             |
| ----------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| open-social-groups-vision                                   | spaces                         | Shared groups, membership, and access through Spaces; examples of apps are not a separate topic.                                   |
| atmospheric-groups-intro                                    | spaces                         | A walkthrough of Spaces-based groups and their architecture; remove the format-based Tutorials label.                              |
| devex-goals-for-spaces                                      | spaces, sync                   | Spaces network architecture and preserving Jetstream-style data consumption; not an SDK release.                                   |
| mysky-feed-infrastructure                                   | feeds                          | Feed ranking, candidate generation, recommendation APIs, and user controls.                                                        |
| atproto-spaces-alpha                                        | spaces, hosting, sdks          | Spaces alpha with substantive PDS deployment instructions and alpha SDK/sample-app setup.                                          |
| introducing-bluesky-protocol-services                       | sync, sdks, hosting            | Hosted network services, Jetstream replay, and new client SDKs are the actual releases.                                            |
| pds-customization-and-metrics                               | hosting, identity              | PDS observability and configuration, plus account/auth screen branding and connected-session fixes.                                |
| at-protocol-trademark                                       | governance                     | Trademark stewardship and usage policy; not a technical standards implementation.                                                  |
| pds-account-management                                      | identity                       | Account management and OAuth session revocation. Running on a PDS alone does not warrant Hosting.                                  |
| going-off-protocol                                          | news                           | Podcast and livestream launch announcement.                                                                                        |
| rpg-actor                                                   | lexicons                       | Portable game characters, interoperable records, and validation/provenance of game data.                                           |
| atmospheric-website                                         | lexicons, hosting              | Publishing Standard.site records and a substantial section on PDS self-hosting and migration.                                      |
| standard-site-bluesky-timeline                              | lexicons                       | Standard.site schemas, record verification, and interoperability with Bluesky previews.                                            |
| ts-sdk-upgrades                                             | sdks, lexicons                 | TypeScript package modernization, lex tooling, generated types, and Lexicon integration.                                           |
| report-based-moderation                                     | moderation                     | Ozone report queues, moderation roles, assignments, and audit history.                                                             |
| serving-the-for-you-feed                                    | feeds, hosting                 | Feed-serving implementation, databases, hardware, deployment, monitoring, and costs.                                               |
| indexing-standard-site                                      | sync, lexicons                 | Indexing Standard.site records using Tap/Jetstream; topic is indexing, not tutorial format.                                        |
| kicking-off-the-atp-working-group                           | governance                     | IETF working group formation, charter, participation, and standards process.                                                       |
| 2026-spring-roadmap                                         | roadmap                        | Broad progress and priorities across several protocol areas; classify the overview rather than select arbitrary subtopics.         |
| introducing-hubble-a-public-mirror-for-the-whole-atmosphere | hosting, sync, grants          | Whole-network mirroring and data availability, with a substantial explanation of the operating grant.                              |
| working-to-decentralize-fedcm                               | identity, governance, grants   | Federated browser sign-in, W3C standards advocacy, and the grant supporting that work.                                             |
| npmx-alpha-launch                                           | identity, grants               | Independent atproto signup/portable accounts and a grant announcement. An npm browser is not an atproto SDK release.               |
| plc-replicas                                                | identity, hosting              | DID-directory replication, auditability, and running an independent replica.                                                       |
| new-site-2026                                               | news                           | Website and documentation redesign announcement.                                                                                   |
| relay-rollout                                               | sync, hosting                  | Relay cutover, firehose cursors, consumer recovery, and operator impact.                                                           |
| introducing-tap                                             | sync, sdks                     | Repository backfill/recovery tooling and its CLI/client integration.                                                               |
| protocol-check-in-fall-2025                                 | roadmap                        | Broad progress report spanning developer experience, governance, hosting, identity, and private data.                              |
| taking-at-to-the-ietf                                       | governance                     | Standardization plans and IETF process; not a technical sync implementation guide.                                                 |
| plc-directory-org                                           | identity, governance           | Independent stewardship and policy for the PLC identity directory.                                                                 |
| oauth-improvements                                          | identity                       | OAuth clients, scopes, session lifetimes, security, and account authorization.                                                     |
| network-account-management                                  | identity                       | PDS account signup/management and OAuth flows; the main subject is account experience.                                             |
| relay-updates-sync-v1-1                                     | sync, hosting                  | Sync 1.1 implementation, relay deployment, and staged operational rollout.                                                         |
| 2025-protocol-roadmap-spring                                | roadmap                        | Forward-looking overview of sync, auth, accounts, and private-data plans.                                                          |
| looking-back-2024                                           | roadmap                        | Year-end progress overview across multiple protocol components.                                                                    |
| relay-ops                                                   | sync, hosting                  | Relay scaling, fan-out servers, firehose cursors, and operator guidance.                                                           |
| pinned-posts                                                | lexicons                       | Schema extension conflicts, validation, evolution, and interoperability.                                                           |
| jetstream                                                   | sync, hosting                  | Streaming architecture, filtering, server tradeoffs, hosted endpoints, and self-hostability; client-library mention is incidental. |
| oauth-atproto                                               | identity                       | Initial OAuth specification, authorization flows, and session/scopes plans.                                                        |
| label-grants                                                | moderation, grants             | A funding program specifically for labeling/moderation services.                                                                   |
| 2024-protocol-roadmap                                       | roadmap                        | Broad protocol/product priorities and progress; do not arbitrarily single out governance.                                          |
| atproto-grants-recipients                                   | grants                         | Grant awards across many unrelated project types; do not tag every recipient technology.                                           |
| atproto-grants                                              | grants                         | Grant program launch, eligibility, funding, and initial recipients.                                                                |
| self-host-federation                                        | hosting, identity              | Independent PDS operation and a dedicated account-migration section.                                                               |
| repo-export                                                 | sync                           | Repository export, CAR parsing, blob downloads, and bulk data retrieval.                                                           |
| protocol-roadmap                                            | roadmap                        | Broad pre-federation roadmap, operational plans, application development, and future governance.                                   |
| building-on-atproto                                         | — (pending editorial decision) | Editorial decision pending: broad overview of bots, clients, and feeds; none is the sole primary topic.                            |
| bgs-and-did-doc                                             | sync, identity, hosting        | Two explicit changes: BGS/firehose infrastructure rollout and DID-document key formatting.                                         |
| repo-sync-update                                            | sync                           | Repository revisions, logical clocks, ordering, and synchronization semantics.                                                     |
| create-post                                                 | lexicons                       | Post-record structures, facets, references, and embeds; authentication is a prerequisite rather than the main topic.               |
| call-for-developers                                         | news                           | Historical beta invite and developer recruitment announcement.                                                                     |
| federation-sandbox                                          | hosting                        | Operating PDSes and other services in the federation testing network; remove format-based Tutorials.                               |
| block-implementation                                        | moderation                     | Public-block implementation, enforcement, and privacy tradeoffs.                                                                   |

# Blog topics and search

Tags are stable topic IDs from `src/lib/blogTags.mjs`. Use Studio's Topics
checkboxes or the comma-separated prompt in `npm run blog create`. A new topic
requires adding its ID and label to the vocabulary first. Existing posts without
tags remain supported.

Posts store tags in the English MDX `header.tags` and the matching entry in
`src/lib/posts.ts`. Studio and the creation script write both. When editing by
hand, update both; the archive consistency test checks for drift. Blog routes
currently use English content in every locale; tags belong to the post, not a
translation. Search indexing also reads the English tags for translated entries.

The blog listing has topic filters without a separate search field. Readers can
select topics on `/blog`, follow topic links on posts, or type
`tag:spaces` in the existing sitewide search. Combine text and topics, for example
`oauth tag:spaces`. Multiple tags require all topics. Unknown tags produce no
results. Topic-only searches work without text. The blog preserves topic filters in `?q=`, supports back/forward navigation,
and lists each matching post
once in newest-first order. Topic counts describe the complete archive.

Saving/publishing preserves the tags and includes them in the standard.site
record. Backfilling this repository does not republish existing records; those
receive tags on their next publish.

## Proposed initial archive assignments

These assignments are part of the PR for editorial review. They classify primary
subjects rather than every passing mention; roadmap posts also carry a few
central technical topics. No post prose has been changed.

| Post slug                                                   | Topic IDs                       |
| ----------------------------------------------------------- | ------------------------------- |
| open-social-groups-vision                                   | spaces, ecosystem               |
| atmospheric-groups-intro                                    | spaces, tutorials               |
| devex-goals-for-spaces                                      | spaces, sdks                    |
| mysky-feed-infrastructure                                   | feeds, ecosystem                |
| atproto-spaces-alpha                                        | spaces, hosting, sdks           |
| introducing-bluesky-protocol-services                       | sync, sdks, hosting             |
| pds-customization-and-metrics                               | hosting, identity               |
| at-protocol-trademark                                       | governance                      |
| pds-account-management                                      | identity, hosting, oauth        |
| going-off-protocol                                          | ecosystem                       |
| rpg-actor                                                   | ecosystem, lexicons             |
| atmospheric-website                                         | tutorials, ecosystem            |
| standard-site-bluesky-timeline                              | lexicons, ecosystem             |
| ts-sdk-upgrades                                             | sdks, lexicons                  |
| report-based-moderation                                     | moderation                      |
| serving-the-for-you-feed                                    | feeds, hosting                  |
| indexing-standard-site                                      | tutorials, sync, lexicons       |
| kicking-off-the-atp-working-group                           | governance                      |
| 2026-spring-roadmap                                         | roadmap, spaces, identity       |
| introducing-hubble-a-public-mirror-for-the-whole-atmosphere | hosting, sync, ecosystem        |
| working-to-decentralize-fedcm                               | identity, governance, ecosystem |
| npmx-alpha-launch                                           | ecosystem, sdks                 |
| plc-replicas                                                | identity, hosting               |
| new-site-2026                                               | ecosystem                       |
| relay-rollout                                               | sync, hosting                   |
| introducing-tap                                             | sync, sdks                      |
| protocol-check-in-fall-2025                                 | roadmap, governance, spaces     |
| taking-at-to-the-ietf                                       | governance                      |
| plc-directory-org                                           | identity, governance            |
| oauth-improvements                                          | oauth, identity                 |
| network-account-management                                  | identity, oauth, hosting        |
| relay-updates-sync-v1-1                                     | sync, hosting                   |
| 2025-protocol-roadmap-spring                                | roadmap, sync, oauth, spaces    |
| looking-back-2024                                           | roadmap, lexicons, oauth, sync  |
| relay-ops                                                   | sync, hosting                   |
| pinned-posts                                                | lexicons                        |
| jetstream                                                   | sync, sdks                      |
| oauth-atproto                                               | oauth, identity                 |
| label-grants                                                | moderation, ecosystem           |
| 2024-protocol-roadmap                                       | roadmap, governance             |
| atproto-grants-recipients                                   | ecosystem                       |
| atproto-grants                                              | ecosystem                       |
| self-host-federation                                        | hosting, identity               |
| repo-export                                                 | tutorials, sync                 |
| protocol-roadmap                                            | roadmap, hosting, governance    |
| building-on-atproto                                         | ecosystem, tutorials            |
| bgs-and-did-doc                                             | sync, identity, hosting         |
| repo-sync-update                                            | sync                            |
| create-post                                                 | tutorials, lexicons             |
| call-for-developers                                         | ecosystem                       |
| federation-sandbox                                          | hosting, tutorials              |
| block-implementation                                        | moderation                      |

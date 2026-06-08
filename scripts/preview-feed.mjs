// scripts/preview-feed.mjs
//
// Preview the RSS feed against a known fixture. Run with:
//   npx tsx scripts/preview-feed.mjs
//
// Prints the generated XML to stdout. Pipe into a validator
// (validator.podcastindex.org) before announcing the feed publicly.
//
// Note: the namespace-import + `default ?? mod` dance mirrors
// scripts/publish-post.mjs. tsx compiles the project's .ts files to
// CommonJS under the current tsconfig, so named ESM imports of those
// modules return undefined. Going through the namespace makes the
// harness work without altering the .ts source.

import * as feedModule from '../src/lib/podcast-feed.ts'
import * as episodesModule from '../src/lib/episodes.ts'

const { buildPodcastFeed } = feedModule.default ?? feedModule
const { SHOW } = episodesModule.default ?? episodesModule

const fixture = [
  {
    slug: 'fixture-episode',
    episodeNumber: 1,
    title: 'Fixture Episode',
    description: 'A test episode used for previewing the feed.',
    date: 'May 7, 2026',
    pubDate: '2026-05-07T12:00:00Z',
    duration: '00:42:18',
    durationSeconds: 2538,
    guests: ['Test Guest'],
    audioUrl: 'https://cdn.example.com/off-protocol/ep-01.mp3',
    audioSizeBytes: 58291844,
    contentHtml: '<p>Show notes go here.</p>',
  },
]

console.log(buildPodcastFeed(SHOW, fixture))

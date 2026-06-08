# Off Protocol — Overnight Execution Notes

**Date:** 2026-05-07 → 2026-05-08
**Branch:** `feat/off-protocol`
**Result:** All 16 plan tasks completed and committed. Site builds (TSC clean for podcast surfaces) and serves at runtime. RSS feed validates structurally.

## What's working

Visit these in `npm run dev`:

- `http://localhost:3000/off-protocol` — listing page, empty state with "Run `npm run podcast create`" prompt
- `http://localhost:3000/off-protocol/rss.xml` — RSS 2.0 + iTunes feed, well-formed, 200 OK, `application/rss+xml`
- `http://localhost:3000/off-protocol/cover.svg` — placeholder cover, gradient with "OFF PROTOCOL · PLACEHOLDER · REPLACE BEFORE LAUNCH"

CLI:

- `npm run podcast` — usage
- `npm run podcast create` — scaffolder (interactive, fails fast on dirty git or unreachable audio URL)
- `npm run podcast remove` — interactive removal

## Deviations from the plan

### 1. RSS route moved out of `[locale]`

**Plan said:** `src/app/[locale]/off-protocol/rss.xml/route.ts`, with non-default locales 301 to default.

**Reality:** the i18n middleware matcher in `src/middleware.js` excludes paths containing `.`, so `/off-protocol/rss.xml` was unreachable as a bare URL — and a podcast feed must live at one canonical URL without a locale prefix. Moved to `src/app/off-protocol/rss.xml/route.ts`. The route handler is simpler (no locale-redirect logic). The MDX show notes still live under `[locale]/off-protocol/<slug>/en.mdx` and the route reads them directly via `fs/promises`.

This is the only structural plan deviation. Worth updating the spec/plan if you keep them as living docs.

### 2. Validation guards added to RSS builder (post-review)

After the code-quality review on Task 10, the feed builder grew two defensive guards:

- `toRfc822()` throws on invalid `pubDate` rather than emitting `<pubDate>Invalid Date</pubDate>` (which Apple/Overcast reject silently)
- `renderItem()` throws if `audioSizeBytes` is `0`, `NaN`, or non-integer (Overcast specifically chokes on bad enclosure lengths)

Also normalized `siteUrl` (strips trailing slash to prevent `https://atproto.com/off-protocol//slug` if `SHOW.siteUrl` ever gets a trailing `/`) and derived the cover-image origin from `siteUrl` instead of hardcoding `https://atproto.com` twice. These changes are in the `Harden podcast feed builder` commit.

### 3. Preview harness import idiom

`scripts/preview-feed.mjs` uses the `import * as mod` idiom (matching `scripts/publish-post.mjs`) instead of named imports — the project's tsx config doesn't support named imports from `.ts` in `.mjs`. Functional equivalence; just an idiomatic adaptation.

## Issues flagged during review (your call before launch)

These came up during per-task code reviews but were left as-is because they're either matters of site-wide convention or follow-ups rather than blockers:

### Important / pre-launch

- **`SHOW.language` is `'en-us'`** — BCP 47 / RFC 5646 conventions use uppercase region subtag (`'en-US'`). Apple is lenient, but Podcast Index validators flag it. One-line edit in `src/lib/episodes.ts`. Documented in the README pre-launch checklist.
- **External subscribe links open in the same tab.** The `SubscribeLinks` component renders plain `<a>` without `target="_blank"`. The pattern matches the rest of the site; flagging because subscribe buttons are arguably a different intent than typical footer links.
- **Audio element a11y.** `aria-label` on `<audio>` may not be announced by NVDA/JAWS — they navigate the controls inside the shadow DOM rather than the element itself. Consider wrapping the player in `<section aria-label="...">` if you want stronger landmark navigation. Not blocking; native `<audio controls>` is keyboard-accessible by default.
- **`<Image unoptimized>` on cover art.** Correct for SVG (Next would refuse to optimize SVG by default) but should be revisited if/when `cover.svg` gets replaced with a JPG — the optimization pipeline should run on raster.

### Minor / post-launch follow-ups

- **`<time>` on the listing page lacks `dateTime` attribute.** The episode HEADER has it; the listing card doesn't. Same omission exists on the blog listing today, so it's a site-wide consistency call rather than a podcast-specific defect.
- **No host/guest Bluesky linking.** `PageHeader.tsx` (blog) looks up author DIDs from `authors.json` and links to `bsky.app/profile/...`. `EpisodeHeader.tsx` renders host and guests as plain text. Worth wiring up similarly when guests start appearing.
- **`EpisodeHeaderProps` type leak.** Currently `Omit<Episode, 'slug' | 'hasTranscript' | 'blueskyPostUrl'>` — which means `audioSizeBytes`, `durationSeconds`, and `explicit` (RSS-only fields) are also exposed in the header's props bag. A tighter `Pick<>` would model the surface more precisely. Spread-from-MDX-header pattern works either way, so cosmetic.
- **`new-episode.mjs` regex anchor.** The script appends to `episodes.ts` by regex-replacing `export const episodes: Episode[] = [`. If anyone reformats that exact string (e.g., drops the explicit type annotation), the prepend will silently no-op. Not fixing pre-emptively; documenting.
- **Mobile nav coverage at `< sm`.** "Off Protocol" is `hidden sm:block` to keep the bar uncluttered on phones, mirroring the existing `SDKs` treatment. On viewports below `sm` (~640px), users discover the link via the mobile menu, which renders the same `<Header />` items — but `hidden sm:block` still applies inside the dialog. This is the existing pattern. If you want podcast more discoverable on mobile, a separate mobile nav entry would be needed.

## Pre-existing issues NOT related to this work

- **`npm run build` currently fails** with a TypeScript error in `src/lexicons/site/standard/document.defs.ts`:
  > `'@atproto/lex-schema/dist/external'` has no exported member named `TypedObject`. Did you mean `typedObject`?
  
  This is a `@atproto/lex` deps drift — verified pre-existing on `main` by reverting `document.defs.ts` and `package.json`/`package-lock.json` to main and observing the same error. Not introduced by anything in this branch (including the `rehype-stringify` install). Will need a separate fix to bring `@atproto/lex` and `@atproto/lex-schema` into version alignment.

- **`tsc --noEmit` reports errors only in `src/lexicons/site/standard/*` files.** Same root cause as above. Zero errors in any podcast file.

## Pre-launch checklist (also in README)

Search for `TODO(launch)` to find each in context:

- [ ] `SHOW.description` — real show description in `src/lib/episodes.ts`
- [ ] `SHOW.ownerEmail` — real owner email; Apple rejects feeds without one
- [ ] `SHOW.coverImage` — replace `/off-protocol/cover.svg` with a square JPEG/PNG (1400×1400 to 3000×3000), update the path in `episodes.ts`
- [ ] `SHOW.language` — change `'en-us'` to `'en-US'`
- [ ] At least one episode added via `npm run podcast create`
- [ ] Validate the feed at validator.podcastindex.org and castfeedvalidator.com before submitting

## Subagent execution stats

- 16 plan tasks
- ~25 subagent dispatches (implementer + spec review + code quality review on substantive tasks)
- 1 fix dispatch (Task 10 hardening)
- 0 BLOCKED outcomes; 1 task (Task 11) timed out mid-execution and was finished manually due to a discovered i18n routing issue
- All commits on `feat/off-protocol`, ready for review

## Files map

```
src/
  app/
    off-protocol/
      rss.xml/route.ts                  # un-localed RSS feed
    [locale]/
      off-protocol/
        page.tsx                        # listing
  components/
    SubscribeLinks.tsx
    EpisodeHeader.tsx
    EpisodeTranscript.tsx
    EpisodePage.tsx
    Header.tsx                          # MODIFIED: nav link added
  lib/
    episodes.ts                         # types, SHOW, episodes[]
    podcast-feed.ts                     # pure RSS XML builder, with input validation
    podcast-feed-content.ts             # MDX → HTML pipeline for content:encoded
public/
  off-protocol/
    cover.svg                           # placeholder (TODO(launch))
scripts/
  podcast.mjs                           # CLI dispatcher
  new-episode.mjs                       # podcast create
  remove-episode.mjs                    # podcast remove
  preview-feed.mjs                      # one-off feed verification harness
package.json                            # MODIFIED: rehype-stringify + podcast script
README.md                               # MODIFIED: Off Protocol section added
```

// scripts/lib/transcript.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  groupTurns,
  cleanText,
  applyGlossary,
  escapeMdx,
  splitParagraphs,
  toMdx,
} from './transcript.mjs'

// Segment shape from `mw transcribe --format json` (Parakeet v3). `words`,
// `id`, and timings are present in real output but unused by the converter.
const seg = (speaker, text) => ({ speaker, text, start: 0, end: 0, words: [] })

// --- groupTurns ---------------------------------------------------------

test('groupTurns merges consecutive segments from the same speaker', () => {
  const turns = groupTurns([
    seg('Speaker 2', 'Yeah, that is a good way to put it.'),
    seg('Speaker 2', 'There are also mandates.'),
    seg('Speaker 3', 'Thank you.'),
  ])
  assert.deepEqual(turns, [
    {
      speaker: 'Speaker 2',
      text: 'Yeah, that is a good way to put it. There are also mandates.',
    },
    { speaker: 'Speaker 3', text: 'Thank you.' },
  ])
})

test('groupTurns starts a new turn when a speaker returns', () => {
  const turns = groupTurns([
    seg('Speaker 2', 'One.'),
    seg('Speaker 3', 'Two.'),
    seg('Speaker 2', 'Three.'),
  ])
  assert.deepEqual(
    turns.map((t) => t.speaker),
    ['Speaker 2', 'Speaker 3', 'Speaker 2'],
  )
})

test('groupTurns collapses whitespace at segment joins', () => {
  const turns = groupTurns([
    seg('Speaker 1', ' Hi, '),
    seg('Speaker 1', '\nand welcome. '),
  ])
  assert.equal(turns[0].text, 'Hi, and welcome.')
})

test('groupTurns drops segments with no text', () => {
  const turns = groupTurns([
    seg('Speaker 1', 'Hi.'),
    seg('Speaker 2', '  '),
    seg('Speaker 1', 'Bye.'),
  ])
  assert.deepEqual(turns, [{ speaker: 'Speaker 1', text: 'Hi. Bye.' }])
})

// Parakeet capitalizes the first word of every segment, even mid-sentence.
test('groupTurns lowercases a mid-sentence capital at a segment join', () => {
  const turns = groupTurns([
    seg('Speaker 3', 'the community came through and we'),
    seg('Speaker 3', 'Managed to pull it off. We managed.'),
  ])
  assert.equal(
    turns[0].text,
    'the community came through and we managed to pull it off. We managed.',
  )
})

test('groupTurns keeps a capital at a join after a sentence end', () => {
  const turns = groupTurns([
    seg('Speaker 3', 'It is done.'),
    seg('Speaker 3', 'We shipped it, we did.'),
  ])
  assert.equal(turns[0].text, 'It is done. We shipped it, we did.')
})

test('groupTurns keeps names that are capitalized mid-sentence elsewhere', () => {
  const turns = groupTurns([
    seg('Speaker 2', 'messages coming across'),
    seg('Speaker 2', 'Coop. I send messages to coop and to Coop.'),
  ])
  assert.match(turns[0].text, /^messages coming across Coop\./)
})

test('groupTurns keeps words that never appear in lowercase', () => {
  const turns = groupTurns([
    seg('Speaker 1', 'Yeah'),
    seg('Speaker 1', 'I was at universities. Cassidy and I.'),
  ])
  assert.equal(turns[0].text, 'Yeah I was at universities. Cassidy and I.')
})

test('groupTurns uses the whole transcript to decide, across speakers', () => {
  const turns = groupTurns([
    seg('Speaker 2', 'so we can'),
    seg('Speaker 2', 'Make their own'),
    seg('Speaker 3', 'I make things.'),
  ])
  assert.equal(turns[0].text, 'so we can make their own')
})

// --- cleanText: fillers -------------------------------------------------

test('cleanText removes um and uh fillers with their trailing comma', () => {
  assert.equal(
    cleanText('Well, um, I think late last night uh Cassidy helped.'),
    'Well, I think late last night Cassidy helped.',
  )
})

test('cleanText removes a sentence-initial filler and recapitalizes', () => {
  assert.equal(
    cleanText('Fixes. Um but you know, our roadmap.'),
    'Fixes. But you know, our roadmap.',
  )
})

test('cleanText keeps words that only contain filler letters', () => {
  assert.equal(cleanText('Uhura said umbrella.'), 'Uhura said umbrella.')
})

// --- cleanText: repeated words -------------------------------------------

test('cleanText collapses stuttered repeats', () => {
  assert.equal(
    cleanText("I'm I'm I'm definitely doing that."),
    "I'm definitely doing that.",
  )
  assert.equal(
    cleanText("Yeah. It's it's really nice."),
    "Yeah. It's really nice.",
  )
})

test('cleanText keeps legitimate doubled words', () => {
  assert.equal(
    cleanText('I think that that is fine.'),
    'I think that that is fine.',
  )
  assert.equal(cleanText('She had had enough.'), 'She had had enough.')
})

test('cleanText keeps a repeated word across a sentence end', () => {
  assert.equal(cleanText('No action. No action.'), 'No action. No action.')
})

// --- cleanText: Parakeet spacing artifacts --------------------------------

test('cleanText rejoins version numbers split by a space', () => {
  assert.equal(cleanText('Congratulations on 1. 0.'), 'Congratulations on 1.0.')
  assert.equal(cleanText('the 1. 0. 1 release'), 'the 1.0.1 release')
})

test('cleanText removes the space before possessive apostrophes', () => {
  assert.equal(
    cleanText("which is Roost 's other platform"),
    "which is Roost's other platform",
  )
})

test('cleanText removes the space before a hyphenated suffix', () => {
  assert.equal(
    cleanText('not actually at Proto -specific'),
    'not actually at Proto-specific',
  )
})

test('cleanText removes spaces before trailing punctuation', () => {
  assert.equal(
    cleanText('the end-to-end . for actually'),
    'the end-to-end. for actually',
  )
})

// Parakeet writes "numergent.com" as "numergent. com".
test('cleanText rejoins a domain split after the dot', () => {
  assert.equal(
    cleanText('his blog at numergent. com is a must-read'),
    'his blog at numergent.com is a must-read',
  )
  assert.equal(cleanText('find us on bsky. app'), 'find us on bsky.app')
  assert.equal(
    cleanText('at stream. place every week'),
    'at stream.place every week',
  )
})

test('cleanText rejoins .network domains', () => {
  assert.equal(
    cleanText('go to bsky. network slash account'),
    'go to bsky.network slash account',
  )
})

// Joining first also stops the paragraph splitter treating "defector." as a
// sentence end and moving "com, a wonderful website" into the next paragraph.
test('toMdx keeps a split domain in one paragraph', () => {
  const words = Array.from({ length: 130 }, () => 'word').join(' ')
  const out = toMdx(
    [
      {
        speaker: 'Speaker 1',
        text: `${words} on defector. com, a wonderful website.`,
      },
    ],
    { 'Speaker 1': 'Jim Ray' },
  )
  assert.match(out, /defector\.com, a wonderful website\./)
})

test('cleanText rejoins a domain with several dots', () => {
  assert.equal(
    cleanText("I'm jimray. bsky. team there"),
    "I'm jimray.bsky.team there",
  )
})

test('cleanText keeps a sentence end before a capitalized word', () => {
  assert.equal(
    cleanText('We built an app. Social apps are hard.'),
    'We built an app. Social apps are hard.',
  )
  assert.equal(
    cleanText('It went well. Com was there.'),
    'It went well. Com was there.',
  )
})

test('cleanText keeps a sentence end before a word that is not a TLD', () => {
  assert.equal(cleanText('we use it. the end'), 'we use it. the end')
})

// --- applyGlossary --------------------------------------------------------

test('applyGlossary maps misheard atproto.com domains', () => {
  assert.equal(
    applyGlossary('head to appro.com for docs'),
    'head to atproto.com for docs',
  )
  assert.equal(applyGlossary('see adproto.com.'), 'see atproto.com.')
})

test('applyGlossary fixes Bluesky', () => {
  assert.equal(
    applyGlossary('right here at Blue Sky.'),
    'right here at Bluesky.',
  )
  assert.equal(
    applyGlossary('existing blue sky lexicons'),
    'existing Bluesky lexicons',
  )
})

test('applyGlossary fixes atproto.com split by the model', () => {
  assert.equal(
    applyGlossary('guides for at Proto. com, and'),
    'guides for atproto.com, and',
  )
  assert.equal(
    applyGlossary('guides for approto.com'),
    'guides for atproto.com',
  )
})

test('applyGlossary maps "app protocol" to AT Protocol', () => {
  assert.equal(
    applyGlossary('I use the app protocol for demos'),
    'I use the AT Protocol for demos',
  )
})

test('applyGlossary maps at Proto and App Proto to atproto', () => {
  assert.equal(
    applyGlossary('runs on the App Proto Network'),
    'runs on the atproto Network',
  )
  assert.equal(
    applyGlossary('not actually at Proto-specific'),
    'not actually atproto-specific',
  )
})

test('applyGlossary does not touch "at" followed by other words', () => {
  assert.equal(
    applyGlossary('look at protocols and at products'),
    'look at protocols and at products',
  )
})

test('applyGlossary fixes firehose', () => {
  assert.equal(
    applyGlossary('the entire fire hose directly'),
    'the entire firehose directly',
  )
  assert.equal(
    applyGlossary('or the direct fire host.'),
    'or the direct firehose.',
  )
})

test('applyGlossary fixes ROOST and Coop names', () => {
  assert.equal(applyGlossary('until Roos came along'), 'until ROOST came along')
  assert.equal(
    applyGlossary("Roost's other platform"),
    "ROOST's other platform",
  )
  assert.equal(
    applyGlossary('excited about Coupe 1.0'),
    'excited about Coop 1.0',
  )
})

test('applyGlossary fixes lexicons and Christchurch Call', () => {
  assert.equal(applyGlossary('those lexacons'), 'those lexicons')
  assert.equal(
    applyGlossary('we got Christ Church Call Foundation'),
    'we got Christchurch Call Foundation',
  )
})

test('applyGlossary fixes LLM and automod', () => {
  assert.equal(
    applyGlossary('ask maybe like an LOM and'),
    'ask maybe like an LLM and',
  )
  assert.equal(
    applyGlossary('use it as just pure automob,'),
    'use it as just pure automod,',
  )
})

test('applyGlossary writes "one point oh" as 1.0', () => {
  assert.equal(
    applyGlossary('a pretty amazing one point oh.'),
    'a pretty amazing 1.0.',
  )
})

test('applyGlossary writes the show name as Off Protocol, unhyphenated', () => {
  assert.equal(
    applyGlossary('welcome to another Off-Protocol show'),
    'welcome to another Off Protocol show',
  )
  assert.equal(
    applyGlossary('another off-protocol conversation'),
    'another Off Protocol conversation',
  )
})

test('applyGlossary lowercases "conversation" after the show name', () => {
  assert.equal(
    applyGlossary('another Off-Protocol Conversation where'),
    'another Off Protocol conversation where',
  )
})

// "Going off protocol" is an ordinary idiom; only the hyphen or the
// capitals mark the show name.
test('applyGlossary leaves lowercase unhyphenated "off protocol" alone', () => {
  assert.equal(
    applyGlossary('we went off protocol there'),
    'we went off protocol there',
  )
})

// Every "Tony" on the show so far has been Toni Schneider, Bluesky's CEO.
test("applyGlossary spells Toni Schneider's name with an i", () => {
  assert.equal(
    applyGlossary("Tony's interview with The Verge"),
    "Toni's interview with The Verge",
  )
  assert.equal(
    applyGlossary('a meeting with Tony, our CEO'),
    'a meeting with Toni, our CEO',
  )
})

test('applyGlossary leaves words that only start with Tony alone', () => {
  assert.equal(applyGlossary('the Tonys were great'), 'the Tonys were great')
})

test('applyGlossary accepts extra per-episode entries after the defaults', () => {
  assert.equal(
    applyGlossary('Skilla is optional', [[/\bSkilla\b/g, 'Scylla']]),
    'Scylla is optional',
  )
})

// --- escapeMdx ------------------------------------------------------------

test('escapeMdx escapes characters MDX reads as JSX or markdown', () => {
  assert.equal(
    escapeMdx('a {b} <c> *d* _e_ [f] `g` \\h'),
    'a \\{b\\} \\<c\\> \\*d\\* \\_e\\_ \\[f\\] \\`g\\` \\\\h',
  )
})

test('escapeMdx leaves ordinary prose alone', () => {
  const s = "It's $10 a month on OVH, 1.0 & end-to-end."
  assert.equal(escapeMdx(s), s)
})

// --- splitParagraphs ------------------------------------------------------

test('splitParagraphs keeps a short turn as one paragraph', () => {
  assert.deepEqual(splitParagraphs('One. Two. Three.', 100), [
    'One. Two. Three.',
  ])
})

test('splitParagraphs breaks a long turn at a sentence end after the word target', () => {
  const words = (n) => Array.from({ length: n }, () => 'word').join(' ')
  const text = `${words(6)}. ${words(3)}. ${words(4)}.`
  assert.deepEqual(splitParagraphs(text, 5), [
    `${words(6)}.`,
    `${words(3)}. ${words(4)}.`,
  ])
})

test('splitParagraphs does not break inside a version number', () => {
  assert.deepEqual(splitParagraphs('word word Coop 1.0 is out. More.', 2), [
    'word word Coop 1.0 is out.',
    'More.',
  ])
})

// --- toMdx ----------------------------------------------------------------

const SPEAKERS = {
  'Speaker 1': 'Jim Ray',
  'Speaker 2': 'Alex Garnett',
  'Speaker 3': 'Juliet Shen',
}

test('toMdx labels each turn with the mapped speaker name', () => {
  const out = toMdx(
    [
      { speaker: 'Speaker 2', text: 'Congratulations on 1. 0.' },
      { speaker: 'Speaker 3', text: 'Thank you. Thank you.' },
    ],
    SPEAKERS,
  )
  assert.match(out, /^\*\*Alex Garnett:\*\* Congratulations on 1\.0\.$/m)
  assert.match(out, /^\*\*Juliet Shen:\*\* Thank you\. Thank you\.$/m)
})

test('toMdx separates turns with a blank line', () => {
  const out = toMdx(
    [
      { speaker: 'Speaker 2', text: 'One.' },
      { speaker: 'Speaker 3', text: 'Two.' },
    ],
    SPEAKERS,
  )
  assert.match(out, /\*\*Alex Garnett:\*\* One\.\n\n\*\*Juliet Shen:\*\* Two\./)
})

test('toMdx cleans, applies the glossary, and escapes, in that order', () => {
  const out = toMdx(
    [{ speaker: 'Speaker 1', text: 'um, at Blue Sky we use {braces}.' }],
    SPEAKERS,
  )
  assert.match(out, /\*\*Jim Ray:\*\* At Bluesky we use \\\{braces\\\}\./)
})

test('toMdx labels only the first paragraph of a long turn', () => {
  const long = Array.from(
    { length: 30 },
    (_, i) => `Sentence number ${i} has some words in it.`,
  ).join(' ')
  const out = toMdx([{ speaker: 'Speaker 3', text: long }], SPEAKERS)
  const paragraphs = out
    .trim()
    .split('\n\n')
    .filter((p) => !p.startsWith('{/*'))
  assert.ok(paragraphs.length > 1, 'expected the long turn to split')
  assert.ok(paragraphs[0].startsWith('**Juliet Shen:** '))
  for (const p of paragraphs.slice(1))
    assert.ok(!p.startsWith('**'), `unexpected label: ${p.slice(0, 30)}`)
})

test('toMdx ends a turn with a period when the model left none', () => {
  const out = toMdx(
    [
      {
        speaker: 'Speaker 3',
        text: 'robust policy that people can make as well',
      },
      { speaker: 'Speaker 2', text: 'Right?' },
    ],
    SPEAKERS,
  )
  assert.match(out, /can make as well\.\n/)
  assert.match(out, /Right\?\n/)
})

test('toMdx drops turns that are empty after cleaning', () => {
  const out = toMdx(
    [
      { speaker: 'Speaker 2', text: 'One.' },
      { speaker: 'Speaker 3', text: 'Um.' },
      { speaker: 'Speaker 2', text: 'Two.' },
    ],
    SPEAKERS,
  )
  assert.doesNotMatch(out, /Juliet Shen/)
})

test('toMdx merges same-speaker turns that become adjacent after drops', () => {
  const out = toMdx(
    [
      { speaker: 'Speaker 2', text: 'One.' },
      { speaker: 'Speaker 3', text: 'Uh.' },
      { speaker: 'Speaker 2', text: 'Two.' },
    ],
    SPEAKERS,
  )
  assert.match(out, /\*\*Alex Garnett:\*\* One\. Two\./)
})

test('toMdx throws and names every speaker label missing from the map', () => {
  assert.throws(
    () =>
      toMdx(
        [
          { speaker: 'Speaker 1', text: 'Hi.' },
          { speaker: 'Speaker 4', text: 'Hi.' },
          { speaker: 'Speaker 5', text: 'Hi.' },
        ],
        SPEAKERS,
      ),
    /Speaker 4.*Speaker 5/,
  )
})

test('toMdx starts with a comment that says the file is generated', () => {
  const out = toMdx([{ speaker: 'Speaker 1', text: 'Hi.' }], SPEAKERS)
  assert.match(out, /^\{\/\*.*generated.*\*\/\}\n/i)
})

// --- outro ------------------------------------------------------------------

const OUTRO =
  'Thanks so much for listening and especially thank you to my guest, Ricardo Méndez. Off Protocol is a production of the Bluesky Developer Relations team. Our theme music was composed by Saleem Reshamwala.'

test('toMdx drops a final turn that is only the outro', () => {
  const out = toMdx(
    [
      { speaker: 'Speaker 2', text: 'Thanks for having me, man.' },
      { speaker: 'Speaker 1', text: OUTRO },
    ],
    { 'Speaker 1': 'Jim Ray', 'Speaker 2': 'Ricardo Méndez' },
  )
  assert.doesNotMatch(out, /for listening|production of|theme music/)
  assert.doesNotMatch(out, /\*\*Jim Ray:\*\*/)
  assert.match(out, /Thanks for having me, man\.\n$/)
})

test('toMdx keeps the real ending that shares a turn with the outro', () => {
  const out = toMdx(
    [
      {
        speaker: 'Speaker 1',
        text: `A perfect place to end. So thank you for that, Erin. ${OUTRO}`,
      },
    ],
    { 'Speaker 1': 'Jim Ray' },
  )
  assert.match(
    out,
    /\*\*Jim Ray:\*\* A perfect place to end\. So thank you for that, Erin\.\n$/,
  )
})

test('toMdx also cuts an outro that starts "Thank you so much for listening"', () => {
  const out = toMdx(
    [
      {
        speaker: 'Speaker 1',
        text: 'Bye now. Thank you so much for listening, and see you soon.',
      },
    ],
    { 'Speaker 1': 'Jim Ray' },
  )
  assert.match(out, /\*\*Jim Ray:\*\* Bye now\.\n$/)
})

test('toMdx leaves "thanks so much for listening" before the final turn alone', () => {
  const out = toMdx(
    [
      {
        speaker: 'Speaker 1',
        text: 'Thanks so much for listening to my rant, Alex.',
      },
      { speaker: 'Speaker 2', text: 'Any time.' },
    ],
    { 'Speaker 1': 'Jim Ray', 'Speaker 2': 'Alex Garnett' },
  )
  assert.match(out, /Thanks so much for listening to my rant, Alex\./)
})

test('toMdx leaves an episode without an outro unchanged at the end', () => {
  const out = toMdx([{ speaker: 'Speaker 1', text: 'Take care, everybody.' }], {
    'Speaker 1': 'Jim Ray',
  })
  assert.match(out, /\*\*Jim Ray:\*\* Take care, everybody\.\n$/)
})

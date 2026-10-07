// scripts/lib/transcript.mjs
//
// Turns MacWhisper JSON (`mw transcribe --speakers --format json`) into a
// readable transcript.mdx. Pure functions only — file and process I/O live
// in scripts/transcribe-episode.mjs.
//
// The output is "cleaned", not verbatim: fillers and stutters are removed,
// and known model mistakes on names and protocol terms are corrected. It is
// still a draft — a person reads it before hasTranscript flips to true.

const WORD = /[A-Za-z][\w'’]*/g
const ENDS_SENTENCE = /[.!?]["”’']?$/

/**
 * Merge consecutive same-speaker segments into turns of plain text.
 *
 * Parakeet capitalizes the first word of every segment, even mid-sentence.
 * At a join that doesn't follow a sentence end, the capital is dropped — but
 * only if the transcript also uses the word in lowercase and never
 * capitalizes it mid-sentence. That keeps names like "Coop" and "I".
 */
export function groupTurns(segments) {
  const texts = segments.map((s) => ({
    speaker: s.speaker,
    text: s.text.replace(/\s+/g, ' ').trim(),
  }))

  const lower = new Set()
  const midSentenceCaps = new Set()
  for (const { text } of texts) {
    for (const m of text.matchAll(WORD)) {
      const w = m[0]
      if (w[0] === w[0].toLowerCase()) lower.add(w)
      else if (
        m.index > 0 &&
        !ENDS_SENTENCE.test(text.slice(0, m.index).trimEnd())
      )
        midSentenceCaps.add(w)
    }
  }

  const turns = []
  for (const { speaker, text } of texts) {
    if (!text) continue
    const last = turns[turns.length - 1]
    if (last && last.speaker === speaker) {
      const first = text.match(/^[A-Z][\w'’]*/)?.[0]
      const decap =
        first &&
        !ENDS_SENTENCE.test(last.text) &&
        lower.has(first.toLowerCase()) &&
        !midSentenceCaps.has(first)
      last.text += ` ${decap ? text[0].toLowerCase() + text.slice(1) : text}`
    } else {
      turns.push({ speaker, text })
    }
  }
  return turns
}

// Marks where a sentence-initial filler was removed, so the next word can be
// capitalized. A control character can't appear in model output.
const CAP = '\u0001'

// `pre` decides whether the filler opens a sentence. A sentence-initial
// "Um." takes its period with it; a mid-sentence "um." leaves the period.
const FILLER = new RegExp(
  `(^|[.!?]\\s+|${CAP}|\\s+)(?:um+|uh+)\\b(,|\\.(?=\\s|$))?`,
  'gi',
)

// Words that are correctly doubled in ordinary speech.
const DOUBLES_OK = new Set(['that', 'had'])

export function cleanText(text) {
  let s = text
  let prev
  do {
    prev = s
    s = s.replace(FILLER, (_, pre, punct) => {
      if (pre === '' || pre === CAP || /[.!?]/.test(pre))
        return pre + (pre === CAP ? '' : CAP)
      return punct === '.' ? ' .' : ' '
    })
  } while (s !== prev)
  s = s
    .replace(new RegExp(`${CAP}\\s*([a-z])`, 'g'), (_, c) => c.toUpperCase())
    .replaceAll(CAP, '')

  s = s.replace(/\b([\w']+)(?:\s+\1\b)+/gi, (m, word) =>
    DOUBLES_OK.has(word.toLowerCase()) ? m : word,
  )

  // Parakeet spacing artifacts.
  s = s
    .replace(/(\d)\. (?=\d)/g, '$1.') // "1. 0. 1" -> "1.0.1"
    .replace(/ +(['’]s)\b/g, '$1') // "Roost 's" -> "Roost's"
    .replace(/(\w) +-(?=[A-Za-z])/g, '$1-') // "Proto -specific"
    .replace(/ +([.,!?;:])/g, '$1') // "end-to-end ."

  // "numergent. com" -> "numergent.com". Lowercase on both sides only, since a
  // real sentence end is followed by a capital. Repeated for "jimray. bsky. team".
  do {
    prev = s
    s = s.replace(SPLIT_DOMAIN, '$1.$2')
  } while (s !== prev)

  return s.replace(/\s+/g, ' ').trim()
}

const TLDS = [
  'com',
  'org',
  'net',
  'io',
  'dev',
  'app',
  'social',
  'team',
  'place',
  'network',
  'xyz',
  'fm',
  'tv',
]
const SPLIT_DOMAIN = new RegExp(
  `\\b([a-z0-9-]+)\\. ((?:[a-z0-9-]+\\.)*(?:${TLDS.join('|')}))\\b`,
  'g',
)

// Applied in order, so the atproto.com rule must run before the bare atproto
// rule. Add an entry when a mistake shows up in more than one episode; pass
// one-off fixes as `extra`.
export const GLOSSARY = [
  [/\b(?:at|app?) ?proto ?\. ?com\b/gi, 'atproto.com'],
  [/\b(?:appro|adproto)\.com\b/gi, 'atproto.com'],
  [/\b(?:at|app) protocol\b/gi, 'AT Protocol'],
  [/\b(?:at|app?) ?proto\b/gi, 'atproto'],
  [/\bblue ?sky\b/gi, 'Bluesky'],
  [/\bfire ?hos[et]\b/gi, 'firehose'],
  [/\bRoost?\b/g, 'ROOST'],
  [/\b(?:Coupe|koop)\b/gi, 'Coop'],
  [/\blexacon(s?)\b/gi, 'lexicon$1'],
  [/\bChrist ?[Cc]hurch Call\b/g, 'Christchurch Call'],
  [/\bLOM\b/g, 'LLM'],
  [/\bautomob\b/gi, 'automod'],
  [/\bone point oh\b/gi, '1.0'],
  // Every "Tony" on the show so far has been Toni Schneider, Bluesky's CEO.
  [/\bTony\b/g, 'Toni'],
  // Recurring names, from the review of the first 22 episodes (2026-10-06).
  [/\bFrazy\b/g, 'Frazee'],
  [/\bpfrazy\b/g, 'pfrazee'],
  [/\bBrian\b/g, 'Bryan'], // every one so far is Bryan Newbold
  [/\bITF\b/g, 'IETF'],
  [/\b(?:Black|Block) ?(?:Sky|side|Sci|site)\b/gi, 'Blacksky'],
  [/\b(?:Addy|ADI)\b/g, 'Attie'],
  [/\b(?:Ellick|Aleck)\b/g, 'Ellich'],
  [/\b(?:Stream ?(?:[Pp]lays|[Cc]lays|Place)|Screamplace)\b/g, 'Streamplace'],
  [/\b(?:Lawrence|Laurent) Hof+\b/g, 'Laurens Hof'],
  [/\bRumi\b/g, 'Roomy'],
  [/\bHol(?:gram|mgrid|ngren|man)\b/g, 'Holmgren'],
  [/\b(?:Abr?am(?:off|ow)|Abernoff|Amberw)\b/g, 'Abramov'],
  [/\bDivey\b/g, 'Divy'],
  [/\b(?:Joachinus|Jarkinis|Jerichenis)\b/g, 'Gerakines'],
  [/\bnorth ?sky\b/gi, 'Northsky'],
  [/\bTre(?:zi|ssy|zzy)\b/g, 'Trezy'], // trezy.codes, who makes HappyView
  [/\bHappy View\b/g, 'HappyView'],
  // House style.
  [/\b([Pp])ermission data\b/g, '$1ermissioned data'],
  [/\bstandard[ .]?(?:site|side|sight)\b/gi, 'standard.site'],
  // pckt is spoken "pocket". Only the capitalized or blog/cafe forms are safe
  // to change everywhere; a lowercase "pocket" is often a real pocket.
  [/\b(?:pocket|placket|pcckt|pcct|pckt)\.? ?blog\b/gi, 'pckt.blog'],
  [/\b(?:pocket|pcckt|pckt)\.? ?cafe\b/gi, 'pckt.cafe'],
  [/\bPocket\b/g, 'pckt'],
  [/\b(?:off[- ]?prints?|hoffprint|off-bridge|offcrit)\b/gi, 'Offprint'],
  // The show name. Lowercase "off protocol" with no hyphen is left alone,
  // because "going off protocol" is an ordinary idiom.
  [/\boff-protocol\b/gi, 'Off Protocol'],
  [/\bOff protocol\b/g, 'Off Protocol'],
  [/\bOff Protocol Conversation\b/g, 'Off Protocol conversation'],
]

export function applyGlossary(text, extra = []) {
  return [...GLOSSARY, ...extra].reduce(
    (s, [pattern, replacement]) => s.replace(pattern, replacement),
    text,
  )
}

export function escapeMdx(text) {
  return text.replace(/[\\{}<>*_[\]`]/g, '\\$&')
}

/** Split a turn into paragraphs of at least `targetWords`, at sentence ends. */
export function splitParagraphs(text, targetWords = 120) {
  const paragraphs = []
  let current = []
  let count = 0
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    current.push(sentence)
    count += sentence.split(/\s+/).length
    if (count >= targetWords) {
      paragraphs.push(current.join(' '))
      current = []
      count = 0
    }
  }
  if (current.length) paragraphs.push(current.join(' '))
  return paragraphs
}

// The show's spoken outro (credits, theme music, livestream plug) always
// opens with this line in the final turn. The page and the feed carry those
// credits already, so the transcript stops where the conversation does.
const OUTRO_START = /\bthank(?:s| you) so much for listening\b/gi

/** Cut the outro from the final turn, dropping the turn if nothing is left. */
function dropOutro(turns) {
  const last = turns[turns.length - 1]
  if (!last) return
  const starts = [...last.text.matchAll(OUTRO_START)]
  if (!starts.length) return
  last.text = last.text.slice(0, starts[starts.length - 1].index).trim()
  if (!last.text) turns.pop()
}

const HEADER =
  '{/* Generated from a MacWhisper transcript by scripts/lib/transcript.mjs. Edit freely: the script will not overwrite this file without --force. */}'

/**
 * @param turns     output of groupTurns
 * @param speakers  map of model labels to names, e.g. { 'Speaker 1': 'Jim Ray' }
 * @param options.glossary        extra [pattern, replacement] pairs
 * @param options.paragraphWords  word target for splitting long turns
 */
export function toMdx(
  turns,
  speakers,
  { glossary = [], paragraphWords = 120 } = {},
) {
  const cleaned = []
  for (const { speaker, text } of turns) {
    const t = applyGlossary(cleanText(text), glossary)
    if (!t) continue
    const last = cleaned[cleaned.length - 1]
    if (last && last.speaker === speaker) last.text += ` ${t}`
    else cleaned.push({ speaker, text: t })
  }
  dropOutro(cleaned)

  const unmapped = [...new Set(cleaned.map((t) => t.speaker))].filter(
    (s) => !speakers[s],
  )
  if (unmapped.length) {
    throw new Error(
      `No name for speaker label(s): ${unmapped.join(', ')}. Add them to the speaker map.`,
    )
  }

  const blocks = cleaned.flatMap(({ speaker, text }) =>
    splitParagraphs(
      ENDS_SENTENCE.test(text) ? text : `${text}.`,
      paragraphWords,
    ).map((p, i) =>
      i === 0
        ? `**${escapeMdx(speakers[speaker])}:** ${escapeMdx(p)}`
        : escapeMdx(p),
    ),
  )
  return `${HEADER}\n\n${blocks.join('\n\n')}\n`
}

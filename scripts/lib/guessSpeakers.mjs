// scripts/lib/guessSpeakers.mjs
//
// Guess which MacWhisper speaker label is which person, from what the
// transcript says. MacWhisper can't recognize a voice across files, so the
// only clues are in the text.
//
// Measured on the first 22 episodes, one clue held: people rarely say their
// own name. In a two-person episode, the label that keeps saying "Alex" is
// the other one. "The next speaker is whoever was just named" did not hold
// (every intro breaks it), and panels name everyone, so this only guesses for
// exactly two labels and two candidates. Everything else gets evidence only.
//
// Guesses are pre-filled but unconfirmed: a wrong one would put words in a
// real person's mouth, so the transcribe script refuses to write the MDX
// until a person has checked them.

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// A self-introduction weighs more than any number of mentions.
const SELF_INTRO_WEIGHT = 10
// Minimum lead of one assignment over the other.
const MIN_MARGIN = 2

export function guessSpeakers(segments, candidates) {
  const first = (n) => n.split(' ')[0]
  const firstCount = {}
  for (const n of candidates)
    firstCount[first(n)] = (firstCount[first(n)] ?? 0) + 1
  // Full name first, so "Alex Garnett" counts once, not as "Alex" too. A first
  // name two candidates share ("Jim") tells us nothing, so it isn't used.
  const pattern = (n) =>
    [
      esc(n),
      ...(firstCount[first(n)] === 1 && first(n) !== n ? [esc(first(n))] : []),
    ].join('|')
  const mentionRe = (n) => new RegExp(`(?<!\\w)(?:${pattern(n)})(?!\\w)`, 'g')
  const introRe = (n) =>
    new RegExp(`\\b(?:I'm|I am|my name is)\\s+(?:${pattern(n)})(?!\\w)`, 'gi')

  const labels = [...new Set(segments.map((s) => s.speaker))]
  const said = Object.fromEntries(labels.map((l) => [l, {}]))
  const intro = Object.fromEntries(labels.map((l) => [l, {}]))
  for (const { speaker, text } of segments) {
    for (const n of candidates) {
      const intros = text.match(introRe(n))?.length ?? 0
      const mentions = (text.match(mentionRe(n))?.length ?? 0) - intros
      if (intros) intro[speaker][n] = (intro[speaker][n] ?? 0) + intros
      if (mentions) said[speaker][n] = (said[speaker][n] ?? 0) + mentions
    }
  }

  const evidence = Object.fromEntries(
    labels.map((l) => [
      l,
      candidates.flatMap((n) => [
        ...(intro[l][n] ? [`introduces themself as "${n}"`] : []),
        ...(said[l][n] ? [`says "${n}" ×${said[l][n]}`] : []),
      ]),
    ]),
  )

  const speakers = Object.fromEntries(labels.map((l) => [l, '']))
  if (labels.length !== 2 || candidates.length !== 2)
    return { speakers, evidence }

  // Support for "labels[0] is candidates[0], labels[1] is candidates[1]". The
  // swapped assignment's support is exactly the negative of this.
  const [a, b] = labels
  const [x, y] = candidates
  const fit = (label, self, other) =>
    SELF_INTRO_WEIGHT *
      ((intro[label][self] ?? 0) - (intro[label][other] ?? 0)) +
    (said[label][other] ?? 0) -
    (said[label][self] ?? 0)
  const support = fit(a, x, y) + fit(b, y, x)

  if (support >= MIN_MARGIN) Object.assign(speakers, { [a]: x, [b]: y })
  else if (support <= -MIN_MARGIN) Object.assign(speakers, { [a]: y, [b]: x })
  return { speakers, evidence }
}

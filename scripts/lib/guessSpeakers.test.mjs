// scripts/lib/guessSpeakers.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { guessSpeakers } from './guessSpeakers.mjs'

const seg = (speaker, text) => ({ speaker, text, start: 0, end: 0, words: [] })
const JIM_ALEX = ['Jim Ray', 'Alex Garnett']

// --- evidence -------------------------------------------------------------

test('counts each name a label says, by full or first name', () => {
  const { evidence } = guessSpeakers(
    [
      seg('Speaker 1', 'Alex, welcome back. Alex Garnett is here.'),
      seg('Speaker 2', 'Jim, great to be here.'),
    ],
    JIM_ALEX,
  )
  assert.deepEqual(evidence['Speaker 1'], ['says "Alex Garnett" ×2'])
  assert.deepEqual(evidence['Speaker 2'], ['says "Jim Ray" ×1'])
})

test('does not use a first name that two candidates share', () => {
  const { evidence } = guessSpeakers(
    [seg('Speaker 1', 'Jim, thanks. Jim Calabro, welcome.')],
    ['Jim Ray', 'Jim Calabro'],
  )
  assert.deepEqual(evidence['Speaker 1'], ['says "Jim Calabro" ×1'])
})

test('matches names case-sensitively, so common words do not count', () => {
  const { evidence } = guessSpeakers(
    [seg('Speaker 1', 'On the eve of launch, we talked to Eve.')],
    ['Jim Ray', 'Eve Osman'],
  )
  assert.deepEqual(evidence['Speaker 1'], ['says "Eve Osman" ×1'])
})

test('records a self-introduction instead of a mention', () => {
  const { evidence } = guessSpeakers(
    [seg('Speaker 1', "Hello and welcome. I'm Jim Ray, your host.")],
    ['Jim Ray', 'Ethan Marcotte'],
  )
  assert.deepEqual(evidence['Speaker 1'], ['introduces themself as "Jim Ray"'])
})

test('lists a label with no evidence as empty', () => {
  const { evidence } = guessSpeakers(
    [seg('Speaker 1', 'Alex, hi.'), seg('Speaker 2', 'Hello there.')],
    JIM_ALEX,
  )
  assert.deepEqual(evidence['Speaker 2'], [])
})

// --- guesses: two labels, two candidates ----------------------------------

test('guesses by elimination: each label says the other name', () => {
  const { speakers } = guessSpeakers(
    [
      seg('Speaker 1', 'Alex, welcome back.'),
      seg('Speaker 2', 'Jim, great to be here.'),
      seg('Speaker 1', 'So, Alex, what is new?'),
    ],
    JIM_ALEX,
  )
  assert.deepEqual(speakers, {
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Alex Garnett',
  })
})

test('guesses when only one label gives evidence, if it is clear', () => {
  const { speakers } = guessSpeakers(
    [
      seg('Speaker 1', 'Welcome to the show.'),
      seg('Speaker 2', 'Thanks, Jim. Jim, it is great.'),
    ],
    ['Jim Ray', 'Toni Schneider'],
  )
  assert.deepEqual(speakers, {
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Toni Schneider',
  })
})

test('a self-introduction outweighs mentions', () => {
  const { speakers } = guessSpeakers(
    [
      seg('Speaker 1', "I'm Jim Ray. Ethan, welcome."),
      seg('Speaker 2', 'Thanks. As Ethan says, Ethan is me.'),
    ],
    ['Jim Ray', 'Ethan Marcotte'],
  )
  assert.deepEqual(speakers, {
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Ethan Marcotte',
  })
})

test('leaves both empty when the evidence is too thin', () => {
  const { speakers } = guessSpeakers(
    [seg('Speaker 1', 'Welcome, Alex.'), seg('Speaker 2', 'Hello.')],
    JIM_ALEX,
  )
  assert.deepEqual(speakers, { 'Speaker 1': '', 'Speaker 2': '' })
})

test('leaves both empty when the evidence points both ways', () => {
  const { speakers } = guessSpeakers(
    [
      seg('Speaker 1', 'Alex, Alex, hi.'),
      seg('Speaker 2', 'Alex and Alex again.'),
    ],
    JIM_ALEX,
  )
  assert.deepEqual(speakers, { 'Speaker 1': '', 'Speaker 2': '' })
})

// --- no guesses outside two-by-two ----------------------------------------

test('does not guess with three labels, but still gives evidence', () => {
  const r = guessSpeakers(
    [
      seg('Speaker 1', 'A conversation with Juliet. Hosted by Alex.'),
      seg('Speaker 2', 'Welcome, Juliet.'),
      seg('Speaker 3', 'Thank you.'),
    ],
    ['Jim Ray', 'Alex Garnett', 'Juliet Shen'],
  )
  assert.deepEqual(r.speakers, {
    'Speaker 1': '',
    'Speaker 2': '',
    'Speaker 3': '',
  })
  assert.deepEqual(r.evidence['Speaker 1'], [
    'says "Alex Garnett" ×1',
    'says "Juliet Shen" ×1',
  ])
})

// in-our-timeline: Paul and Daniel stood in for Jim, so two labels but three
// candidates. Two labels is not enough to know who is missing.
test('does not guess when there are more candidates than labels', () => {
  const r = guessSpeakers(
    [
      seg('Speaker 1', 'Standing in for Jim. Daniel?'),
      seg('Speaker 2', 'Paul, yes.'),
    ],
    ['Jim Ray', 'Paul Frazee', 'Daniel Holmgren'],
  )
  assert.deepEqual(r.speakers, { 'Speaker 1': '', 'Speaker 2': '' })
})

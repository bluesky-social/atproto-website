// public/off-protocol/event-utils.test.mjs
//
// Unit tests for the pure logic behind the <off-protocol-next> widget.
// Run: node --test "public/off-protocol/*.test.mjs"

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  sameUrlTarget,
  selectNextEvent,
  formatEventDateTime,
  formatCountdown,
  countdownText,
  pickStreamUrl,
  rkeyFromUri,
  buildEventLinks,
  pdsEndpoint,
} from './event-utils.mjs'

const DID = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz'
const MARKER = 'https://atproto.com/off-protocol'

// A real Off Protocol stream record (listRecords entry shape).
const offProtocol = (rkey, startsAt, endsAt, overrides = {}) => ({
  uri: `at://${DID}/community.lexicon.calendar.event/${rkey}`,
  value: {
    name: 'Off Protocol LIVE',
    startsAt,
    endsAt,
    timezone: 'America/New_York',
    status: 'community.lexicon.calendar.event#scheduled',
    uris: [
      { uri: 'https://stream.place/atproto.com', name: 'Streamplace' },
      { uri: 'https://atproto.com/off-protocol', name: 'Off Protocol' },
    ],
    ...overrides,
  },
})

// The real "Office Hours" record that shares the repo but is NOT an Off
// Protocol stream — the canonical negative case for the marker filter.
const officeHours = {
  uri: `at://${DID}/community.lexicon.calendar.event/3mk6entv3wcqt`,
  value: {
    name: 'Atmosphere Team Office Hours April 24',
    startsAt: '2026-04-24T19:30:00.000Z',
    status: 'community.lexicon.calendar.event#scheduled',
    uris: [],
  },
}

const NEXT = offProtocol(
  '3mnkocbxed2ki',
  '2026-06-10T17:00:00.000Z',
  '2026-06-10T17:30:00.000Z',
)
const BEFORE = Date.parse('2026-06-05T00:00:00Z')
const DURING = Date.parse('2026-06-10T17:15:00Z')
const AFTER = Date.parse('2026-06-11T00:00:00Z')

// --- sameUrlTarget --------------------------------------------------------

test('sameUrlTarget ignores scheme and trailing slash', () => {
  assert.equal(
    sameUrlTarget('https://atproto.com/off-protocol', 'http://atproto.com/off-protocol/'),
    true,
  )
})

test('sameUrlTarget distinguishes different paths', () => {
  assert.equal(
    sameUrlTarget('https://atproto.com/off-protocol', 'https://atproto.com/blog'),
    false,
  )
})

// --- selectNextEvent ------------------------------------------------------

test('selectNextEvent picks the Off Protocol stream and ignores Office Hours', () => {
  const chosen = selectNextEvent([NEXT, officeHours], BEFORE, MARKER)
  assert.equal(chosen.uri, NEXT.uri)
})

test('selectNextEvent returns null when no record carries the marker', () => {
  assert.equal(selectNextEvent([officeHours], BEFORE, MARKER), null)
})

test('selectNextEvent returns null once the latest stream has ended', () => {
  assert.equal(selectNextEvent([NEXT, officeHours], AFTER, MARKER), null)
})

test('selectNextEvent returns the stream during its live window', () => {
  const chosen = selectNextEvent([NEXT], DURING, MARKER)
  assert.equal(chosen.uri, NEXT.uri)
})

test('selectNextEvent skips a cancelled latest and falls back to the next upcoming match', () => {
  const cancelled = offProtocol(
    '3mzcancelled', '2026-06-24T17:00:00.000Z', '2026-06-24T17:30:00.000Z',
    { status: 'community.lexicon.calendar.event#cancelled' },
  )
  // newest-first ordering: cancelled is newer than NEXT
  const chosen = selectNextEvent([cancelled, NEXT, officeHours], BEFORE, MARKER)
  assert.equal(chosen.uri, NEXT.uri)
})

// --- formatEventDateTime --------------------------------------------------

test('formatEventDateTime renders the display-zone time with a GMT parenthetical', () => {
  assert.equal(
    formatEventDateTime('2026-06-10T17:00:00.000Z', 'America/New_York'),
    'June 10, 2026 · 1:00 PM EDT (5:00 PM GMT)',
  )
})

test('formatEventDateTime parenthetical always reads GMT, even from a UTC display zone', () => {
  assert.equal(
    formatEventDateTime('2026-06-10T17:00:00.000Z', 'UTC'),
    'June 10, 2026 · 5:00 PM UTC (5:00 PM GMT)',
  )
})

// --- formatCountdown ------------------------------------------------------

test('formatCountdown shows days, hours, minutes when over a day out', () => {
  const ms = ((4 * 86400) + (2 * 3600) + (14 * 60)) * 1000
  assert.equal(formatCountdown(ms), '4d 02h 14m')
})

test('formatCountdown shows hours, minutes, seconds under a day', () => {
  const ms = ((2 * 3600) + (14 * 60) + 5) * 1000
  assert.equal(formatCountdown(ms), '2h 14m 05s')
})

test('formatCountdown shows minutes and seconds under an hour', () => {
  assert.equal(formatCountdown(((14 * 60) + 5) * 1000), '14m 05s')
})

test('formatCountdown shows bare seconds under a minute', () => {
  assert.equal(formatCountdown(9 * 1000), '9s')
})

test('formatCountdown returns null at or past zero', () => {
  assert.equal(formatCountdown(0), null)
  assert.equal(formatCountdown(-5000), null)
})

// --- countdownText (only within 24h) -------------------------------------

test('countdownText shows a prefixed countdown within 24 hours', () => {
  const ms = ((22 * 3600) + (5 * 60) + 30) * 1000
  assert.equal(countdownText(ms), 'Starts in 22h 05m 30s')
})

test('countdownText is null when more than 24 hours out', () => {
  const ms = ((4 * 86400) + (2 * 3600)) * 1000
  assert.equal(countdownText(ms), null)
  assert.equal(countdownText(25 * 3600 * 1000), null)
})

test('countdownText is null at or past zero', () => {
  assert.equal(countdownText(0), null)
  assert.equal(countdownText(-1000), null)
})

// --- pickStreamUrl --------------------------------------------------------

test('pickStreamUrl extracts the stream.place link', () => {
  assert.equal(pickStreamUrl(NEXT.value.uris), 'https://stream.place/atproto.com')
})

test('pickStreamUrl returns null when no stream link present', () => {
  assert.equal(pickStreamUrl([]), null)
})

// --- rkeyFromUri ----------------------------------------------------------

test('rkeyFromUri returns the record key', () => {
  assert.equal(rkeyFromUri(NEXT.uri), '3mnkocbxed2ki')
})

// --- buildEventLinks ------------------------------------------------------

test('buildEventLinks builds Smoke Signal and atmo.rsvp URLs', () => {
  assert.deepEqual(buildEventLinks(DID, '3mnkocbxed2ki'), {
    smokeSignal: 'https://smokesignal.events/did:plc:ewvi7nxzyoun6zhxrhs64oiz/3mnkocbxed2ki',
    atmoRsvp: 'https://atmo.rsvp/p/did:plc:ewvi7nxzyoun6zhxrhs64oiz/e/3mnkocbxed2ki',
  })
})

// --- pdsEndpoint ----------------------------------------------------------

test('pdsEndpoint reads the PDS service endpoint from a DID document', () => {
  const doc = {
    service: [
      {
        id: '#atproto_pds',
        type: 'AtprotoPersonalDataServer',
        serviceEndpoint: 'https://enoki.us-east.host.bsky.network',
      },
    ],
  }
  assert.equal(pdsEndpoint(doc), 'https://enoki.us-east.host.bsky.network')
})

test('pdsEndpoint returns null when no PDS service is present', () => {
  assert.equal(pdsEndpoint({ service: [] }), null)
})

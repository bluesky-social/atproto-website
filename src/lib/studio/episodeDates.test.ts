import { describe, it, expect } from 'vitest'
import {
  isoToLocalInput,
  localInputToIso,
  isoToHumanDate,
  isoToDateStamp,
  dateDivergesFromPubDate,
} from './episodeDates'

describe('isoToLocalInput', () => {
  it('round-trips through localInputToIso', () => {
    const local = isoToLocalInput('2026-07-10T17:30:00.000Z')
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(localInputToIso(local)).toBe('2026-07-10T17:30:00.000Z')
  })

  it('is empty for a missing or unparseable value', () => {
    expect(isoToLocalInput('')).toBe('')
    expect(isoToLocalInput('not a date')).toBe('')
  })
})

describe('localInputToIso', () => {
  it('is empty for a missing or unparseable value', () => {
    expect(localInputToIso('')).toBe('')
    expect(localInputToIso('nope')).toBe('')
  })
})

describe('isoToDateStamp', () => {
  it('formats YYYY-MM-DD for R2 object keys', () => {
    // Midday UTC so the calendar day is the same in every plausible TZ.
    expect(isoToDateStamp('2026-07-10T12:00:00.000Z')).toBe('2026-07-10')
  })

  it('zero-pads single-digit months and days', () => {
    expect(isoToDateStamp('2026-03-05T12:00:00.000Z')).toBe('2026-03-05')
  })

  it('is empty for a missing or unparseable value', () => {
    expect(isoToDateStamp('')).toBe('')
    expect(isoToDateStamp('nope')).toBe('')
  })
})

describe('isoToHumanDate', () => {
  it('formats the long US date the episode page displays', () => {
    // Midday UTC so the calendar day is the same in every plausible TZ.
    expect(isoToHumanDate('2026-07-10T12:00:00.000Z')).toBe('July 10, 2026')
  })

  it('is empty for a missing or unparseable value', () => {
    expect(isoToHumanDate('')).toBe('')
    expect(isoToHumanDate('nope')).toBe('')
  })
})

describe('dateDivergesFromPubDate', () => {
  // The exact state episode 14 shipped in: the page said August 3 while the
  // feed said July 31, with nothing anywhere pointing it out.
  it('flags a display date on a different calendar day', () => {
    expect(
      dateDivergesFromPubDate('August 3, 2026', '2026-07-31T21:23:48.929Z'),
    ).toBe(true)
  })

  it('is quiet when both name the same day', () => {
    expect(
      dateDivergesFromPubDate('August 3, 2026', '2026-08-03T12:00:00.000Z'),
    ).toBe(false)
  })

  // "Follows the publish date; edit for custom wording" is a supported use, so
  // wording that names no specific day must not nag.
  it('is quiet for a month-only display date', () => {
    expect(dateDivergesFromPubDate('August 2026', '2026-08-03T12:00:00.000Z')).toBe(
      false,
    )
  })

  it('is quiet for wording that is not a date at all', () => {
    expect(dateDivergesFromPubDate('Summer 2026', '2026-08-03T12:00:00.000Z')).toBe(
      false,
    )
  })

  it('is quiet when either value is missing', () => {
    expect(dateDivergesFromPubDate('', '2026-08-03T12:00:00.000Z')).toBe(false)
    expect(dateDivergesFromPubDate('August 3, 2026', '')).toBe(false)
  })

  it('flags a year that differs even when the day matches', () => {
    expect(
      dateDivergesFromPubDate('August 3, 2025', '2026-08-03T12:00:00.000Z'),
    ).toBe(true)
  })
})

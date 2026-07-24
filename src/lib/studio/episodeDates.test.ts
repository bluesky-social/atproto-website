import { describe, it, expect } from 'vitest'
import {
  isoToLocalInput,
  localInputToIso,
  isoToHumanDate,
  isoToDateStamp,
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

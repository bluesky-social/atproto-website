import { describe, it, expect } from 'vitest'
import {
  studioPaths,
  episodePaths,
  r2Config,
  audioObjectKey,
  objectKeyFromUrl,
} from './paths'

describe('studioPaths', () => {
  it('resolves blog/posts/authors paths under cwd', () => {
    const p = studioPaths()
    expect(p.blogDir.endsWith('src/app/[locale]/blog')).toBe(true)
    expect(p.postsFile.endsWith('src/lib/posts.ts')).toBe(true)
    expect(p.authorsFile.endsWith('src/lib/authors.json')).toBe(true)
  })
})

describe('episodePaths', () => {
  it('resolves the off-protocol dir and episodes.ts under cwd', () => {
    const p = episodePaths()
    expect(p.podcastDir.endsWith('src/app/[locale]/off-protocol')).toBe(true)
    expect(p.episodesFile.endsWith('src/lib/episodes.ts')).toBe(true)
  })
})

describe('audioObjectKey', () => {
  const CONV = { guests: ['Juliet Shen'], format: 'conversation' } as const

  it('names the directory after the date and the first guest', () => {
    // Matches the folders already in the bucket, e.g. 2026-06-16-juliet-shen.
    expect(
      audioObjectKey('roost-v1-juliet-shen', '2026-06-16T12:00:00.000Z', CONV),
    ).toBe('off-protocol/2026-06-16-juliet-shen/roost-v1-juliet-shen.mp3')
  })

  // The regression this replaces: slugs now start with the publish date, so
  // interpolating the whole slug produced
  // off-protocol/2026-08-03-2026-08-03-designing-…/
  it('does not repeat the date when the slug already starts with one', () => {
    const key = audioObjectKey(
      '2026-08-03-designing-for-uncertainty-ethan-marcotte',
      '2026-08-03T12:00:00.000Z',
      { guests: ['Ethan Marcotte'], format: 'conversation' },
    )
    expect(key).toBe(
      'off-protocol/2026-08-03-ethan-marcotte/2026-08-03-designing-for-uncertainty-ethan-marcotte.mp3',
    )
    expect(key).not.toContain('2026-08-03-2026-08-03')
  })

  it('uses the format token when there is no guest to name', () => {
    expect(
      audioObjectKey('network-in-your-hand', '2026-07-08T12:00:00.000Z', {
        guests: [],
        format: 'livestream',
      }),
    ).toBe('off-protocol/2026-07-08-live/network-in-your-hand.mp3')
  })

  it('lets a guest win over the format, including for an AMA', () => {
    expect(
      audioObjectKey('ama-dholms-irons-still-hot', '2026-06-24T12:00:00.000Z', {
        guests: ['Daniel Holmgren'],
        format: 'ama',
      }),
    ).toBe('off-protocol/2026-06-24-daniel-holmgren/ama-dholms-irons-still-hot.mp3')
  })

  it('names a guestless conversation after the format too', () => {
    expect(
      audioObjectKey('solo-ep', '2026-07-01T12:00:00.000Z', {
        guests: [],
        format: 'conversation',
      }),
    ).toBe('off-protocol/2026-07-01-conversation/solo-ep.mp3')
  })

  it('uses only the first guest when there are several', () => {
    expect(
      audioObjectKey('npmx', '2026-02-27T12:00:00.000Z', {
        guests: ['Daniel Roe', 'Matias Capeletto', 'Zeu'],
        format: 'conversation',
      }),
    ).toBe('off-protocol/2026-02-27-daniel-roe/npmx.mp3')
  })

  it('slugifies the guest name', () => {
    // Same slugify the episode slugs use, so it mangles non-ASCII the same way
    // ('Björk' becomes 'bj-rk'). Consistency beats a special case here.
    expect(
      audioObjectKey('ep', '2026-07-01T12:00:00.000Z', {
        guests: ["Daniel O'Brien"],
        format: 'conversation',
      }),
    ).toBe('off-protocol/2026-07-01-daniel-o-brien/ep.mp3')
  })

  it('falls back to an undated directory when pubDate is missing', () => {
    expect(audioObjectKey('my-ep', '', CONV)).toBe('off-protocol/my-ep/my-ep.mp3')
    expect(audioObjectKey('my-ep', 'nonsense', CONV)).toBe(
      'off-protocol/my-ep/my-ep.mp3',
    )
  })
})

describe('objectKeyFromUrl', () => {
  const BASE = 'https://media.atproto.com'

  it('recovers the key from a stored audioUrl', () => {
    // The stored URL is authoritative: the key is fixed at upload time, so
    // recomputing it from slug + pubDate would miss a later date change.
    expect(
      objectKeyFromUrl(`${BASE}/off-protocol/2026-07-27-foo/foo.mp3`, BASE),
    ).toBe('off-protocol/2026-07-27-foo/foo.mp3')
  })

  it('tolerates a trailing slash on the base', () => {
    expect(objectKeyFromUrl(`${BASE}/a/b.mp3`, `${BASE}/`)).toBe('a/b.mp3')
  })

  it('returns null for audio hosted somewhere else', () => {
    // Never issue a delete for an object this bucket does not own.
    expect(objectKeyFromUrl('https://example.com/a/b.mp3', BASE)).toBeNull()
  })

  it('returns null when there is no audio at all', () => {
    expect(objectKeyFromUrl('', BASE)).toBeNull()
  })
})

describe('r2Config', () => {
  const VALID = {
    CLOUDFLARE_ACCOUNT_ID: 'acct123',
    R2_ACCESS_KEY_ID: 'ak',
    R2_SECRET_ACCESS_KEY: 'sk',
    R2_BUCKET: 'atproto-example',
    R2_PUBLIC_BASE: 'https://media.atproto.com',
  }

  function withEnv(over: Record<string, string | undefined>, fn: () => void) {
    const prev = { ...process.env }
    try {
      Object.assign(process.env, VALID, over)
      for (const [k, v] of Object.entries(over)) {
        if (v === undefined) delete process.env[k]
      }
      fn()
    } finally {
      process.env = prev
    }
  }

  it('reads the S3 credentials and derives the R2 endpoint', () => {
    withEnv({}, () => {
      expect(r2Config()).toEqual({
        accountId: 'acct123',
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
        bucket: 'atproto-example',
        publicBase: 'https://media.atproto.com',
        endpoint: 'https://acct123.r2.cloudflarestorage.com',
      })
    })
  })

  it('throws naming the variable that is missing', () => {
    withEnv({ R2_BUCKET: undefined }, () => {
      expect(() => r2Config()).toThrow(/R2_BUCKET/)
    })
  })

  it('rejects an unfilled placeholder rather than sending it upstream', () => {
    // A copied `<bucket name>` is non-empty, so a bare emptiness check lets it
    // through and Cloudflare answers with an opaque 403 two layers away.
    withEnv({ R2_SECRET_ACCESS_KEY: '<secret access key>' }, () => {
      expect(() => r2Config()).toThrow(/placeholder/i)
    })
    withEnv({ R2_BUCKET: 'bucket name' }, () => {
      expect(() => r2Config()).toThrow(/placeholder/i)
    })
  })
})

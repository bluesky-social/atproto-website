import { describe, expect, it } from 'vitest'
import { resolveSiteOrigin } from './site-url'

describe('resolveSiteOrigin', () => {
  it('uses the Render preview URL on a PR preview deploy', () => {
    expect(
      resolveSiteOrigin({
        IS_PULL_REQUEST: 'true',
        RENDER_EXTERNAL_URL: 'https://atproto-website-pr-695.onrender.com',
      }),
    ).toBe('https://atproto-website-pr-695.onrender.com')
  })

  it('uses the canonical origin on a production (non-PR) deploy', () => {
    expect(
      resolveSiteOrigin({
        IS_PULL_REQUEST: 'false',
        RENDER_EXTERNAL_URL: 'https://atproto-website.onrender.com',
      }),
    ).toBe('https://atproto.com')
  })

  it('uses the canonical origin when the env is empty (local/build)', () => {
    expect(resolveSiteOrigin({})).toBe('https://atproto.com')
  })

  it('does not use the preview URL if RENDER_EXTERNAL_URL is missing', () => {
    expect(resolveSiteOrigin({ IS_PULL_REQUEST: 'true' })).toBe(
      'https://atproto.com',
    )
  })
})

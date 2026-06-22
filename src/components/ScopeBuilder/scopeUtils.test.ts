import { describe, expect, it } from 'vitest'
import {
  isValidNsid,
  isPartialWildcard,
  buildScopeString,
  assembleScopeString,
  buildIncludeScopeString,
  buildPermissionSetLexicon,
  isInSetNamespace,
  emitCuratedScopeString,
} from './scopeUtils'
import type { CuratedScope, Permission, PermissionSetMeta } from './types'

describe('isValidNsid', () => {
  it('accepts a canonical reverse-domain NSID', () => {
    expect(isValidNsid('app.bsky.feed.post')).toBe(true)
  })
  it('accepts camelCase in the final name segment', () => {
    expect(isValidNsid('app.bsky.feed.getTimeline')).toBe(true)
    expect(isValidNsid('at.margin.collectionItem')).toBe(true)
  })
  it('accepts NSID with numbers in segments', () => {
    expect(isValidNsid('com.example.v2.post')).toBe(true)
  })
  it('rejects single-segment strings', () => {
    expect(isValidNsid('post')).toBe(false)
  })
  it('rejects two-segment strings', () => {
    expect(isValidNsid('app.bsky')).toBe(false)
  })
  it('rejects trailing dot', () => {
    expect(isValidNsid('app.bsky.')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidNsid('')).toBe(false)
  })
})

describe('isPartialWildcard', () => {
  it('flags partial wildcards like app.bsky.*', () => {
    expect(isPartialWildcard('app.bsky.*')).toBe(true)
  })
  it('flags partial wildcards like *.feed.post', () => {
    expect(isPartialWildcard('*.feed.post')).toBe(true)
  })
  it('does NOT flag the bare wildcard `*`', () => {
    expect(isPartialWildcard('*')).toBe(false)
  })
  it('does NOT flag a valid NSID', () => {
    expect(isPartialWildcard('app.bsky.feed.post')).toBe(false)
  })
})

describe('buildScopeString', () => {
  it('builds a repo scope with no actions (default elided)', () => {
    const p: Permission = { id: '1', resource: 'repo', collection: 'app.bsky.feed.post' }
    expect(buildScopeString(p)).toBe('repo:app.bsky.feed.post')
  })
  it('builds a repo scope with explicit actions', () => {
    const p: Permission = {
      id: '1',
      resource: 'repo',
      collection: 'app.bsky.feed.post',
      actions: ['create', 'update'],
    }
    expect(buildScopeString(p)).toBe(
      'repo:app.bsky.feed.post?action=create&action=update',
    )
  })
  it('builds a repo wildcard scope', () => {
    const p: Permission = { id: '1', resource: 'repo', collection: '*' }
    expect(buildScopeString(p)).toBe('repo:*')
  })
  it('builds an rpc scope with encoded aud', () => {
    const p: Permission = {
      id: '1',
      resource: 'rpc',
      lxm: 'app.bsky.feed.searchPosts',
      aud: 'did:web:api.bsky.app#bsky_appview',
    }
    expect(buildScopeString(p)).toBe(
      'rpc:app.bsky.feed.searchPosts?aud=did:web:api.bsky.app%23bsky_appview',
    )
  })
  it('builds an rpc scope with wildcard aud', () => {
    const p: Permission = {
      id: '1',
      resource: 'rpc',
      lxm: 'app.bsky.feed.searchPosts',
      aud: '*',
    }
    expect(buildScopeString(p)).toBe('rpc:app.bsky.feed.searchPosts?aud=*')
  })
  it('builds a blob scope with default accept', () => {
    const p: Permission = { id: '1', resource: 'blob', accept: ['*/*'] }
    expect(buildScopeString(p)).toBe('blob:*/*')
  })
  it('builds an account:email scope with default read action', () => {
    const p: Permission = { id: '1', resource: 'account', attr: 'email' }
    expect(buildScopeString(p)).toBe('account:email')
  })
  it('builds an account:repo?action=manage scope', () => {
    const p: Permission = { id: '1', resource: 'account', attr: 'repo', action: 'manage' }
    expect(buildScopeString(p)).toBe('account:repo?action=manage')
  })
  it('builds an identity:handle scope', () => {
    const p: Permission = { id: '1', resource: 'identity', attr: 'handle' }
    expect(buildScopeString(p)).toBe('identity:handle')
  })
  it('builds an identity:* scope', () => {
    const p: Permission = { id: '1', resource: 'identity', attr: '*' }
    expect(buildScopeString(p)).toBe('identity:*')
  })
})

describe('assembleScopeString', () => {
  // The library normalizes (sorts lexicographically and rejects invalid
  // tokens). Output ordering is now alphabetical, not insertion order.
  it('emits just atproto for an empty selection', () => {
    expect(assembleScopeString([])).toBe('atproto')
  })
  it('joins multiple scopes, sorted', () => {
    // 'atproto' sorts after 'account:email' and before 'blob' lexicographically;
    // confirm the ordering that comes out.
    expect(
      assembleScopeString(['repo:app.bsky.feed.post', 'blob:*/*']),
    ).toBe('atproto blob:*/* repo:app.bsky.feed.post')
  })
  it('deduplicates identical scopes before normalization', () => {
    expect(
      assembleScopeString(['blob:*/*', 'blob:*/*', 'repo:app.bsky.feed.post']),
    ).toBe('atproto blob:*/* repo:app.bsky.feed.post')
  })
  it('does not re-add atproto if caller included it', () => {
    expect(assembleScopeString(['atproto', 'repo:app.bsky.feed.post'])).toBe(
      'atproto repo:app.bsky.feed.post',
    )
  })
})

describe('buildIncludeScopeString', () => {
  it('builds an include: string with encoded aud', () => {
    expect(
      buildIncludeScopeString(
        'com.example.authBasic',
        'did:web:api.example.com#svc_appview',
      ),
    ).toBe('include:com.example.authBasic?aud=did:web:api.example.com%23svc_appview')
  })
  it('omits the ?aud= suffix when no aud given', () => {
    expect(buildIncludeScopeString('com.example.authBasic', '')).toBe(
      'include:com.example.authBasic',
    )
  })
})

describe('isInSetNamespace', () => {
  it('accepts a child NSID', () => {
    expect(isInSetNamespace('com.example.authBasic', 'com.example.post')).toBe(true)
  })
  it('accepts a grandchild NSID', () => {
    expect(
      isInSetNamespace('com.example.authBasic', 'com.example.feed.post'),
    ).toBe(true)
  })
  it('rejects a sibling NSID in a different subnamespace', () => {
    expect(
      isInSetNamespace('com.example.feed.authBasic', 'com.example.actor.profile'),
    ).toBe(false)
  })
  it('accepts a wildcard collection', () => {
    expect(isInSetNamespace('com.example.authBasic', '*')).toBe(true)
  })
})

describe('buildPermissionSetLexicon', () => {
  it('builds a complete Lexicon document from meta and permissions', () => {
    const meta: PermissionSetMeta = {
      nsid: 'com.example.authBasic',
      title: 'Basic',
      detail: 'Basic app access',
    }
    const permissions: Permission[] = [
      { id: '1', resource: 'repo', collection: 'com.example.post' },
      { id: '2', resource: 'rpc', lxm: 'com.example.getFeed', aud: '', inheritAud: true },
    ]
    expect(buildPermissionSetLexicon(meta, permissions)).toEqual({
      lexicon: 1,
      id: 'com.example.authBasic',
      defs: {
        main: {
          type: 'permission-set',
          title: 'Basic',
          detail: 'Basic app access',
          permissions: [
            { type: 'permission', resource: 'repo', collection: ['com.example.post'] },
            {
              type: 'permission',
              resource: 'rpc',
              lxm: ['com.example.getFeed'],
              inheritAud: true,
            },
          ],
        },
      },
    })
  })
  it('omits action field when not provided on repo', () => {
    const meta: PermissionSetMeta = { nsid: 'com.example.x', title: 't', detail: 'd' }
    const result = buildPermissionSetLexicon(meta, [
      { id: '1', resource: 'repo', collection: 'com.example.post' },
    ])
    expect(result.defs.main.permissions[0]).not.toHaveProperty('action')
  })
  it('skips permissions with unsupported resource types (blob/account/identity)', () => {
    const meta: PermissionSetMeta = { nsid: 'com.example.x', title: 't', detail: 'd' }
    const result = buildPermissionSetLexicon(meta, [
      { id: '1', resource: 'repo', collection: 'com.example.post' },
      { id: '2', resource: 'blob', accept: ['*/*'] },
      { id: '3', resource: 'account', attr: 'email' },
    ])
    expect(result.defs.main.permissions).toHaveLength(1)
  })
})

describe('emitCuratedScopeString', () => {
  const baseScope: CuratedScope = {
    id: 'app.bsky.authFullApp',
    label: 'Full Bluesky Social App',
    description: 'desc',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: 'include:app.bsky.authFullApp?aud=did:web:api.bsky.app%23bsky_appview',
    specLink: 'https://example.test',
    explanation: 'exp',
  }

  it('returns scopeString unchanged for entries without defaultAud', () => {
    const individual: CuratedScope = {
      ...baseScope,
      id: 'blob-any',
      kind: 'individual',
      resourceType: 'blob',
      scopeString: 'blob:*/*',
    }
    expect(emitCuratedScopeString(individual, undefined)).toBe('blob:*/*')
    expect(emitCuratedScopeString(individual, 'did:web:other#svc')).toBe('blob:*/*')
  })

  it('uses the default aud when no override is provided', () => {
    const scope: CuratedScope = {
      ...baseScope,
      defaultAud: 'did:web:api.bsky.app#bsky_appview',
    }
    expect(emitCuratedScopeString(scope, undefined)).toBe(
      'include:app.bsky.authFullApp?aud=did:web:api.bsky.app%23bsky_appview',
    )
  })

  it('uses the override aud when provided, percent-encoding the #', () => {
    const scope: CuratedScope = {
      ...baseScope,
      defaultAud: 'did:web:api.bsky.app#bsky_appview',
    }
    expect(emitCuratedScopeString(scope, 'did:web:staging.example#svc_appview')).toBe(
      'include:app.bsky.authFullApp?aud=did:web:staging.example%23svc_appview',
    )
  })

  it('omits the aud suffix when override is the empty string', () => {
    const scope: CuratedScope = {
      ...baseScope,
      defaultAud: 'did:web:api.bsky.app#bsky_appview',
    }
    expect(emitCuratedScopeString(scope, '')).toBe('include:app.bsky.authFullApp')
  })
})

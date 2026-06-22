// Wrappers over @atproto/oauth-scopes that adapt the library's strict types
// to the looser shapes our UI uses (form-state Permissions where most fields
// are optional, user-typed strings that may be partial). The library is the
// canonical serializer/validator for atproto OAuth scope strings — using it
// at runtime keeps our output format aligned with the spec.

import type { AtprotoDidRefAbsolute } from '@atproto/oauth-scopes'
import {
  AccountPermission,
  BlobPermission,
  IdentityPermission,
  IncludeScope,
  RepoPermission,
  RpcPermission,
  REPO_ACTIONS,
  isNsid,
  normalizeAtprotoOauthScope,
} from '@atproto/oauth-scopes'

import type {
  CuratedScope,
  Permission,
  PermissionSetMeta,
  PermissionSetLexicon,
  PermissionJsonForm,
} from './types'

// `Nsid` and `AtprotoDidRefAbsolute` from the library are template-literal types
// that strict-string-narrow at compile time. Our user inputs are plain
// strings and may be partial as the user types, so we cast at boundaries.
// The library's internal parsers/formatters will reject syntactically
// invalid strings via `fromString`, but the constructors and `toString()`
// are tolerant — they don't re-validate. That matches our display intent:
// show whatever the user has typed.
type Nsid = `${string}.${string}.${string}`

/** Re-exported library check; same effective regex as our previous regex. */
export const isValidNsid = (value: string): boolean => isNsid(value)

/**
 * Returns true if the string contains a `*` anywhere other than being
 * exactly `*`. Atproto scopes allow the bare wildcard but not partial
 * wildcards like `app.bsky.*`. UI validation only — the library doesn't
 * enforce this because permission sets technically can include partial
 * wildcards in some advanced cases. Stays hand-rolled.
 */
export function isPartialWildcard(value: string): boolean {
  if (value === '*') return false
  return value.includes('*')
}

/**
 * Renders a single Permission (our UI form-state) as a canonical scope
 * string. Dispatches to the matching library class per resource type so
 * the output always matches what the library would produce when parsing
 * its own output back.
 */
export function buildScopeString(p: Permission): string {
  switch (p.resource) {
    case 'repo': {
      const collection = (p.collection ?? '*') as '*' | Nsid
      // If the user didn't pick specific actions, treat that as "all" —
      // matches our previous behavior (no `?action=` suffix means default,
      // which the library elides on emit).
      const actions =
        p.actions && p.actions.length > 0
          ? (p.actions as unknown as ConstructorParameters<typeof RepoPermission>[1])
          : REPO_ACTIONS
      return new RepoPermission([collection], actions).toString()
    }
    case 'rpc': {
      const lxm = (p.lxm ?? '*') as '*' | Nsid
      // For inheritAud=true permissions (only valid inside a permission
      // set), there's no concrete audience to emit. Display as `aud=*`
      // so the preview string is at least valid; the JSON output via
      // buildPermissionSetLexicon handles inheritAud separately.
      const audValue = p.inheritAud || !p.aud ? '*' : p.aud
      return new RpcPermission(audValue as '*' | AtprotoDidRefAbsolute, [lxm]).toString()
    }
    case 'blob': {
      const accepts =
        p.accept && p.accept.length > 0 ? p.accept : ['*/*']
      return new BlobPermission(
        accepts as unknown as ConstructorParameters<typeof BlobPermission>[0],
      ).toString()
    }
    case 'account': {
      const attr = (p.attr ?? 'email') as 'email' | 'repo' | 'status'
      const action = [(p.action ?? 'read')] as readonly ['read' | 'manage']
      return new AccountPermission(attr, action).toString()
    }
    case 'identity': {
      const attr = (p.attr ?? '*') as '*' | 'handle'
      return new IdentityPermission(attr).toString()
    }
  }
}

/**
 * Joins individual scope strings into the final space-separated value
 * used in `oauth-client-metadata.json`. Adds `atproto` (always required),
 * dedupes, and normalizes via the library — invalid tokens drop and the
 * remainder are sorted alphabetically.
 *
 * Note: previously we put `atproto` first and preserved insertion order.
 * The library sorts lexicographically, so output ordering differs (e.g.
 * `account:email` precedes `atproto`). The auth server treats scopes as
 * a set so the order has no functional impact; the user-visible diff is
 * cosmetic.
 */
export function assembleScopeString(scopes: string[]): string {
  // Dedupe upfront — `normalizeAtprotoOauthScope` sorts and validates but
  // does not remove duplicates. Without this, callers passing 'atproto'
  // twice would produce 'atproto atproto ...'.
  const unique = [...new Set(['atproto', ...scopes])]
  return normalizeAtprotoOauthScope(unique.join(' '))
}

/**
 * Builds an `include:nsid?aud=...` scope string. Empty `aud` produces
 * `include:nsid` with no suffix. Library handles `#`→`%23` encoding.
 */
export function buildIncludeScopeString(setNsid: string, aud: string): string {
  return new IncludeScope(
    setNsid as Nsid,
    aud ? (aud as AtprotoDidRefAbsolute) : undefined,
  ).toString()
}

/**
 * Returns true when `candidateNsid` falls under the namespace hierarchy
 * of `setNsid`. Hand-rolled because the library's equivalent
 * (IncludeScope.isParentAuthorityOf) is protected. Currently unused by
 * the UI (we removed the namespace-mismatch warning) but kept for
 * future use and unit-tested.
 */
export function isInSetNamespace(setNsid: string, candidateNsid: string): boolean {
  if (candidateNsid === '*') return true
  const setParts = setNsid.split('.')
  const setNamespace = setParts.slice(0, -1).join('.')
  if (!setNamespace) return false
  return (
    candidateNsid === setNamespace ||
    candidateNsid.startsWith(setNamespace + '.')
  )
}

/**
 * Emits the final scope string for a curated entry, respecting an optional
 * user-provided audience override.
 *
 * - Scopes without `defaultAud` pass through their pre-computed
 *   `scopeString` unchanged (these are individual scopes like blob or
 *   account:email — no aud to override).
 * - Scopes with `defaultAud` re-emit via IncludeScope, using the override
 *   when present (including `''` to mean "user cleared the field, omit
 *   aud") or the default otherwise.
 */
export function emitCuratedScopeString(
  scope: CuratedScope,
  audOverride: string | undefined,
): string {
  if (!scope.defaultAud) return scope.scopeString
  // empty string explicitly omits aud; undefined means "no override"
  const audValue =
    audOverride === undefined ? scope.defaultAud : audOverride
  return new IncludeScope(
    scope.id as Nsid,
    audValue ? (audValue as AtprotoDidRefAbsolute) : undefined,
  ).toString()
}

/**
 * Constructs the permission-set Lexicon JSON document from metadata and
 * a list of internal Permission objects. Stays hand-rolled — the library
 * parses lexicons but doesn't author them, which is what this widget's
 * Permission Set Builder does.
 *
 * Only `repo` and `rpc` permissions are included; blob/account/identity
 * are silently dropped because they cannot be bundled in a permission
 * set per the atproto permission spec.
 */
export function buildPermissionSetLexicon(
  meta: PermissionSetMeta,
  permissions: Permission[],
): PermissionSetLexicon {
  const jsonPermissions: PermissionJsonForm[] = permissions
    .filter((p) => p.resource === 'repo' || p.resource === 'rpc')
    .map((p) => {
      if (p.resource === 'repo') {
        const out: PermissionJsonForm = {
          type: 'permission',
          resource: 'repo',
          collection: [p.collection ?? '*'],
        }
        if (p.actions && p.actions.length > 0) out.action = [...p.actions]
        return out
      }
      // rpc
      const out: PermissionJsonForm = {
        type: 'permission',
        resource: 'rpc',
        lxm: [p.lxm ?? '*'],
      }
      if (p.inheritAud) out.inheritAud = true
      else if (p.aud) out.aud = p.aud
      return out
    })

  return {
    lexicon: 1,
    id: meta.nsid,
    defs: {
      main: {
        type: 'permission-set',
        title: meta.title,
        detail: meta.detail,
        permissions: jsonPermissions,
      },
    },
  }
}

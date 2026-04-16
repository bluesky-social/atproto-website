import type { CuratedScope } from './types'

// ----------------------------------------------------------------------------
// TODO(team): Confirm the actual published Bluesky permission-set NSIDs and
// their bundled permissions. Placeholders below are best-guess and must be
// verified before shipping. Updating them is a one-file change; component
// code does not need to change.
// ----------------------------------------------------------------------------

const BSKY_APPVIEW_AUD = 'did:web:api.bsky.app#bsky_appview'

export const permissionSets: CuratedScope[] = [
  {
    id: 'bsky-basic-social',
    label: 'Basic social features',
    description: 'Create posts, likes, reposts, follows. Read profiles and feeds.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authBasicFeatures?aud=did:web:api.bsky.app%23bsky_appview`,
    expandedPermissions: [
      'repo:app.bsky.feed.post',
      'repo:app.bsky.feed.like',
      'repo:app.bsky.feed.repost',
      'repo:app.bsky.graph.follow',
      'rpc:app.bsky.actor.getProfile (inheritAud)',
      'rpc:app.bsky.feed.getAuthorFeed (inheritAud)',
      'rpc:app.bsky.feed.getTimeline (inheritAud)',
      'rpc:app.bsky.feed.getFeedSkeleton?aud=*',
    ],
    replacesTransition: 'transition:generic',
    specLink: '/guides/permission-sets',
    explanation:
      'Grants access to the core social features: creating posts, likes, reposts, and follows; reading profiles, author feeds, and the user\'s timeline. Shown to the user as a single grouped item in the authorization dialog.',
  },
  {
    id: 'bsky-chat',
    label: 'Direct messages',
    description: 'Read and send DMs via chat.bsky Lexicons.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:chat.bsky.authChat?aud=did:web:api.bsky.app%23bsky_chat`,
    expandedPermissions: [
      'rpc:chat.bsky.convo.getMessages (inheritAud)',
      'rpc:chat.bsky.convo.sendMessage (inheritAud)',
      'rpc:chat.bsky.convo.listConvos (inheritAud)',
    ],
    replacesTransition: 'transition:chat.bsky',
    specLink: '/guides/permission-sets',
    explanation:
      'Grants access to the Bluesky direct-message service. Replaces transition:chat.bsky. Requires the basic social features set as well.',
  },
  {
    id: 'bsky-moderation',
    label: 'Moderation tools',
    description: 'Mute, block, and report content or accounts.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authModeration?aud=did:web:api.bsky.app%23bsky_appview`,
    expandedPermissions: [
      'repo:app.bsky.graph.block',
      'repo:app.bsky.graph.mute',
      'rpc:com.atproto.moderation.createReport?aud=*',
    ],
    specLink: '/guides/permission-sets',
    explanation:
      'Grants the ability to mute or block accounts, and submit moderation reports to any moderation service.',
  },
]

export const individualScopes: CuratedScope[] = [
  {
    id: 'blob-any',
    label: 'Upload images & video',
    description: 'Required separately — blobs cannot be bundled into permission sets.',
    kind: 'individual',
    resourceType: 'blob',
    scopeString: 'blob:*/*',
    specLink: '/specs/permission#blob',
    explanation:
      'Allows uploading media files (images, videos) of any MIME type. This scope cannot be part of a permission set and must always be requested directly.',
  },
  {
    id: 'account-email-read',
    label: 'Read account email',
    description: 'Access the user\'s email address and verification status.',
    kind: 'individual',
    resourceType: 'account',
    scopeString: 'account:email',
    replacesTransition: 'transition:email',
    specLink: '/specs/permission#account',
    explanation:
      'Makes the account\'s email address and verification status visible via com.atproto.server.getSession. Replaces transition:email.',
  },
  {
    id: 'account-email-manage',
    label: 'Manage account email',
    description: 'Change the user\'s email address.',
    kind: 'individual',
    resourceType: 'account',
    scopeString: 'account:email?action=manage',
    specLink: '/specs/permission#account',
    explanation:
      'Allows reading AND changing the account\'s email address. Implies account:email.',
  },
  {
    id: 'identity-handle',
    label: 'Update handle',
    description: 'Change the user\'s handle (domain registered in their DID doc).',
    kind: 'individual',
    resourceType: 'identity',
    scopeString: 'identity:handle',
    specLink: '/specs/permission#identity',
    explanation:
      'Allows updating the account\'s handle. The PDS may not be able to facilitate this for did:web accounts.',
  },
  {
    id: 'identity-wildcard',
    label: 'Full identity control',
    description: 'Update handle and DID document. High-sensitivity — use sparingly.',
    kind: 'individual',
    resourceType: 'identity',
    scopeString: 'identity:*',
    specLink: '/specs/permission#identity',
    explanation:
      'Full control of the DID document and handle. This is a high-sensitivity scope and should only be requested by tools specifically designed for identity management.',
  },
  {
    id: 'account-repo-manage',
    label: 'Import repository (CAR file)',
    description: 'Replace the entire repository during account migration.',
    kind: 'individual',
    resourceType: 'account',
    scopeString: 'account:repo?action=manage',
    specLink: '/specs/permission#account',
    explanation:
      'Allows importing a CAR file to replace the entire public repository. Typically used during account migration between PDSes.',
  },
]

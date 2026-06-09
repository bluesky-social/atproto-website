import type { CuratedScope, ScopeApp } from './types'

// Bluesky appview audience DID. Two forms — unencoded (for human-readable
// editable fields) and percent-encoded (for direct use in scope strings).
const BSKY_APPVIEW_AUD = 'did:web:api.bsky.app#bsky_appview'
const BSKY_APPVIEW_AUD_ENCODED = 'did:web:api.bsky.app%23bsky_appview'
const BSKY_CHAT_AUD = 'did:web:api.bsky.app#bsky_chat'
const BSKY_CHAT_AUD_ENCODED = 'did:web:api.bsky.app%23bsky_chat'

// Lexicon Garden link helper. Takes a DID and NSID because different apps
// publish their schemas from different repos.
const lexiconGardenLink = (did: string, nsid: string) =>
  `https://lexicon.garden/lexicon/${did}/${nsid}`

const ALL_WRITE_ACTIONS = ['create', 'update', 'delete'] as const

// ----------------------------------------------------------------------------
// Apps: atproto applications that publish one or more permission-set Lexicons.
// Each app becomes a pill in the scope builder; clicking the pill reveals that
// app's permission sets below.
//
// To add a new app: add an entry here, then add one or more CuratedScope
// entries in permissionSets below with a matching `appId`.
// ----------------------------------------------------------------------------
const BSKY_DID = 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
const BEACONBITS_DID = 'did:plc:j5ttxzdb5kwo4mcqkmzgvt33'
const CHECKMATE_DID = 'did:plc:g2dztq6aggnn3tvimpebanu3'
const LEAFLET_DID = 'did:plc:btxrwcaeyodrap5mnjw2fvmz'
const MARGIN_DID = 'did:plc:rjqn3agdb74cszhqcpii4sne'
const PCKT_DID = 'did:plc:revjuqmkvrw6fnkxppqtszpv'
const STREAMPLACE_DID = 'did:plc:gqtagsooi75obldmytuow57q'

export const apps: ScopeApp[] = [
  { id: 'beaconbits', name: 'Beacon Bits', did: BEACONBITS_DID },
  { id: 'bluesky', name: 'Bluesky', did: BSKY_DID },
  { id: 'checkmate', name: 'Checkmate', did: CHECKMATE_DID },
  { id: 'leaflet', name: 'Leaflet', did: LEAFLET_DID },
  { id: 'margin', name: 'Margin', did: MARGIN_DID },
  { id: 'pckt', name: 'Pckt', did: PCKT_DID },
  { id: 'streamplace', name: 'Streamplace', did: STREAMPLACE_DID },
]

export const permissionSets: CuratedScope[] = [
  // ---- Bluesky ------------------------------------------------------------
  {
    id: 'app.bsky.authFullApp',
    appId: 'bluesky',
    label: 'Full Bluesky Social App',
    description: 'All public content, interactions, preferences, and app features.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authFullApp?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        'app.bsky.actor.profile',
        'app.bsky.actor.status',
        'app.bsky.feed.like',
        'app.bsky.feed.post',
        'app.bsky.feed.postgate',
        'app.bsky.feed.repost',
        'app.bsky.feed.threadgate',
        'app.bsky.graph.block',
        'app.bsky.graph.follow',
        'app.bsky.graph.list',
        'app.bsky.graph.listblock',
        'app.bsky.graph.listitem',
        'app.bsky.graph.starterpack',
        'app.bsky.notification.declaration',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
      rpc: [
        'app.bsky.actor.getPreferences',
        'app.bsky.actor.getProfile',
        'app.bsky.actor.getProfiles',
        'app.bsky.actor.getSuggestions',
        'app.bsky.actor.putPreferences',
        'app.bsky.actor.searchActors',
        'app.bsky.actor.searchActorsTypeahead',
        'app.bsky.bookmark.createBookmark',
        'app.bsky.bookmark.deleteBookmark',
        'app.bsky.bookmark.getBookmarks',
        'app.bsky.contact.dismissMatch',
        'app.bsky.contact.getMatches',
        'app.bsky.contact.getSyncStatus',
        'app.bsky.contact.importContacts',
        'app.bsky.contact.removeData',
        'app.bsky.contact.startPhoneVerification',
        'app.bsky.contact.verifyPhone',
        'app.bsky.feed.describeFeedGenerator',
        'app.bsky.feed.getActorFeeds',
        'app.bsky.feed.getActorLikes',
        'app.bsky.feed.getAuthorFeed',
        'app.bsky.feed.getFeed',
        'app.bsky.feed.getFeedGenerator',
        'app.bsky.feed.getFeedGenerators',
        'app.bsky.feed.getFeedSkeleton',
        'app.bsky.feed.getLikes',
        'app.bsky.feed.getListFeed',
        'app.bsky.feed.getPostThread',
        'app.bsky.feed.getPosts',
        'app.bsky.feed.getQuotes',
        'app.bsky.feed.getRepostedBy',
        'app.bsky.feed.getSuggestedFeeds',
        'app.bsky.feed.getTimeline',
        'app.bsky.feed.searchPosts',
        'app.bsky.feed.sendInteractions',
        'app.bsky.graph.getActorStarterPacks',
        'app.bsky.graph.getBlocks',
        'app.bsky.graph.getFollowers',
        'app.bsky.graph.getFollows',
        'app.bsky.graph.getKnownFollowers',
        'app.bsky.graph.getList',
        'app.bsky.graph.getListBlocks',
        'app.bsky.graph.getListMutes',
        'app.bsky.graph.getLists',
        'app.bsky.graph.getListsWithMembership',
        'app.bsky.graph.getMutes',
        'app.bsky.graph.getRelationships',
        'app.bsky.graph.getStarterPack',
        'app.bsky.graph.getStarterPacks',
        'app.bsky.graph.getStarterPacksWithMembership',
        'app.bsky.graph.getSuggestedFollowsByActor',
        'app.bsky.graph.muteActor',
        'app.bsky.graph.muteActorList',
        'app.bsky.graph.muteThread',
        'app.bsky.graph.searchStarterPacks',
        'app.bsky.graph.unmuteActor',
        'app.bsky.graph.unmuteActorList',
        'app.bsky.graph.unmuteThread',
        'app.bsky.labeler.getServices',
        'app.bsky.notification.getPreferences',
        'app.bsky.notification.getUnreadCount',
        'app.bsky.notification.listActivitySubscriptions',
        'app.bsky.notification.listNotifications',
        'app.bsky.notification.putActivitySubscription',
        'app.bsky.notification.putPreferences',
        'app.bsky.notification.putPreferencesV2',
        'app.bsky.notification.registerPush',
        'app.bsky.notification.unregisterPush',
        'app.bsky.notification.updateSeen',
        'app.bsky.unspecced.getAgeAssuranceState',
        'app.bsky.unspecced.getConfig',
        'app.bsky.unspecced.getOnboardingSuggestedStarterPacks',
        'app.bsky.unspecced.getPopularFeedGenerators',
        'app.bsky.unspecced.getPostThreadOtherV2',
        'app.bsky.unspecced.getPostThreadV2',
        'app.bsky.unspecced.getSuggestedFeeds',
        'app.bsky.unspecced.getSuggestedFeedsSkeleton',
        'app.bsky.unspecced.getSuggestedStarterPacks',
        'app.bsky.unspecced.getSuggestedStarterPacksSkeleton',
        'app.bsky.unspecced.getSuggestedUsers',
        'app.bsky.unspecced.getSuggestedUsersSkeleton',
        'app.bsky.unspecced.getSuggestionsSkeleton',
        'app.bsky.unspecced.getTaggedSuggestions',
        'app.bsky.unspecced.getTrendingTopics',
        'app.bsky.unspecced.getTrends',
        'app.bsky.unspecced.getTrendsSkeleton',
        'app.bsky.unspecced.initAgeAssurance',
        'app.bsky.unspecced.searchActorsSkeleton',
        'app.bsky.unspecced.searchPostsSkeleton',
        'app.bsky.unspecced.searchStarterPacksSkeleton',
        'app.bsky.video.getJobStatus',
        'app.bsky.video.getUploadLimits',
        'app.bsky.video.uploadVideo',
      ],
    },
    replacesTransition: 'transition:generic',
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authFullApp'),
    explanation:
      'The broadest Bluesky permission set. Grants full control of all public content and interactions, private preferences and subscriptions, and other Bluesky-specific app features. Equivalent to what transition:generic granted, but scoped to app.bsky Lexicons only.',
  },
  {
    id: 'app.bsky.authViewAll',
    appId: 'bluesky',
    label: 'Read-only access to all content',
    description: 'View Bluesky content from the account\'s perspective. No write access.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authViewAll?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      rpc: [
        'app.bsky.actor.getPreferences',
        'app.bsky.actor.getProfile',
        'app.bsky.actor.getProfiles',
        'app.bsky.actor.getSuggestions',
        'app.bsky.actor.searchActors',
        'app.bsky.actor.searchActorsTypeahead',
        'app.bsky.bookmark.getBookmarks',
        'app.bsky.feed.describeFeedGenerator',
        'app.bsky.feed.getActorFeeds',
        'app.bsky.feed.getActorLikes',
        'app.bsky.feed.getAuthorFeed',
        'app.bsky.feed.getFeed',
        'app.bsky.feed.getFeedGenerator',
        'app.bsky.feed.getFeedGenerators',
        'app.bsky.feed.getFeedSkeleton',
        'app.bsky.feed.getLikes',
        'app.bsky.feed.getListFeed',
        'app.bsky.feed.getPostThread',
        'app.bsky.feed.getPosts',
        'app.bsky.feed.getQuotes',
        'app.bsky.feed.getRepostedBy',
        'app.bsky.feed.getSuggestedFeeds',
        'app.bsky.feed.getTimeline',
        'app.bsky.feed.searchPosts',
        'app.bsky.graph.getActorStarterPacks',
        'app.bsky.graph.getBlocks',
        'app.bsky.graph.getFollowers',
        'app.bsky.graph.getFollows',
        'app.bsky.graph.getKnownFollowers',
        'app.bsky.graph.getListBlocks',
        'app.bsky.graph.getListMutes',
        'app.bsky.graph.getLists',
        'app.bsky.graph.getListsWithMembership',
        'app.bsky.graph.getMutes',
        'app.bsky.graph.getRelationships',
        'app.bsky.graph.getStarterPack',
        'app.bsky.graph.getStarterPacks',
        'app.bsky.graph.getStarterPacksWithMembership',
        'app.bsky.graph.getSuggestedFollowsByActor',
        'app.bsky.graph.searchStarterPacks',
        'app.bsky.labeler.getServices',
        'app.bsky.notification.getPreferences',
        'app.bsky.notification.getUnreadCount',
        'app.bsky.notification.listActivitySubscriptions',
        'app.bsky.notification.listNotifications',
        'app.bsky.notification.updateSeen',
        'app.bsky.unspecced.getAgeAssuranceState',
        'app.bsky.unspecced.getConfig',
        'app.bsky.unspecced.getOnboardingSuggestedStarterPacks',
        'app.bsky.unspecced.getPopularFeedGenerators',
        'app.bsky.unspecced.getPostThreadOtherV2',
        'app.bsky.unspecced.getPostThreadV2',
        'app.bsky.unspecced.getSuggestedFeeds',
        'app.bsky.unspecced.getSuggestedFeedsSkeleton',
        'app.bsky.unspecced.getSuggestedStarterPacks',
        'app.bsky.unspecced.getSuggestedStarterPacksSkeleton',
        'app.bsky.unspecced.getSuggestedUsers',
        'app.bsky.unspecced.getSuggestedUsersSkeleton',
        'app.bsky.unspecced.getSuggestionsSkeleton',
        'app.bsky.unspecced.getTaggedSuggestions',
        'app.bsky.unspecced.getTrendingTopics',
        'app.bsky.unspecced.getTrends',
        'app.bsky.unspecced.getTrendsSkeleton',
        'app.bsky.unspecced.searchActorsSkeleton',
        'app.bsky.unspecced.searchPostsSkeleton',
        'app.bsky.unspecced.searchStarterPacksSkeleton',
        'app.bsky.video.getUploadLimits',
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authViewAll'),
    explanation:
      'Read-only access to all Bluesky network content from the account\'s perspective, including notifications and preferences. No ability to create, update, or delete any records.',
  },
  {
    id: 'app.bsky.authCreatePosts',
    appId: 'bluesky',
    label: 'Create Bluesky Posts',
    description: 'Create new posts (cannot update or delete).',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authCreatePosts?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        { collection: 'app.bsky.feed.post', actions: ['create'] },
        { collection: 'app.bsky.feed.postgate', actions: ['create'] },
        { collection: 'app.bsky.feed.threadgate', actions: ['create'] },
      ],
      rpc: [
        'app.bsky.video.uploadVideo',
        'app.bsky.video.getJobStatus',
        'app.bsky.video.getUploadLimits',
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authCreatePosts'),
    explanation:
      'Create new posts, postgates, and threadgates. Includes video upload endpoints. Cannot update or delete existing posts.',
  },
  {
    id: 'app.bsky.authDeleteContent',
    appId: 'bluesky',
    label: 'Delete Bluesky Content',
    description: 'Clean up posts, reposts, and likes. Cannot create or update.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authDeleteContent?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        'app.bsky.feed.like',
        'app.bsky.feed.post',
        'app.bsky.feed.postgate',
        'app.bsky.feed.repost',
        'app.bsky.feed.threadgate',
      ].map((collection) => ({ collection, actions: ['delete'] as Array<'delete'> })),
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authDeleteContent'),
    explanation:
      'Delete posts, reposts, likes, postgates, and threadgates. Useful for cleanup tools. Cannot create or update content.',
  },
  {
    id: 'app.bsky.authManageProfile',
    appId: 'bluesky',
    label: 'Manage Bluesky Profile',
    description: 'Update profile, status, and chat visibility declaration.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authManageProfile?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        'app.bsky.actor.profile',
        'app.bsky.actor.status',
        'app.bsky.notification.declaration',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authManageProfile'),
    explanation:
      'Update the user\'s profile data, status, and public chat visibility declaration.',
  },
  {
    id: 'app.bsky.authManageNotifications',
    appId: 'bluesky',
    label: 'Manage Bluesky Notifications',
    description: 'View and configure notifications and push subscriptions.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authManageNotifications?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      rpc: [
        'app.bsky.notification.getPreferences',
        'app.bsky.notification.getUnreadCount',
        'app.bsky.notification.listActivitySubscriptions',
        'app.bsky.notification.listNotifications',
        'app.bsky.notification.putActivitySubscription',
        'app.bsky.notification.putPreferences',
        'app.bsky.notification.putPreferencesV2',
        'app.bsky.notification.registerPush',
        'app.bsky.notification.unregisterPush',
        'app.bsky.notification.updateSeen',
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authManageNotifications'),
    explanation:
      'Full control over Bluesky notification preferences, activity subscriptions, push registration, and read state.',
  },
  {
    id: 'app.bsky.authManageModeration',
    appId: 'bluesky',
    label: 'Manage Personal Moderation',
    description: 'Control blocks, mutes, moderation lists, and preferences.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authManageModeration?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        'app.bsky.graph.block',
        'app.bsky.graph.listblock',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
      rpc: [
        'app.bsky.actor.getPreferences',
        'app.bsky.actor.putPreferences',
        'app.bsky.graph.muteActor',
        'app.bsky.graph.muteActorList',
        'app.bsky.graph.muteThread',
        'app.bsky.graph.unmuteActor',
        'app.bsky.graph.unmuteActorList',
        'app.bsky.graph.unmuteThread',
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authManageModeration'),
    explanation:
      'Control over personal moderation features: blocking, muting (actors, lists, and threads), moderation list management, and preferences.',
  },
  {
    id: 'app.bsky.authManageFeedDeclarations',
    appId: 'bluesky',
    label: 'Manage Hosted Feeds',
    description: 'Configure feed generator declaration records.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authManageFeedDeclarations?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        { collection: 'app.bsky.feed.generator', actions: [...ALL_WRITE_ACTIONS] },
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authManageFeedDeclarations'),
    explanation:
      'Create, update, and delete feed generator declaration records. For developers hosting custom feed generators.',
  },
  {
    id: 'app.bsky.authManageLabelerService',
    appId: 'bluesky',
    label: 'Manage Hosted Labeling Service',
    description: 'Configure labeler declaration records.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.bsky.authManageLabelerService?aud=${BSKY_APPVIEW_AUD_ENCODED}`,
    defaultAud: BSKY_APPVIEW_AUD,
    expandedPermissions: {
      repo: [
        { collection: 'app.bsky.labeler.service', actions: [...ALL_WRITE_ACTIONS] },
      ],
    },
    specLink: lexiconGardenLink(BSKY_DID, 'app.bsky.authManageLabelerService'),
    explanation:
      'Create, update, and delete labeler service declaration records. For developers hosting labeling services.',
  },
  {
    id: 'chat.bsky.authFullChatClient',
    appId: 'bluesky',
    label: 'Full Chat Client',
    description: 'All chat conversations, reactions, and configuration.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:chat.bsky.authFullChatClient?aud=${BSKY_CHAT_AUD_ENCODED}`,
    defaultAud: BSKY_CHAT_AUD,
    expandedPermissions: {
      repo: [
        { collection: 'chat.bsky.actor.declaration', actions: [...ALL_WRITE_ACTIONS] },
      ],
      rpc: [
        'chat.bsky.actor.deleteAccount',
        'chat.bsky.convo.acceptConvo',
        'chat.bsky.convo.addReaction',
        'chat.bsky.convo.deleteMessageForSelf',
        'chat.bsky.convo.exportAccountData',
        'chat.bsky.convo.getConvo',
        'chat.bsky.convo.getConvoAvailability',
        'chat.bsky.convo.getConvoForMembers',
        'chat.bsky.convo.getLog',
        'chat.bsky.convo.getMessages',
        'chat.bsky.convo.leaveConvo',
        'chat.bsky.convo.listConvos',
        'chat.bsky.convo.muteConvo',
        'chat.bsky.convo.removeReaction',
        'chat.bsky.convo.sendMessage',
        'chat.bsky.convo.sendMessageBatch',
        'chat.bsky.convo.unmuteConvo',
        'chat.bsky.convo.updateAllRead',
        'chat.bsky.convo.updateRead',
      ],
    },
    replacesTransition: 'transition:chat.bsky',
    specLink: lexiconGardenLink(BSKY_DID, 'chat.bsky.authFullChatClient'),
    explanation:
      'Full control of all chat conversations: reading, sending, reacting, muting, and configuration management. Uses the chat.bsky namespace with its own audience DID.',
  },

  // ---- Beacon Bits --------------------------------------------------------
  {
    id: 'app.beaconbits.authCore',
    appId: 'beaconbits',
    label: 'Core Beacon Bits access',
    description: 'Create and manage check-ins, profile settings, favorites, and beacon likes.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.beaconbits.authCore`,
    expandedPermissions: {
      repo: [
        { collection: 'app.beaconbits.beacon', actions: [...ALL_WRITE_ACTIONS] },
        { collection: 'app.beaconbits.profile', actions: ['create', 'update'] },
        { collection: 'app.beaconbits.favorite', actions: ['create', 'delete'] },
        { collection: 'app.beaconbits.beacon.like', actions: ['create', 'delete'] },
      ],
    },
    specLink: lexiconGardenLink(BEACONBITS_DID, 'app.beaconbits.authCore'),
    explanation:
      'Core access to Beacon Bits: create and manage beacon check-ins, profile, favorites, and likes.',
  },
  {
    id: 'app.beaconbits.authEvents',
    appId: 'beaconbits',
    label: 'Beacon Bits event progress',
    description: 'Store event passes and collected event fragments.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.beaconbits.authEvents`,
    expandedPermissions: {
      repo: [
        { collection: 'app.beaconbits.pass', actions: ['create', 'update'] },
        { collection: 'app.beaconbits.fragment', actions: ['create'] },
      ],
    },
    specLink: lexiconGardenLink(BEACONBITS_DID, 'app.beaconbits.authEvents'),
    explanation:
      'Event participation in Beacon Bits: save event passes and collect event fragments.',
  },
  {
    id: 'app.beaconbits.authSavedPlaces',
    appId: 'beaconbits',
    label: 'Saved places and custom venues',
    description: 'Manage saved places, saved lists, and custom venues.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:app.beaconbits.authSavedPlaces`,
    expandedPermissions: {
      repo: [
        { collection: 'app.beaconbits.bookmark.item', actions: [...ALL_WRITE_ACTIONS] },
        { collection: 'app.beaconbits.bookmark.folder', actions: [...ALL_WRITE_ACTIONS] },
        { collection: 'app.beaconbits.venue', actions: [...ALL_WRITE_ACTIONS] },
      ],
    },
    specLink: lexiconGardenLink(BEACONBITS_DID, 'app.beaconbits.authSavedPlaces'),
    explanation:
      'Manage bookmarked places, bookmark folders, and user-defined venues in Beacon Bits.',
  },

  // ---- Checkmate ----------------------------------------------------------
  {
    id: 'blue.checkmate.authFullAccess',
    appId: 'checkmate',
    label: 'Full checkmate.blue Access',
    description: 'Create and manage chess games and challenges on checkmate.blue.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:blue.checkmate.authFullAccess`,
    expandedPermissions: {
      repo: [
        { collection: 'blue.checkmate.game', actions: [...ALL_WRITE_ACTIONS] },
        { collection: 'blue.checkmate.challenge', actions: [...ALL_WRITE_ACTIONS] },
      ],
    },
    specLink: lexiconGardenLink(CHECKMATE_DID, 'blue.checkmate.authFullAccess'),
    explanation:
      'Full access to Checkmate: create and manage chess games and challenge records.',
  },

  // ---- Leaflet ------------------------------------------------------------
  {
    id: 'pub.leaflet.authFullPermissions',
    appId: 'leaflet',
    label: 'Full Leaflet Permissions',
    description:
      'Manage creating and updating leaflet documents and publications and all interactions on them.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:pub.leaflet.authFullPermissions`,
    expandedPermissions: {
      repo: [
        'pub.leaflet.document',
        'pub.leaflet.publication',
        'pub.leaflet.comment',
        'pub.leaflet.poll.definition',
        'pub.leaflet.poll.vote',
        'pub.leaflet.graph.subscription',
        'pub.leaflet.interactions.recommend',
        'pub.leaflet.publicationPage',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
    },
    specLink: lexiconGardenLink(LEAFLET_DID, 'pub.leaflet.authFullPermissions'),
    explanation:
      'Full access to Leaflet: create, update, and delete documents, publications, comments, polls, subscriptions, recommendations, and publication pages.',
  },

  // ---- Margin -------------------------------------------------------------
  {
    id: 'at.margin.authFull',
    appId: 'margin',
    label: 'Margin',
    description: 'Full access to Margin features including notes, replies, likes, and collections.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:at.margin.authFull`,
    expandedPermissions: {
      repo: [
        'at.margin.note',
        'at.margin.reply',
        'at.margin.like',
        'at.margin.collection',
        'at.margin.collectionItem',
        'at.margin.profile',
        'at.margin.apikey',
        'at.margin.preferences',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
    },
    specLink: lexiconGardenLink(MARGIN_DID, 'at.margin.authFull'),
    explanation:
      'Full access to Margin: manage notes, replies, likes, collections, profile, API keys, and preferences.',
  },

  // ---- Pckt ---------------------------------------------------------------
  {
    id: 'blog.pckt.authFull',
    appId: 'pckt',
    label: 'pckt.blog',
    description: 'Manage your publication, document, and gallery references.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:blog.pckt.authFull`,
    expandedPermissions: {
      repo: [
        'blog.pckt.publication',
        'blog.pckt.document',
        'blog.pckt.gallery',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
    },
    specLink: lexiconGardenLink(PCKT_DID, 'blog.pckt.authFull'),
    explanation:
      'Full access to pckt.blog: manage publications, documents, and galleries.',
  },

  // ---- Streamplace --------------------------------------------------------
  {
    id: 'place.stream.authFull',
    appId: 'streamplace',
    label: 'Full Streamplace Access',
    description: 'Full access to all Streamplace features and data.',
    kind: 'permission-set',
    resourceType: 'include',
    scopeString: `include:place.stream.authFull`,
    expandedPermissions: {
      repo: [
        'place.stream.broadcast.origin',
        'place.stream.broadcast.syndication',
        'place.stream.chat.gate',
        'place.stream.chat.message',
        'place.stream.chat.profile',
        'place.stream.key',
        'place.stream.live.recommendations',
        'place.stream.live.teleport',
        'place.stream.livestream',
        'place.stream.metadata.configuration',
        'place.stream.moderation.permission',
        'place.stream.multistream.target',
        'place.stream.segment',
        'place.stream.server.settings',
      ].map((collection) => ({ collection, actions: [...ALL_WRITE_ACTIONS] })),
    },
    specLink: lexiconGardenLink(STREAMPLACE_DID, 'place.stream.authFull'),
    explanation:
      'Full access to Streamplace: manage broadcasts, chat, keys, livestreams, metadata, moderation, multistream, segments, and server settings.',
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
    supersededBy: 'account-email-manage',
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
    supersededBy: 'identity-wildcard',
    specLink: '/specs/permission#identity',
    warning: 'Warning',
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
    warning: 'Warning',
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

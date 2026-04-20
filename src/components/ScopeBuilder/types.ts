export type ResourceType = 'repo' | 'rpc' | 'blob' | 'account' | 'identity'
export type ScopeResourceType = ResourceType | 'include' | 'atproto' | 'transition'

export interface RepoPermission {
  collection: string // NSID
  actions: Array<'create' | 'update' | 'delete'>
}

export interface ExpandedPermissions {
  repo?: RepoPermission[]
  rpc?: string[] // endpoint NSIDs (lxm values); inheritAud is implicit in the set's scope string
}

export interface Permission {
  id: string
  resource: ResourceType
  collection?: string
  actions?: Array<'create' | 'update' | 'delete'>
  lxm?: string
  aud?: string
  inheritAud?: boolean
  accept?: string[]
  attr?: string
  action?: 'read' | 'manage'
}

export interface CuratedScope {
  id: string
  label: string
  description: string
  scopeString: string
  kind: 'permission-set' | 'individual'
  resourceType: ScopeResourceType
  expandedPermissions?: ExpandedPermissions
  replacesTransition?: 'transition:generic' | 'transition:chat.bsky' | 'transition:email'
  specLink: string
  explanation: string
  // For permission-set entries: which app "owns" this set. Used to group
  // sets under app pills in the UI. Individual scopes leave this undefined.
  appId?: string
  // Optional warning badge for high-sensitivity scopes (e.g. identity:*).
  // When set, renders a small amber badge next to the label.
  warning?: string
}

// An atproto application that publishes one or more permission-set Lexicons.
// Surfaced in the scope builder as a pill selector.
export interface ScopeApp {
  id: string
  name: string
  did: string
}

export interface PermissionSetMeta {
  nsid: string
  title: string
  detail: string
}

export interface PermissionSetLexicon {
  lexicon: 1
  id: string
  defs: {
    main: {
      type: 'permission-set'
      title: string
      detail: string
      permissions: PermissionJsonForm[]
    }
  }
}

export interface PermissionJsonForm {
  type: 'permission'
  resource: 'repo' | 'rpc'
  collection?: string[]
  action?: string[]
  lxm?: string[]
  aud?: string
  inheritAud?: boolean
}

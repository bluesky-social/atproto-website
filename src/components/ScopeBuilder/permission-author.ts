import {
  buildScopeString,
  buildPermissionSetLexicon,
  buildIncludeScopeString,
  isValidNsid,
  isPartialWildcard,
  isInSetNamespace,
} from './scopeUtils'
import type { Permission, PermissionSetMeta, ResourceType } from './types'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface PermissionAuthorState {
  permissions: Permission[]
  meta: PermissionSetMeta
  draftResource: ResourceType
  draft: Partial<Permission>
  draftError: string | null
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

let nextId = 1
function makeId(): string {
  return 'p' + ++nextId
}

// ---------------------------------------------------------------------------
// Escape helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// Custom element
// ---------------------------------------------------------------------------

class PermissionAuthorElement extends HTMLElement {
  private state: PermissionAuthorState = {
    permissions: [],
    meta: { nsid: '', title: '', detail: '' },
    draftResource: 'repo',
    draft: {},
    draftError: null,
  }

  private _handleChange!: (e: Event) => void
  private _handleInput!: (e: Event) => void
  private _handleClick!: (e: Event) => void

  connectedCallback() {
    this.id = 'permission-author'

    this._handleChange = (e: Event) => this.handleChange(e)
    this._handleInput = (e: Event) => this.handleInput(e)
    this._handleClick = (e: Event) => this.handleClick(e)

    this.addEventListener('change', this._handleChange)
    this.addEventListener('input', this._handleInput)
    this.addEventListener('click', this._handleClick)

    this.render()
  }

  disconnectedCallback() {
    this.removeEventListener('change', this._handleChange)
    this.removeEventListener('input', this._handleInput)
    this.removeEventListener('click', this._handleClick)
  }

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------

  private handleChange(e: Event) {
    const target = e.target as HTMLElement

    // Resource type dropdown
    if (target instanceof HTMLSelectElement && target.dataset.field === 'draftResource') {
      this.state.draftResource = target.value as ResourceType
      this.state.draft = {}
      this.state.draftError = null
      this.render()
      return
    }

    // Action checkboxes (repo create/update/delete)
    if (target instanceof HTMLInputElement && target.type === 'checkbox' && target.dataset.field === 'action') {
      const action = target.value as 'create' | 'update' | 'delete'
      const current = this.state.draft.actions ?? []
      if (target.checked) {
        this.state.draft.actions = [...current, action]
      } else {
        this.state.draft.actions = current.filter((a) => a !== action)
      }
      return
    }

    // inheritAud checkbox
    if (target instanceof HTMLInputElement && target.type === 'checkbox' && target.dataset.field === 'inheritAud') {
      this.state.draft.inheritAud = target.checked
      if (target.checked) {
        this.state.draft.aud = ''
      }
      return
    }

    // Select fields (account attr, account action, identity attr)
    if (target instanceof HTMLSelectElement && target.dataset.field) {
      const field = target.dataset.field as keyof Permission
      ;(this.state.draft as Record<string, unknown>)[field] = target.value
      return
    }
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLElement

    // Meta fields
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const field = target.dataset.field

      if (field === 'meta-nsid') {
        this.state.meta.nsid = target.value
        this.render()
        return
      }
      if (field === 'meta-title') {
        this.state.meta.title = target.value
        this.render()
        return
      }
      if (field === 'meta-detail') {
        this.state.meta.detail = target.value
        return
      }

      // Draft text inputs
      if (field && field.startsWith('draft-')) {
        const draftField = field.slice(6) as keyof Permission
        if (draftField === 'accept') {
          // Parse comma-separated MIME types into array
          const trimmed = target.value.trim()
          this.state.draft.accept = trimmed
            ? trimmed
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : []
        } else {
          ;(this.state.draft as Record<string, unknown>)[draftField] = target.value
        }
        return
      }
    }
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement

    // Add permission button
    const addBtn = target.closest('[data-action="add-permission"]') as HTMLButtonElement | null
    if (addBtn) {
      this.addPermission()
      return
    }

    // Remove permission button
    const removeBtn = target.closest('[data-action="remove-permission"]') as HTMLButtonElement | null
    if (removeBtn) {
      const id = removeBtn.dataset.permissionId
      if (id) {
        this.state.permissions = this.state.permissions.filter((p) => p.id !== id)
        this.render()
      }
      return
    }

    // Copy buttons
    const copyBtn = target.closest('[data-action="copy"]') as HTMLButtonElement | null
    if (copyBtn) {
      const prev = copyBtn.previousElementSibling
      if (prev) {
        const text = prev.textContent ?? ''
        navigator.clipboard.writeText(text).then(() => {
          const original = copyBtn.textContent
          copyBtn.textContent = 'Copied!'
          copyBtn.disabled = true
          setTimeout(() => {
            copyBtn.textContent = original
            copyBtn.disabled = false
          }, 1500)
        })
      }
    }
  }

  // -------------------------------------------------------------------------
  // Permission logic
  // -------------------------------------------------------------------------

  private addPermission() {
    const { draftResource, draft } = this.state

    // Validate
    if (draftResource === 'repo') {
      const collection = draft.collection ?? ''
      if (collection && collection !== '*' && !isValidNsid(collection)) {
        this.state.draftError = 'Collection must be a valid NSID (e.g. app.bsky.feed.post) or * for all.'
        this.render()
        return
      }
      if (collection && isPartialWildcard(collection)) {
        this.state.draftError = 'Partial wildcards (e.g. app.bsky.*) are not allowed. Use a full NSID or *.'
        this.render()
        return
      }
    }

    if (draftResource === 'rpc') {
      const lxm = draft.lxm ?? ''
      if (lxm && lxm !== '*' && !isValidNsid(lxm)) {
        this.state.draftError = 'Endpoint must be a valid NSID (e.g. app.bsky.feed.getTimeline) or *.'
        this.render()
        return
      }
      if (lxm && isPartialWildcard(lxm)) {
        this.state.draftError = 'Partial wildcards are not allowed. Use a full NSID or *.'
        this.render()
        return
      }
      if (!draft.aud && !draft.inheritAud) {
        this.state.draftError = 'Either enter an audience DID or check "Inherit audience from OAuth client."'
        this.render()
        return
      }
    }

    const permission: Permission = {
      id: makeId(),
      resource: draftResource,
      ...draft,
    }

    this.state.permissions = [...this.state.permissions, permission]
    this.state.draft = {}
    this.state.draftError = null
    this.render()
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  private renderDraftFields(): string {
    const { draftResource, draft } = this.state

    if (draftResource === 'repo') {
      const createChecked = draft.actions?.includes('create') ? 'checked' : ''
      const updateChecked = draft.actions?.includes('update') ? 'checked' : ''
      const deleteChecked = draft.actions?.includes('delete') ? 'checked' : ''
      return `
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Collection NSID</label>
            <input
              type="text"
              data-field="draft-collection"
              value="${escapeAttr(draft.collection ?? '')}"
              placeholder="app.bsky.feed.post or *"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <fieldset>
            <legend class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Actions (leave unchecked for all)</legend>
            <div class="flex flex-wrap gap-4">
              ${['create', 'update', 'delete']
                .map((a) => {
                  const checked = draft.actions?.includes(a as 'create' | 'update' | 'delete') ? 'checked' : ''
                  return `<label class="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" data-field="action" value="${a}" ${checked} class="accent-blue-600" />
                    ${a}
                  </label>`
                })
                .join('')}
            </div>
          </fieldset>
        </div>`
    }

    if (draftResource === 'rpc') {
      const inheritChecked = draft.inheritAud ? 'checked' : ''
      const audDisabled = draft.inheritAud ? 'disabled' : ''
      return `
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint NSID</label>
            <input
              type="text"
              data-field="draft-lxm"
              value="${escapeAttr(draft.lxm ?? '')}"
              placeholder="app.bsky.feed.getTimeline or *"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Audience DID</label>
            <input
              type="text"
              data-field="draft-aud"
              value="${escapeAttr(draft.aud ?? '')}"
              placeholder="did:web:bsky.social"
              ${audDisabled}
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" data-field="inheritAud" ${inheritChecked} class="accent-blue-600" />
            Inherit audience from OAuth client
          </label>
        </div>`
    }

    if (draftResource === 'blob') {
      const acceptDisplay = Array.isArray(draft.accept) ? draft.accept.join(', ') : ''
      return `
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Accepted MIME types</label>
          <input
            type="text"
            data-field="draft-accept"
            value="${escapeAttr(acceptDisplay)}"
            placeholder="image/jpeg, image/png (leave blank for */*)"
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Comma-separated. Leave blank to allow all types (*/*)</p>
        </div>`
    }

    if (draftResource === 'account') {
      const currentAttr = draft.attr ?? 'email'
      const currentAction = draft.action ?? 'read'
      return `
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attribute</label>
            <select
              data-field="attr"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ${['email', 'repo']
                .map(
                  (v) =>
                    `<option value="${v}" ${currentAttr === v ? 'selected' : ''}>${v}</option>`,
                )
                .join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
            <select
              data-field="action"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ${['read', 'manage']
                .map(
                  (v) =>
                    `<option value="${v}" ${currentAction === v ? 'selected' : ''}>${v}</option>`,
                )
                .join('')}
            </select>
          </div>
        </div>`
    }

    if (draftResource === 'identity') {
      const currentAttr = draft.attr ?? 'handle'
      return `
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attribute</label>
          <select
            data-field="attr"
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ${['handle', '*']
              .map(
                (v) =>
                  `<option value="${v}" ${currentAttr === v ? 'selected' : ''}>${v === '*' ? '* (all identity attributes)' : v}</option>`,
              )
              .join('')}
          </select>
        </div>`
    }

    return ''
  }

  private renderOutput(): string {
    const { permissions, meta } = this.state
    const metaFilled = !!(meta.nsid || meta.title)

    if (permissions.length === 0) {
      return `
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Add a permission to see its scope string.
        </div>`
    }

    if (permissions.length === 1 && !metaFilled) {
      const scopeStr = buildScopeString(permissions[0])
      return `
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Scope string</span>
            <button
              data-action="copy"
              class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
            >Copy</button>
          </div>
          <pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">${escapeHtml(scopeStr)}</pre>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Add more permissions or fill in a permission set name to generate a full Lexicon.
        </p>`
    }

    // Permission-set mode: 2+ permissions or meta filled
    const lexicon = buildPermissionSetLexicon(meta, permissions)
    const jsonStr = JSON.stringify(lexicon, null, 2)
    const includeScope = buildIncludeScopeString(meta.nsid || 'your.set.nsid', '{aud}')

    return `
      <div class="space-y-4">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Permission Set Lexicon</span>
            <button
              data-action="copy"
              class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
            >Copy</button>
          </div>
          <pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all overflow-x-auto">${escapeHtml(jsonStr)}</pre>
        </div>

        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">include: scope reference</span>
            <button
              data-action="copy"
              class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
            >Copy</button>
          </div>
          <pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">${escapeHtml(includeScope)}</pre>
        </div>

        <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
          Publish this Lexicon with <code class="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">goat lex publish</code>
        </div>
      </div>`
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  private render() {
    const { permissions, meta, draftResource, draftError } = this.state
    const metaFilled = !!(meta.nsid || meta.title)
    const showSetPrompt = permissions.length >= 2 && !metaFilled

    // Namespace mismatch warning: any permission NSID outside set namespace
    let namespaceMismatch = false
    if (meta.nsid) {
      for (const p of permissions) {
        const nsidToCheck = p.resource === 'repo' ? p.collection : p.resource === 'rpc' ? p.lxm : null
        if (nsidToCheck && nsidToCheck !== '*' && !isInSetNamespace(meta.nsid, nsidToCheck)) {
          namespaceMismatch = true
          break
        }
      }
    }

    const permissionsListHtml =
      permissions.length === 0
        ? `<p class="text-sm text-gray-500 dark:text-gray-400 py-2">No permissions added yet.</p>`
        : permissions
            .map((p) => {
              const scopeStr = buildScopeString(p)
              return `
              <div class="flex items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <code class="text-xs font-mono text-gray-800 dark:text-gray-200 break-all flex-1">${escapeHtml(scopeStr)}</code>
                <button
                  data-action="remove-permission"
                  data-permission-id="${escapeAttr(p.id)}"
                  class="flex-shrink-0 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>`
            })
            .join('')

    const errorHtml = draftError
      ? `<div class="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400">${escapeHtml(draftError)}</div>`
      : ''

    const setPromptHtml = showSetPrompt
      ? `<div class="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
          You have ${permissions.length} permissions. Fill in a set name and title to bundle them as a permission set.
        </div>`
      : ''

    const namespaceMismatchHtml = namespaceMismatch
      ? `<div class="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Warning: one or more permission NSIDs fall outside the namespace of <code class="font-mono">${escapeHtml(meta.nsid)}</code>. Make sure your set NSID covers all permissions.
        </div>`
      : ''

    this.innerHTML = `
      <div class="not-prose font-sans">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          <!-- LEFT PANEL -->
          <div class="space-y-6">

            <!-- Section 1: Permissions list -->
            <section>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Permissions
              </h3>
              <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 min-h-[3rem]">
                ${permissionsListHtml}
              </div>
            </section>

            <!-- Section 2: Add permission form -->
            <section>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Add Permission
              </h3>
              <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resource type</label>
                  <select
                    data-field="draftResource"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ${(['repo', 'rpc', 'blob', 'account', 'identity'] as ResourceType[])
                      .map(
                        (r) =>
                          `<option value="${r}" ${draftResource === r ? 'selected' : ''}>${r}</option>`,
                      )
                      .join('')}
                  </select>
                </div>

                ${this.renderDraftFields()}

                ${errorHtml}

                <button
                  data-action="add-permission"
                  class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  + Add permission
                </button>
              </div>
            </section>

            <!-- Section 3: Permission set metadata -->
            <section>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Permission Set Metadata
              </h3>
              <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
                ${setPromptHtml}

                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Set NSID</label>
                  <input
                    type="text"
                    data-field="meta-nsid"
                    value="${escapeAttr(meta.nsid)}"
                    placeholder="com.example.myApp.permissions"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    data-field="meta-title"
                    value="${escapeAttr(meta.title)}"
                    placeholder="My App Permissions"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    data-field="meta-detail"
                    rows="2"
                    placeholder="Allows My App to read your posts and profile."
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  >${escapeHtml(meta.detail)}</textarea>
                </div>

                ${namespaceMismatchHtml}
              </div>
            </section>

          </div>

          <!-- RIGHT PANEL -->
          <div class="space-y-4 md:sticky md:top-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Output
            </h3>
            ${this.renderOutput()}
          </div>

        </div>
      </div>`
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !customElements.get('permission-author')) {
  customElements.define('permission-author', PermissionAuthorElement)
}

export { PermissionAuthorElement }

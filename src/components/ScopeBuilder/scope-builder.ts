import { permissionSets, individualScopes } from './scopeData'
import { assembleScopeString } from './scopeUtils'
import type { CuratedScope, ScopeResourceType } from './types'

const BORDER_COLOR: Record<ScopeResourceType, string> = {
  atproto: 'border-blue-500',
  include: 'border-amber-500',
  repo: 'border-orange-500',
  rpc: 'border-green-500',
  blob: 'border-purple-500',
  account: 'border-pink-500',
  identity: 'border-red-500',
  transition: 'border-gray-400',
}

const ATPROTO_CARD: CuratedScope = {
  id: 'atproto',
  label: 'Core AT Protocol',
  description: 'Always included — establishes the OAuth session.',
  kind: 'individual',
  resourceType: 'atproto',
  scopeString: 'atproto',
  specLink: '/specs/permission#atproto',
  explanation:
    'Required in every AT Protocol OAuth request. Identifies this as an AT Protocol session and is always prepended to the assembled scope string automatically.',
}

const ALL_SCOPES: CuratedScope[] = [...permissionSets, ...individualScopes]

class ScopeBuilderElement extends HTMLElement {
  private selectedIds = new Set<string>()
  private _handleChange: (e: Event) => void
  private _handleClick: (e: Event) => void

  constructor() {
    super()
    this._handleChange = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        const id = target.dataset.scopeId
        if (!id) return
        if (target.checked) {
          this.selectedIds.add(id)
        } else {
          this.selectedIds.delete(id)
        }
        this._render()
      }
    }
    this._handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-action="copy"]') as HTMLButtonElement | null
      if (btn) {
        const scopeString = btn.dataset.copyText ?? ''
        navigator.clipboard.writeText(scopeString).then(() => {
          const original = btn.textContent
          btn.textContent = 'Copied!'
          btn.disabled = true
          setTimeout(() => {
            btn.textContent = original
            btn.disabled = false
          }, 1500)
        })
      }
    }
  }

  connectedCallback() {
    this.addEventListener('change', this._handleChange)
    this.addEventListener('click', this._handleClick)
    this._render()
  }

  disconnectedCallback() {
    this.removeEventListener('change', this._handleChange)
    this.removeEventListener('click', this._handleClick)
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  private _renderPermissionSetCheckbox(scope: CuratedScope): string {
    const checked = this.selectedIds.has(scope.id) ? 'checked' : ''
    const expandedHtml =
      scope.expandedPermissions && scope.expandedPermissions.length > 0
        ? `<details class="mt-2">
            <summary class="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Bundled permissions (${scope.expandedPermissions.length})
            </summary>
            <ul class="mt-1 pl-3 space-y-0.5">
              ${scope.expandedPermissions
                .map(
                  (p) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">${escapeHtml(p)}</li>`,
                )
                .join('')}
            </ul>
          </details>`
        : ''

    return `
      <label class="flex gap-3 py-3 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input
          type="checkbox"
          class="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600"
          data-scope-id="${scope.id}"
          ${checked}
        />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${escapeHtml(scope.label)}</span>
            <span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
              permission set
            </span>
          </div>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(scope.description)}</p>
          ${expandedHtml}
        </div>
      </label>`
  }

  private _renderIndividualScopeCheckbox(scope: CuratedScope): string {
    const checked = this.selectedIds.has(scope.id) ? 'checked' : ''
    return `
      <label class="flex gap-3 py-3 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input
          type="checkbox"
          class="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600"
          data-scope-id="${scope.id}"
          ${checked}
        />
        <div class="min-w-0">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${escapeHtml(scope.label)}</span>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(scope.description)}</p>
        </div>
      </label>`
  }

  private _renderScopeCard(scope: CuratedScope): string {
    const border = BORDER_COLOR[scope.resourceType] ?? 'border-gray-400'
    const expandedHtml =
      scope.expandedPermissions && scope.expandedPermissions.length > 0
        ? `<details class="mt-2">
            <summary class="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Bundled permissions
            </summary>
            <ul class="mt-1 pl-3 space-y-0.5">
              ${scope.expandedPermissions
                .map(
                  (p) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">${escapeHtml(p)}</li>`,
                )
                .join('')}
            </ul>
          </details>`
        : ''

    return `
      <div class="rounded-lg border-l-4 ${border} bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <code class="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 break-all">${escapeHtml(scope.scopeString)}</code>
        </div>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">${escapeHtml(scope.label)}</p>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">${escapeHtml(scope.explanation)}</p>
        ${expandedHtml}
        <a
          href="${escapeHtml(scope.specLink)}"
          class="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Spec &rarr;
        </a>
      </div>`
  }

  private _render() {
    const selectedScopes = ALL_SCOPES.filter((s) => this.selectedIds.has(s.id))
    const scopeStrings = selectedScopes.map((s) => s.scopeString)
    const assembled = assembleScopeString(scopeStrings)

    // Migration callout: collect unique replacesTransition values
    const replacedTransitions = [
      ...new Set(
        selectedScopes
          .filter((s) => s.replacesTransition)
          .map((s) => s.replacesTransition as string),
      ),
    ]

    const migrationHtml =
      replacedTransitions.length > 0
        ? `<div class="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Migration note</p>
            <p class="text-xs text-amber-700 dark:text-amber-400">
              This selection replaces the following legacy <code class="font-mono">transition:</code> scope${replacedTransitions.length > 1 ? 's' : ''}:
            </p>
            <ul class="mt-1 pl-4 space-y-0.5">
              ${replacedTransitions
                .map(
                  (t) =>
                    `<li class="text-xs font-mono text-amber-700 dark:text-amber-400">${escapeHtml(t)}</li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''

    const outputCards = [ATPROTO_CARD, ...selectedScopes]
      .map((s) => this._renderScopeCard(s))
      .join('')

    this.innerHTML = `
      <div class="not-prose font-sans">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">OAuth Scope Builder</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select the permissions your app needs. The scope string updates live.
          </p>
        </div>

        <!-- Two-panel layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          <!-- LEFT PANEL -->
          <div class="space-y-6">

            <!-- Section 1: Bluesky Permission Sets -->
            <section>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
                Bluesky Permission Sets
              </h3>
              <div class="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                ${permissionSets.map((s) => this._renderPermissionSetCheckbox(s)).join('')}
              </div>
            </section>

            <!-- Section 2: Individual Scopes -->
            <section>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
                Individual Scopes
              </h3>
              <div class="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                ${individualScopes.map((s) => this._renderIndividualScopeCheckbox(s)).join('')}
              </div>
            </section>

            <!-- Section 3: Permission Author pointer -->
            <aside class="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm">
              <p class="font-semibold text-blue-800 dark:text-blue-300">Building a custom permission set?</p>
              <p class="mt-1 text-blue-700 dark:text-blue-400 text-xs">
                If you maintain a Lexicon namespace, you can publish your own permission sets.
                See the <a href="#permission-author" class="underline hover:text-blue-900 dark:hover:text-blue-200">Permission Author guide</a>
                for how to define and register them.
              </p>
            </aside>

          </div>

          <!-- RIGHT PANEL -->
          <div class="space-y-5">

            <!-- Generated scope string -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
              <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Generated scope string</span>
                <button
                  data-action="copy"
                  data-copy-text="${escapeAttr(assembled)}"
                  class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  Copy
                </button>
              </div>
              <pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">${escapeHtml(assembled)}</pre>
            </div>

            <!-- Per-scope explanation cards -->
            <div class="space-y-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Scope details
              </p>
              ${outputCards}
            </div>

            <!-- Migration callout (hidden when empty) -->
            ${migrationHtml}

          </div>
        </div>
      </div>`
  }
}

// ---------------------------------------------------------------------------
// Tiny escape helpers (no DOM dependency)
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
// Registration
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !customElements.get('scope-builder')) {
  customElements.define('scope-builder', ScopeBuilderElement)
}

export { ScopeBuilderElement }

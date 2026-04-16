import { permissionSets, individualScopes } from './scopeData'
import { assembleScopeString } from './scopeUtils'
import type { CuratedScope, ScopeResourceType } from './types'

const BORDER_COLOR: Record<ScopeResourceType, string> = {
  atproto: 'border-l-blue-500',
  include: 'border-l-amber-500',
  repo: 'border-l-orange-500',
  rpc: 'border-l-green-500',
  blob: 'border-l-purple-500',
  account: 'border-l-pink-500',
  identity: 'border-l-red-500',
  transition: 'border-l-gray-400',
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

  private _renderScopeItem(scope: CuratedScope): string {
    const isChecked = this.selectedIds.has(scope.id)
    const checked = isChecked ? 'checked' : ''
    const border = isChecked
      ? `border-l-4 ${BORDER_COLOR[scope.resourceType] ?? 'border-l-blue-500'}`
      : 'border-l-4 border-l-transparent'
    const isSet = scope.kind === 'permission-set'

    const badgeHtml = isSet
      ? `<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">permission set</span>`
      : ''

    const expanded = scope.expandedPermissions
    const repoCount = expanded?.repo?.length ?? 0
    const rpcCount = expanded?.rpc?.length ?? 0
    const totalCount = repoCount + rpcCount

    const repoListHtml =
      repoCount > 0
        ? `<div class="mt-2">
            <div class="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Repo (${repoCount})</div>
            <ul class="mt-0.5 pl-3 space-y-0.5">
              ${expanded!
                .repo!.map(
                  (p) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">repo:${escapeHtml(p.collection)} <span class="text-gray-400 dark:text-gray-500">(${p.actions.join(', ')})</span></li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''

    const rpcListHtml =
      rpcCount > 0
        ? `<div class="mt-2">
            <div class="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">RPC (${rpcCount})</div>
            <ul class="mt-0.5 pl-3 space-y-0.5">
              ${expanded!
                .rpc!.map(
                  (lxm) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">rpc:${escapeHtml(lxm)}</li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''

    const expandedHtml =
      totalCount > 0
        ? `<details class="mt-2">
            <summary class="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Bundled permissions (${totalCount})
            </summary>
            ${repoListHtml}
            ${rpcListHtml}
          </details>`
        : ''

    const specHtml = scope.specLink
      ? `<a href="${escapeHtml(scope.specLink)}" class="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${scope.kind === 'permission-set' ? 'View Lexicon' : 'Spec'} &rarr;</a>`
      : ''

    return `
      <label class="flex gap-3 py-3 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${border}">
        <input
          type="checkbox"
          class="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600"
          data-scope-id="${scope.id}"
          ${checked}
        />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${escapeHtml(scope.label)}</span>
            ${badgeHtml}
          </div>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(scope.description)}</p>
          <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">${escapeHtml(scope.explanation)}</p>
          ${expandedHtml}
          ${specHtml}
        </div>
      </label>`
  }

  private _render() {
    const selectedScopes = ALL_SCOPES.filter((s) => this.selectedIds.has(s.id))
    const scopeStrings = selectedScopes.map((s) => s.scopeString)
    const assembled = assembleScopeString(scopeStrings)

    // Migration callout
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

    this.innerHTML = `
      <div class="not-prose font-sans max-w-2xl">
        <!-- Sticky scope string -->
        <div class="sticky top-14 z-10 -mx-4 px-4 pb-8 pt-4 bg-white dark:bg-zinc-900">
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 rounded-t-xl">
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Generated scope string</span>
              <button
                data-action="copy"
                data-copy-text="${escapeAttr(assembled)}"
                class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              >
                Copy
              </button>
            </div>
            <pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all rounded-b-xl">${escapeHtml(assembled)}</pre>
          </div>
        </div>

        <!-- Permission sets -->
        <section class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
            Bluesky Permission Sets
          </h3>
          <div class="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            ${permissionSets.map((s) => this._renderScopeItem(s)).join('')}
          </div>
        </section>

        <!-- Individual scopes -->
        <section class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
            Individual Scopes
          </h3>
          <div class="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            ${individualScopes.map((s) => this._renderScopeItem(s)).join('')}
          </div>
        </section>

        <!-- Migration callout -->
        ${migrationHtml}

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
